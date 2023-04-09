
<template>
  <div v-if="!connected">
  <div class="container">
    <div class="border">
      <h3>Your Offer And Ice Candidates</h3>
      <button @click="createOfferForRemotePeer">Create offer and ice candidates</button>
      <p>{{ yourCompleteOffer }}</p>
    </div>
    <div class="border">
      <h3>Received Offer And Ice Candidate</h3>

      <label>Input</label>
      <input type="text" v-model="recievedOffer" />
      <h4>Recieved offer</h4>
      <p> {{ recievedOffer }}</p>
      <h4>Your response</h4>

      <p>{{ yourCompleteAnswer }}</p>
      <button @click="receiveOfferFromRemotePeer">Receive offer from remote peer</button>
    </div>
    <div class="border">
      <h3>Handle Answer From Remote Peer</h3>
      <input v-model="answerFromRemotePeer" />
      <p>{{ answerFromRemotePeer }}</p>
      <button @click="handleAnswerFromRemotePeer">Handle answer</button>

    </div>
  </div>
</div>
<div v-else>
  <input v-model="message" type="text" />
  <button @click="sendMessage">Send message</button>
  <div>
    <ul>
      <li v-for="item in messages">
        {{ item.message }}
      </li>
    </ul>

  </div>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, Ref } from 'vue';


let pc: RTCPeerConnection;
let dataChannel: RTCDataChannel;
const recievedOffer = ref('');
const recievedIceCandidate = ref('');
const hostName = ref('');
const port = ref('');
const yourOffer = ref('');
const answerFromRemotePeer = ref('');
const yourIceCandidate: any = ref([]);
const yourResponse = ref('');
const message = ref('');
const connected = ref(false);
interface Message {
  message: String
}
const messages: Ref<Message[]> = ref([]);

const yourCompleteOffer = computed(() => {
  return {
    iceCandidates: yourIceCandidate.value, offer: yourOffer.value,
  }
});
const yourCompleteAnswer = computed(() => {
  return {
    iceCandidates: yourIceCandidate.value, offer: yourResponse.value,
  }
})
async function createRTCPeerConnection() {
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const pc = new RTCPeerConnection(config);
  dataChannel = pc.createDataChannel("myDataChannel", { negotiated: true, id: 0 });
  // Set up event listeners for the data channel
  dataChannel.onmessage = (event) => {
    messages.value.push({ message: `Received message: ${event.data}` });
  };

  dataChannel.onopen = () => {
    console.log("Data channel is open and ready to use");
    connected.value = true;
  };
  dataChannel.onerror = (e) => {
    console.log('error', e)
  };

  dataChannel.onclose = () => {
    console.log("Data channel has been closed");
    connected.value = false;

  };

  // // Set up ICE gathering
  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      yourIceCandidate.value.push(JSON.stringify(event.candidate));
    } else {
      console.log("ICE gathering complete");
    }
  };

  return pc;
}

async function createOfferForRemotePeer() {

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const offerString = JSON.stringify(offer);

  yourOffer.value = offerString;
}
async function receiveOfferFromRemotePeer() {
  const offerString = recievedOffer.value; // get the value of the text input field containing the offer string
  const parsedTotalOffer = JSON.parse(offerString); // convert the offer string to an offer object
  const { offer, iceCandidates } = parsedTotalOffer
  await pc.setRemoteDescription(JSON.parse(offer)); // apply the offer to the remote peer's RTCPeerConnection object
  iceCandidates.forEach((candidate: string) => {
    pc.addIceCandidate(JSON.parse(candidate));

  })


  // Create an answer and set it as the local description
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // // Send the answer back to the caller
  yourResponse.value = JSON.stringify(pc.localDescription);
}

async function handleAnswerFromRemotePeer() {
  const offerString = answerFromRemotePeer.value; // get the value of the text input field containing the offer string
  const parsedTotalAnswer = JSON.parse(offerString); // convert the offer string to an offer object
  const { offer, iceCandidates } = parsedTotalAnswer
  await pc.setRemoteDescription(JSON.parse(offer));

  Promise.all(iceCandidates.map(async (candidate: string) => {
    await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)))

  }));
}

async function sendMessage() {
  if (dataChannel.readyState === "open") {
    try {
      dataChannel.send(message.value);
      messages.value.push({ message: `Sent message: ${message.value}` });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  } else {
    console.error('Data channel is not open');
  }
}

onMounted(async () => {
  pc = await createRTCPeerConnection();
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
