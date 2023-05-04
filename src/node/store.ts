import { defineStore } from 'pinia'
import { BlockchainNode } from "./node";
import { Blockchain } from "../blockchain/blockchain";
import { Block } from '../blockchain/block';
import { WebRtc } from "../services/webrtc";
import { MessageHandler } from "./messageHandler";
import { Wallet } from "../blockchain/wallet";

export const useNodeStore = defineStore('node', {
  state: () => ({
    node: null as BlockchainNode | null,
  }),

  getters: {
      getNode(state): BlockchainNode {
      return state.node!;
      },
      getWebRtc(state): WebRtc {
          return state.node?.webRtc!;
      },
      getChain(state): Block[] {
          return state.node?.blockchain.chain!;
      }
  },
  actions: {
    createNode() {
        const blockChain = new Blockchain(1);
        const webrtc = new WebRtc();
        const messageHandler = new MessageHandler();
        const wallet = new Wallet();
        this.node = new BlockchainNode(webrtc, 'test', blockChain, messageHandler, wallet);
      },
      async initializeNode() {
          await this.node!.webRtc.createRTCPeerConnection(this.node!);
          await this.node!.nodeControlFlow();
      },

    destroyNode() {
      // destroy the Node instance
      this.node = null
    },
  },
})

