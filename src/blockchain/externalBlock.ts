import { Transaction } from "./transaction";
import { SHA256 } from "crypto-js";


export class ExternalBlock {
    public readonly timestamp: Date;
    public readonly transactions: Transaction[];
    public readonly previousHash: string;
    public readonly hash: string;
    public readonly nonce: number;
  
    constructor(
      timestamp: Date,
      transactions: Transaction[],
      previousHash: string,
      nonce: number,
      hash: string
    ) {
      this.timestamp = timestamp;
      this.transactions = transactions;
      this.previousHash = previousHash;
      this.nonce = nonce;
      this.hash = hash;
    }
    public calculateHash(): string {
        return SHA256(
          this.previousHash +
            JSON.stringify(this.timestamp) +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
      }
  
    public validate(difficulty: number): boolean {
        // Validate the block
        const hash = this.calculateHash();
        if (hash !== this.hash) {
          // The block's hash is incorrect
          console.log('hash fails');
          return false;
        }
    
        if (this.transactions.some(tx => !tx.isValid())) {
          console.log('transactions failed');
          // A transaction in the block is invalid
          return false;
        }
    
        // if (this.previousHash !== this.hash) {
        //   console.log('previous hash failed');
        //   // The previous block's hash does not match
        //   return false;
        // }
    
        if (this.timestamp <= new Date(this.timestamp.getTime() - 60000)) {
          console.log('timestamp failed ');
          return false;
        }
    
        const hashPrefix = '0'.repeat(difficulty);
        if (!this.hash.startsWith(hashPrefix)) {
          console.log('difficulty failed failed');
    
          // The block's difficulty is invalid
          return false;
        }
    
        return true;
      }  }
  