import { Node } from "./node";
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
  private node: Node;

  constructor(node: Node) {
    this.node = node;
  }

  public handleMessage(message: Message, peerId: string): void {
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        this.node.handleQueryLatest(peerId, MessageType.RESPONSE_LATEST);
        break;
      case MessageType.QUERY_ALL:
        this.node.handleQueryAll(peerId, MessageType.RESPONSE_BLOCKCHAIN);
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        this.node.handleBlockchainResponse(peerId, message.data as Blockchain);
        break;
        case MessageType.RESPONSE_LATEST:
          this.node.handleResponseLatest(peerId, message.data as Block);
          break;
        case MessageType.QUERY_MISSING_BLOCKS:
          this.node.handleQueryMissingBlocks(peerId, message.data as string, MessageType.RESPONSE_MISSING_BLOCKS);
        break;
        case MessageType.RESPONSE_MISSING_BLOCKS:
          this.node.handleResponseMissingBlocks(peerId, message.data as Block[]);
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
