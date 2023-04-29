import { WebRtc, Peer } from "../services/webrtc";
import { Transaction } from "../blockchain/transaction";
import { Blockchain } from "../blockchain/blockchain";
import { Block } from "../blockchain/block";
import { MessageHandler, MessageType } from "./messageHandler";
import { Wallet } from "../blockchain/wallet";
import { ExternalBlock } from "../blockchain/externalBlock";
import { parse } from "uuid";


type NodeStatus = 'NEW' | 'SYNCING' | 'PARTICIPATING';
export class BlockchainNode {
  // peerList: Peer[];
  webRtc: WebRtc;
  miningRewardAddress: string;
  blockchain: Blockchain;
  status: NodeStatus;
  latestBlock: Block | null;
  messageHandler: MessageHandler
  wallet: Wallet;

  constructor(webRtc: WebRtc, miningRewardAdress: string, blockchain: Blockchain, messageHandler: MessageHandler, wallet: Wallet) {
    this.webRtc = webRtc;
    this.blockchain = blockchain;
    this.status = 'NEW';
    this.latestBlock = null;
    this.messageHandler = messageHandler;
    this.wallet = wallet;
    this.miningRewardAddress = this.wallet.publicKey;
  }
  get peerList() {
    return this.webRtc.peers
  }
  get connected() {
    return this.peerList.length > 0;
  }
  public async mineBlock(): Promise<void> {
    if (!this.blockchain) return;
    const rewardTransaction = new Transaction(
      "system",
      this.miningRewardAddress,
      this.blockchain.miningReward
    );
    //temporary add signature;

    this.blockchain.pendingTransactions.push(rewardTransaction);

    const block = new Block(
      new Date(),
      this.blockchain.pendingTransactions,
      this.blockchain.getLatestBlock()!.hash
    );

    // mine the block
    await block.mineBlock(this.blockchain.difficulty);

    // add the block to the chain
    this.blockchain.addBlock(block);

    // broadcast the block to peers
    await this.broadcastBlock(block);
    // console.log(block);
    // reset pending transactions
    this.blockchain.pendingTransactions = [];
  }

  private async broadcastBlock(block: Block): Promise<void> {
    // broadcast the block to all connected peers
    for (const peer of this.peerList) {
      // await peer.receiveBlock(block);
    }
  }


  public async receiveBlock(block: Block): Promise<void> {
    if (!this.blockchain) return;
    // check if the block is valid
    if (block.previousHash === this.blockchain.getLatestBlock()!.hash) {
      // add the block to the chain
      this.blockchain.addBlock(block);

      // broadcast the block to other peers
      await this.broadcastBlock(block);
    };
  }

  async handleQueryAll(peerId: string, messageType: MessageType) {
    console.log('calling handleQuery all', peerId, messageType);

    try {
      console.log(peerId, messageType);
      await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify({ blockchain: this.blockchain, length: this.blockchain.chain.length }), peerId);
    }
    catch {
      console.log(`Error sending blockchain to peer ${peerId}`);
    }
  }
  async handleQueryLatest(peerId: string, messageType: MessageType) {
    if (!this.blockchain) return;
    try {
      await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify(this.blockchain.getLatestBlock()), peerId);
    }
    catch {
      console.log(`error sending latest block to peer ${peerId}`);
    }

  }

  async handleBlockchainResponse(peerId: string, blockChain: string) {
    const parsed = JSON.parse(blockChain).blockchain;
    const blockchain = new Blockchain(parsed.difficulty);
    blockchain.miningReward = parsed.miningReward;
    blockchain.pendingTransactions = parsed.pendingTransactions;

    // Create an array to hold the converted blocks

    // Loop through each block in the received chain and convert it


    for (const blockData of parsed.chain) {
      const block = new Block(
        new Date(blockData.timestamp),
        blockData.transactions,
        blockData.previousHash
      );
      block.hash = blockData.hash;
      block.nonce = blockData.nonce;
      blockchain.addBlockFromSync(block);
    }

    if (blockchain.isChainValid() && blockchain.chain.length > 0) {
      console.log(`chain from peer ${peerId} is valid`);

      this.blockchain = blockchain;

    } else {
      console.log(`chain from peer ${peerId} is invalid`);
    }
  }


  async handleResponseLatest(peerId: string, latestBlock: string) {
    const parsedBlock = JSON.parse(latestBlock);
    console.log('node recieve latest block', parsedBlock);
      const transactions: Transaction[] = parsedBlock.transactions.map((el: Transaction) => {

        const transaction = new Transaction(el.fromAddress, el.toAddress, el.amount);    
        return transaction;

      })

    const block = new ExternalBlock(
      new Date(parsedBlock.timestamp),
      transactions,
      parsedBlock._previousHash,
      parsedBlock.nonce,
      parsedBlock.hash,
    );

    this.latestBlock = block as Block;
    console.log('node recieve latest block', this.latestBlock);
  }
  async handleQueryMissingBlocks(peerId: string, lastHash: string, messageType: MessageType) {
    const parsed = JSON.parse(lastHash);
    if (!this.blockchain) return;
    const index = this.blockchain.chain.findIndex(block => block.hash === parsed.hash);

    if (index === -1) {
      throw new Error("Block not found");
    }

    const missingBlocks = this.blockchain.chain.slice(index + 1);
    await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify({ blocks: missingBlocks, length: this.blockchain.chain.length }), peerId);

  }

  async handleResponseMissingBlocks(peerId: string, receivedBlocks: string) {

    const parsedRecievedBlocks = JSON.parse(receivedBlocks).blocks;
    if (!this.blockchain) return;
    for (const [index, receivedBlock] of parsedRecievedBlocks.entries()) {
      const transactions: Transaction[] = receivedBlock.transactions.map((el: Transaction) => {

        const transaction = new Transaction(el.fromAddress, el.toAddress, el.amount);    
        return transaction;

      })
      console.log('recieved block', receivedBlock);
      const block = new ExternalBlock(
        new Date(receivedBlock.timestamp),
        transactions,
        receivedBlock._previousHash,
        receivedBlock.nonce,
        receivedBlock.hash,
      );
      console.log('validatign block', block);
      if (block.validate(this.blockchain.difficulty)) {
        this.blockchain.addBlockFromSync(block as Block);

      } else {
        console.log('Recieved blocks not valid');
        break;
      }
    }
    
    // if (blocks.length === parsedRecievedBlocks.length) {
    //   for (const block of blocks) {
    //     this.blockchain.addBlockFromSync(block);
    //   }
    // }
  }

  start() {
    this.webRtc.createRTCPeerConnection();
    this.nodeControlFlow();
  }
  stop() {
    this.webRtc.closeConnection();
  }


  async nodeControlFlow() {
    const queryAllPeers = async (messageType: MessageType, { hash, length }: { length: number, hash: string }) => {
      for (const peer of this.peerList) {
        try {
          await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify({ hash, length }), peer.id);
        } catch (error) {
          console.log(`Error sending QUERY_ALL message to peer ${peer.id}: ${error}`);
        }
      }
    };
    if (this.status === 'NEW') {

      if (this.peerList.length === 0) {
        console.log('no peers found');
        // return;
      }
      const intervalId = setInterval(async () => {
        console.log('querying', this.blockchain.chain.length);

        if (this.blockchain.isChainValid() && this.blockchain.chain.length > 0) {
          console.log('syncing', this.blockchain.chain.length);
          this.status = 'SYNCING';
          clearInterval(intervalId);
          this.nodeControlFlow();
        } else {
          await queryAllPeers(MessageType.QUERY_ALL, { hash: '', length: this.blockchain.chain.length });
        }
      }, 4000);
    }
    if (this.status === 'SYNCING') {
      const intervalId = setInterval(() => {
        // console.log('getting latest block');
        queryAllPeers(MessageType.QUERY_LATEST, { hash: '', length: this.blockchain.chain.length });
        if (this.blockchain.isChainSynced(this.latestBlock!)) {
          console.log('chain is synced')

          clearInterval(intervalId);
          this.status = 'SYNCING';
          this.nodeControlFlow();
        } else {
          console.log('querying all peers for latest block');
          setTimeout(() => {
            queryAllPeers(MessageType.QUERY_MISSING_BLOCKS, { hash: this.blockchain.getLatestBlock()?.hash || '', length: this.blockchain.chain.length });

          }, 100);
        }

      }, 4000);
    }
    if (this.status === 'PARTICIPATING') {
      console.log('participating');
            }
  }



}