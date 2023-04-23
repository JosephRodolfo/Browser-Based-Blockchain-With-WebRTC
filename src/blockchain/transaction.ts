import { SHA256 } from "crypto-js";
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class Transaction {
  public fromAddress: string;
  public toAddress: string;
  public amount: number;
  public signature: string;


  constructor(fromAddress: string, toAddress: string, amount: number) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.signature = '';
  }

  public calculateHash(): string {
    const data = this.fromAddress + this.toAddress + this.amount;
    return SHA256(data).toString();
  }

  public signTransaction(signingKey: any): void {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hash = this.calculateHash();
    const signature = signingKey.sign(hash, 'base64');
    this.signature = signature.toDER('hex');
  }

  public isValid(): boolean {
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature found in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}
