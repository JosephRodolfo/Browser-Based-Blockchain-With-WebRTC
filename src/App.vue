
<template>
  <div class="container">
    <div class="border">
      <h3>Your Offer</h3>
      <button @click="createOfferForRemotePeer">Create Offer</button>
      <p>{{ yourOffer }}</p>
    </div>
    <div class="border">
      <h3>Received Offer</h3>

      <label>Offer input</label>
      <input type="text" v-model="recievedOffer" />
      <h4>Recieved offer</h4>
      <p> {{ recievedOffer }}</p>
      <h4>Your response</h4>

      <p>{{ yourResponse }}</p>
      <button @click="receiveOfferFromRemotePeer">Receive offer from remote peer</button>
    </div>
    <div class="border">
      <h3>Your Ice Candidate</h3>
      <p> {{ yourIceCandidate }}</p>
      <!-- <button @click="createIceCandidate">Create ice candidate</button> -->
    </div>
    <div class="border">
      <h3>Receive Ice Candidate</h3>
      <label>Ice candidate input</label>
      <input type="text" v-model="recievedIceCandidate" />
      <p> {{ recievedIceCandidate }}</p>

      <!-- <button @click="recieveIceCandidate">Create ice candidate</button> -->
    </div>
    <div class="border">
      <h3>Handle Answer From Remote Peer</h3>
      <input v-model="answerFromRemotePeer" />
      <p>{{ answerFromRemotePeer }}</p>
      <button @click="handleAnswerFromRemotePeer">Handle answer</button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';


let pc: RTCPeerConnection;
const recievedOffer = ref('');
const recievedIceCandidate = ref('');
const hostName = ref('');
const port = ref('');
const yourOffer = ref('');
const answerFromRemotePeer = ref('');
const yourIceCandidate: any = ref([]);
const yourResponse = ref('');
async function createRTCPeerConnection() {
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const pc = new RTCPeerConnection(config);
  const dataChannel = pc.createDataChannel("myDataChannel");

  // Set up event listeners for the data channel
  dataChannel.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
  };

  dataChannel.onopen = () => {
    console.log("Data channel is open and ready to use");
  };

  dataChannel.onclose = () => {
    console.log("Data channel has been closed");
  };

  // // Set up ICE gathering
  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      yourIceCandidate.value.push(JSON.stringify(event.candidate));
      // Add the ICE candidate to the connection's RTCIceCandidate object
      // pc.addIceCandidate(new RTCIceCandidate(event.candidate))
      //   .catch((error) => console.error(`Failed to add ICE candidate: ${error}`));
    } else {
      console.log("ICE gathering complete");
    }
  };

  return pc;
}

async function createOfferForRemotePeer() {
  pc = await createRTCPeerConnection();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const offerString = JSON.stringify(offer);

  yourOffer.value = offerString;
}



async function receiveOfferFromRemotePeer() {
  const offerString = recievedOffer.value; // get the value of the text input field containing the offer string
  const iceCandidateString = recievedIceCandidate.value;
  const parsedOffer = JSON.parse(offerString); // convert the offer string to an offer object
  const parsedCandidate = JSON.parse(iceCandidateString); // convert the candidate string to a candidate object
  console.log(parsedOffer);

  // Set up the data channel on the remote peer's RTCPeerConnection object
  const dataChannel = pc.createDataChannel("myDataChannel");
  dataChannel.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
  };
  dataChannel.onopen = () => {
    console.log("Data channel is open and ready to use");
  };
  dataChannel.onclose = () => {
    console.log("Data channel has been closed");
  };

  // Add the received ice candidate to the remote peer's RTCPeerConnection object
  await pc.setRemoteDescription(parsedOffer); // apply the offer to the remote peer's RTCPeerConnection object
  parsedCandidate.forEach((candidate: string) => {
    pc.addIceCandidate(JSON.parse(candidate));

  })


  // Create an answer and set it as the local description
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // // Send the answer back to the caller
  yourResponse.value = JSON.stringify(pc.localDescription);
}

async function handleAnswerFromRemotePeer() {
  const answerString = answerFromRemotePeer.value;
  const parsedAnswer = JSON.parse(answerString);
  await pc.setRemoteDescription(parsedAnswer);

  Promise.allSettled(yourIceCandidate.value.map(async (candidate: string) => {
    await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)))

  }));
}


onMounted(async () => {
  pc = await createRTCPeerConnection();

  hostName.value = '127.0.0.1';
  port.value = window.location.port;
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

.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: .5em;
  row-gap: .5em;
}
</style>
