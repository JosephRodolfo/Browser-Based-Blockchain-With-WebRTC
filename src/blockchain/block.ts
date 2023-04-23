import { SHA256 } from "crypto-js";
import { Transaction } from "./transaction";

export class Block {
  public readonly timestamp: Date;
  public readonly transactions: Transaction[];
  public _previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(timestamp: Date, transactions: any[], previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = [];
    this._previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
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
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  public mineBlock(difficulty: number): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
  public validate(difficulty: number): boolean {
    // Validate the block
    const hash = this.calculateHash();
    if (hash !== this.hash) {
      // The block's hash is incorrect
      return false;
    }

    if (this.transactions.some(tx => !tx.isValid())) {
      // A transaction in the block is invalid
      return false;
    }

    if (this.previousHash !== this.hash) {
      // The previous block's hash does not match
      return false;
    }

    if (this.timestamp <= new Date(this.timestamp.getTime() - 60000)) {
      // The block's timestamp is invalid (more than 1 minute in the past)
      return false;
    }

    const hashPrefix = '0'.repeat(difficulty);
    if (!this.hash.startsWith(hashPrefix)) {
      // The block's difficulty is invalid
      return false;
    }

    return true;
  }
}
