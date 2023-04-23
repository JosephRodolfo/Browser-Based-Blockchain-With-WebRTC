import { Node } from "./node";
import { Blockchain } from "../blockchain/blockchain";
import { WebRtc } from "../services/webrtc";
import { MessageHandler } from "./messageHandler";
const blockChain = new Blockchain(1);
const webrtc = new WebRtc();
const node = new Node(webrtc, 'test', blockChain);
const messageHandler = new MessageHandler(node);
node.webRtc.messageReceivedCallback = messageHandler.handleMessage;

export default node;



