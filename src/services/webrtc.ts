import { v4 as uuidv4 } from 'uuid';
import { Message, MessageType } from '../node/messageHandler';
import { BlockchainNode } from '../node/node';


export class WebRtc {

    pc?: RTCPeerConnection;
    dataChannel?: RTCDataChannel;
    recievedOffer: string;
    recievedIceCandidate: string;
    yourOffer: string
    answerFromRemotePeer: string;
    yourIceCandidate: Array<string>;
    yourResponse: string;
    message: string;
    messages: Array<Message>;
    connected: boolean;
    peers: Peer[];
    messageReceivedCallback: Function;
    constructor() {
        this.connected = false;
        this.message = '';
        this.yourIceCandidate = [];
        this.yourResponse = '';
        this.yourOffer = '';
        this.answerFromRemotePeer = '';
        this.recievedIceCandidate = '';
        this.recievedOffer = '';
        this.messages = [];
        this.peers = [];
        this.messageReceivedCallback = ()=>{};

    }

    get yourCompleteOffer() {
        return {
            iceCandidates: this.yourIceCandidate, offer: this.yourOffer,
        }
    }

    get yourCompleteAnswer() {
        return {
            iceCandidates: this.yourIceCandidate, offer: this.yourResponse,
        }
    }


    async createRTCPeerConnection(node: BlockchainNode) {
        const config = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };
        const peerId = uuidv4();
        this.pc = new RTCPeerConnection(config);
        const dataChannel = this.pc.createDataChannel("myDataChannel", { negotiated: true, id: 0 });

        dataChannel.onmessage = (event) => {
            let parsed = JSON.parse(event.data);
            this.messages.push({ data: `Received message: ${parsed.data}`, type: parsed.type });
            node.messageHandler.handleMessage(node, {data: parsed.data, type: parsed.type }, peerId)
        };


        dataChannel.onopen = () => {
            this.peers.push({
                id: peerId,
                dataChannel, 
            })
            console.log("Data channel is open and ready to use");
            this.connected = true;
        };
        dataChannel.onerror = (e) => {
            console.log('error', e)
        };

        dataChannel.onclose = () => {
            const index = this.peers.findIndex(peer => peer.id === peerId);
            if (index !== -1) {
              this.peers.splice(index, 1);
            }
            console.log(`Data channel has been closed with peer ${peerId}`);
            this.connected = false;

        };

         this.pc.onicecandidate = async (event) => {
             if (event.candidate) {
                this.yourIceCandidate.push(JSON.stringify(event.candidate));
            } else {
                console.log("ICE gathering complete");
            }
        };
    }
    async createOfferForRemotePeer() {
        const offer = await this.pc!.createOffer();
        await this.pc!.setLocalDescription(offer);
    
        const offerString = JSON.stringify(offer);
        this.yourOffer = offerString;
    }

    async receiveOfferFromRemotePeer() {
        const offerString = this.recievedOffer; // get the value of the text input field containing the offer string
        const parsedTotalOffer = JSON.parse(offerString); // convert the offer string to an offer object
        const { offer, iceCandidates } = parsedTotalOffer
        await this.pc!.setRemoteDescription(JSON.parse(offer)); // apply the offer to the remote peer's RTCPeerConnection object
        iceCandidates.forEach((candidate: string) => {
            this.pc!.addIceCandidate(JSON.parse(candidate));
        })

        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);

        this.yourResponse = JSON.stringify(this.pc!.localDescription);

    }

    async handleAnswerFromRemotePeer() {
        const offerString = this.answerFromRemotePeer; // get the value of the text input field containing the offer string
        const parsedTotalAnswer = JSON.parse(offerString); // convert the offer string to an offer object
        const { offer, iceCandidates } = parsedTotalAnswer
        await this.pc!.setRemoteDescription(JSON.parse(offer));

        Promise.all(iceCandidates.map(async (candidate: string) => {
            await this.pc!.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)))

        }));
    }
    async sendMessage(peerId: string) {
        const peer = this.peers.find(({ id }) => id === peerId);
        if (peer!.dataChannel!.readyState === "open") {
            try {
                peer!.dataChannel!.send(this.message);
                this.messages.push({ data: `Sent message: ${this.message}`, type: MessageType.TEXT_MESSAGE });

            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.error('Data channel is not open');
        }

    }
    async sendBlockchainMessage(messageType: MessageType, data: string, peerId: string) {
        const peer = this.peers.find(({ id }) => id === peerId);
        if (peer!.dataChannel!.readyState === "open") {
            try {
                peer!.dataChannel!.send(JSON.stringify({ data, type: messageType }));
                this.messages.push({ data, type: messageType });

            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.error('Data channel is not open');
        }


    }
    async closeConnection() {
        if (this.pc) {
            this.pc.close();
            this.pc = undefined;
        }

        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = undefined;
        }

        this.connected = false;
        this.messages = [];


    };
}

 export interface Peer {
     id: string;
     dataChannel: RTCDataChannel;
 }



