
//temporary
import { ec as EC } from 'elliptic';
import { Blockchain } from './blockchain';
export class Wallet {
    privateKey: string;
    publicKey: string;
    constructor() {
        const ec = new EC('secp256k1');
        const keyPair = ec.genKeyPair();
        this.privateKey = keyPair.getPrivate('hex');
        this.publicKey = keyPair.getPublic('hex');
    }
    calculateBalance(blockchain: Blockchain, address: string) {
        return blockchain.chain.reduce((acc, curr) => {
            return acc + curr.transactions.reduce((accTwo, currTwo) => {
                let amount = currTwo.amount;
                if (currTwo.toAddress === address) {
                    return accTwo + currTwo.amount;
                }
                if (currTwo.fromAddress === address) {
                    return accTwo - currTwo.amount;
                }
                return accTwo;
            }, 0)


        }, 0)
    }
}