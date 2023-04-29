import { BlockchainNode } from "./node";
import { Block } from "../blockchain/block";
import { Blockchain } from "../blockchain/blockchain";
import { Transaction } from "../blockchain/transaction";

export enum MessageType {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
  RESPONSE_LATEST,
  // INVALID_TRANSACTION,
  // INVALID_BLOCK
  TEXT_MESSAGE,
  QUERY_MISSING_BLOCKS,
  RESPONSE_MISSING_BLOCKS,
}

export interface Message {
  type: MessageType;
  data: Block[] | Block | Transaction | string | Blockchain;
}

export class MessageHandler {


  constructor() {
  }

  public handleMessage(node: BlockchainNode, message: Message, peerId: string): void {
    const parsed = JSON.parse(message.data as string);

    console.log(message.type);
    const isPeerBehind = parsed.length < node.blockchain.chain.length;
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        if (!isPeerBehind) {
          break
        } else
          console.log('QUERY_LATEST_RECIEVED');
        node.handleQueryLatest(peerId, MessageType.RESPONSE_LATEST);
        break;
      case MessageType.QUERY_ALL:
        if (!isPeerBehind) {
          break;
        } else
          console.log('QUERY ALL RECIEVED');

        node.handleQueryAll(peerId, MessageType.RESPONSE_BLOCKCHAIN);
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        console.log('RESPONSE_BLOCKCHAIN RECIEVED', isPeerBehind);

        if (isPeerBehind) {
          break;
        } else
          console.log('RESPONSE_BLOCKCHAIN RECIEVED');

        node.handleBlockchainResponse(peerId, message.data as string);
        break;
      case MessageType.RESPONSE_LATEST:
        if (isPeerBehind) {
          break;
        } else
          console.log('RESPONSE_LATEST_RECIEVED');

        node.handleResponseLatest(peerId, message.data as string);
        break;
      case MessageType.QUERY_MISSING_BLOCKS:
        if (!isPeerBehind) {
          break;
        } else
          node.handleQueryMissingBlocks(peerId, message.data as string, MessageType.RESPONSE_MISSING_BLOCKS);
        break;
      case MessageType.RESPONSE_MISSING_BLOCKS:
        if (isPeerBehind) {
          break;
        } else
          node.handleResponseMissingBlocks(peerId, message.data as string);
        break;
      // case MessageType.INVALID_TRANSACTION:
      //   this.node.handleInvalidTransaction(message.data as Transaction, peerId);
      //   break;
      // case MessageType.INVALID_BLOCK:
      //   this.node.handleInvalidBlock(message.data as Block, peerId);
      //   break;
      default:
        console.log("Received unknown message type:", message.type);
        break;
    }
  }
}
