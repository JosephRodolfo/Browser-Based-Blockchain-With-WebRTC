import { SHA256 } from "crypto-js";
import { Transaction } from "./transaction";
import { Blockchain } from "./blockchain";

export class Block {
  public readonly timestamp: Date;
  public readonly transactions: Transaction[];
  public _previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(timestamp: Date, transactions: Transaction[], previousHash = "0") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this._previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  public get previousHash(): string {
    return this._previousHash;
  }

  public set previousHash(value: string) {
    this._previousHash = value;
    this.hash = this.calculateHash();
  }

  public calculateHash(): string {
    return SHA256(
      this.previousHash +
        JSON.stringify(this.timestamp) +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

// public async mineBlock(difficulty: number): Promise<void> {
//   return new Promise((resolve) => {
//     const mine = (): void => {
//       if (
//         this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
//       ) {
//         this.nonce++;
//         this.hash = this.calculateHash();
//         setTimeout(mine, 0); // Delay execution to allow other tasks to run
//       } else {
//         // Block mined
//         resolve();
//       }
//     };

//     mine(); // Start mining process
//   });
// }

public mineBlock(difficulty: number): void {
  while (
    this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
  ) {
    this.nonce++;
    this.hash = this.calculateHash();
  }
  // console.log(`Block mined: ${this.hash}`);
}
  public validate(difficulty: number, previousHash: string): boolean {
    // Validate the block
    const hash = this.calculateHash();
    if (hash !== this.hash) {
      // The block's hash is incorrect
    //   console.log('hash fails');
      return false;
    }

    if (this.transactions.some(tx => !tx.isValid())) {
    //   console.log('transactions failed');
      // A transaction in the block is invalid
      return false;
    }

    if (previousHash && previousHash !== this.previousHash) {
      console.log('previous hash failed');
      // The previous block's hash does not match
      return false;
    }

    if (this.timestamp <= new Date(this.timestamp.getTime() - 60000)) {
    //   console.log('timestamp failed ');
      return false;
    }

    const hashPrefix = '0'.repeat(difficulty);
    if (!this.hash.startsWith(hashPrefix)) {
    //   console.log('difficulty failed failed');

      // The block's difficulty is invalid
      return false;
    }

    return true;
  } 
}
