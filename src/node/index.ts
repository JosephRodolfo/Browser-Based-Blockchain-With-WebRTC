import { BlockchainNode } from "./node";
import { Blockchain } from "../blockchain/blockchain";
import { WebRtc } from "../services/webrtc";
import { MessageHandler } from "./messageHandler";
import { Wallet } from "../blockchain/wallet";
const blockChain = new Blockchain(1);
const webrtc = new WebRtc();
const messageHandler = new MessageHandler();
const wallet = new Wallet();
const node = new BlockchainNode(webrtc, 'test', blockChain, messageHandler, wallet);
export default node;



