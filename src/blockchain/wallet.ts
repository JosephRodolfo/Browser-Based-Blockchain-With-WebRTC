
//temporary
import { ec as EC } from 'elliptic';
export class Wallet {
    privateKey: string;
    publicKey: string;
    constructor() {
        const ec = new EC('secp256k1');
        const keyPair = ec.genKeyPair();
        this.privateKey = keyPair.getPrivate('hex');
        this.publicKey = keyPair.getPublic('hex');
    }
}