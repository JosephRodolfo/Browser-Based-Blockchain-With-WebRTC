
<template>
    <div v-if="!webRtcInstance!.connected">
    <div class="container">
      <div class="border">
        <h3>Your Offer And Ice Candidates</h3>
        <button @click="webRtcInstance!.createOfferForRemotePeer">Create offer and ice candidates</button>
        <p>{{ webRtcInstance!.yourCompleteOffer }}</p>
      </div>
      <div class="border">
        <h3>Received Offer And Ice Candidate</h3>
  
        <label>Input</label>
        <input type="text" v-model="webRtcInstance!.recievedOffer" />
        <h4>Recieved offer</h4>
        <p> {{ webRtcInstance!.recievedOffer }}</p>
        <h4>Your response</h4>
  
        <p>{{ webRtcInstance!.yourCompleteAnswer }}</p>
        <button @click="webRtcInstance!.receiveOfferFromRemotePeer">Receive offer from remote peer</button>
      </div>
      <div class="border">
        <h3>Handle Answer From Remote Peer</h3>
        <input v-model="webRtcInstance!.answerFromRemotePeer" />
        <p>{{ webRtcInstance!.answerFromRemotePeer }}</p>
        <button @click="webRtcInstance!.handleAnswerFromRemotePeer">Handle answer</button>
  
      </div>
    </div>
  </div>
  <div v-else>
    <input v-model="webRtcInstance!.message" type="text" />
    <button @click="webRtcInstance!.sendMessage">Send message</button>
    <div>
      <ul>
        <li v-for="item in webRtcInstance!.messages">
          {{ item.data }}
        </li>
      </ul>
      <ul>
        <li v-for="peer in webRtcInstance!.peers">
          {{ peer.id }}
        </li>
      </ul>
  
    </div>
  </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref, Ref } from 'vue';
  import { WebRtc } from '../services/webrtc';
  import node from '../node';
  let webRtcInstance: Ref<WebRtc> = ref(node.webRtc)
  
  onMounted(async () => {
    await webRtcInstance.value.createRTCPeerConnection(node);
  });
  
  </script>
  
  <style scoped>
  .border {
    border: 1px solid black;
    padding: 1em;
    display: flex;
    flex-direction: column;
  }
  
  p {
    max-width: 20em;
    word-wrap: break-word;
    font-size: 8px;
  }
  
  ul {
    list-style: none;
  }
  
  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: .5em;
    row-gap: .5em;
  }
  </style>