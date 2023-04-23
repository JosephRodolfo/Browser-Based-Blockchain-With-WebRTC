import { WebRtc, Peer } from "../services/webrtc";
import { Transaction } from "../blockchain/transaction";
import { Blockchain } from "../blockchain/blockchain";
import { Block } from "../blockchain/block";
import { MessageType } from "./messageHandler";

type NodeStatus = 'NEW' | 'SYNCING' | 'PARTICIPATING';
export class Node {
  // peerList: Peer[];
  webRtc: WebRtc;
  miningRewardAddress: string;
  blockchain: Blockchain;
  status: NodeStatus;  
  latestBlock: Block | null;

  constructor(webRtc: WebRtc, miningRewardAdress: string, blockchain: Blockchain) {
    this.webRtc = webRtc;
    this.miningRewardAddress = '';
    this.blockchain = blockchain;
    this.status = 'NEW';
    this.latestBlock = null;
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
    this.blockchain.pendingTransactions.push(rewardTransaction);

    const block = new Block(
      new Date(),
      this.blockchain.pendingTransactions,
      this.blockchain.getLatestBlock().hash
    );

    // mine the block
    await block.mineBlock(this.blockchain.difficulty);

    // add the block to the chain
    this.blockchain.addBlock(block);

    // broadcast the block to peers
    await this.broadcastBlock(block);
    console.log(block);
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
    if (block.previousHash === this.blockchain.getLatestBlock().hash) {
      // add the block to the chain
      this.blockchain.addBlock(block);

      // broadcast the block to other peers
      await this.broadcastBlock(block);
    };
  }

  async handleQueryAll(peerId: string, messageType: MessageType) {
    try {
      await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify(this.blockchain), peerId);
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
      console.log(`error sending blockchain to peer ${peerId}`);
    }

  }

  async handleBlockchainResponse(peerId: string, blockChain: Blockchain) {

    if (blockChain.isChainValid()) {
      console.log(`chain from peer ${peerId} is valid`);

      this.blockchain = blockChain;

    } else {
      console.log(`chain from peer ${peerId} is invalid`);

    };

  }

  async handleResponseLatest(peerId: string, block: Block) {

    return;

  }
  async handleQueryMissingBlocks(peerId: string, lastHash: string, messageType: MessageType) {
    if (!this.blockchain) return;
    const index = this.blockchain.chain.findIndex(block => block.hash === lastHash);

    if (index === -1) {
      throw new Error("Block not found");
    }
  
    const missingBlocks = this.blockchain.chain.slice(index + 1);
    await this.webRtc.sendBlockchainMessage(messageType, JSON.stringify(missingBlocks), peerId);

  }

  async handleResponseMissingBlocks(peerId: string, receivedBlocks: Block[]) {
    if (!this.blockchain) return;
    for (const receivedBlock of receivedBlocks) {
      if (receivedBlock.validate(this.blockchain.difficulty)) {
        this.blockchain.addBlock(receivedBlock);
      } else {
        break;
      }
    }
  }

  start() {
    this.webRtc.createRTCPeerConnection();
  }
  stop() {
    this.webRtc.closeConnection();
  }
  

  async nodeControlFlow() {
    const queryAllPeers = async (messageType: MessageType) => {
      for (const peer of this.peerList) {
        try {
          await this.webRtc.sendBlockchainMessage(messageType, '', peer.id);
        } catch (error) {
          console.log(`Error sending QUERY_ALL message to peer ${peer.id}: ${error}`);
        }
      }
    };
    if (this.status = 'NEW') {
      const intervalId = setInterval(() => {
        if (this.blockchain.isChainValid()) {
          clearInterval(intervalId);
          this.status = 'SYNCING';
          this.nodeControlFlow();
        } else {
          queryAllPeers(MessageType.QUERY_ALL);
        }
      }, 3000);
    } 
    if (this.status = 'SYNCING') {
      const intervalId = setInterval(() => {
        if (!this.latestBlock) return;
          if (this.blockchain.isChainSynced(this.latestBlock)) {
            clearInterval(intervalId);
            this.status = 'SYNCING';
            this.nodeControlFlow();
          } else {
            queryAllPeers(MessageType.QUERY_LATEST);
          }
        
      }, 3000);
    }
  }
  
  

}