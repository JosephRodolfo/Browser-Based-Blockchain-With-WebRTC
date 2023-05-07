import { Block } from "./block";
import { Transaction } from "./transaction";

export class Blockchain {
    public chain: Block[];
    readonly difficulty: number;
    public miningReward: number;
    public pendingTransactions: Transaction[];


    constructor(difficulty: number) {
        this.chain = [];
        this.difficulty = difficulty;
        this.miningReward = 0;
        this.pendingTransactions = [];
    }

    public createGenesisBlock(): Block {
        return new Block(new Date(), [], "0");
    }

    public getLatestBlock(): Block | null {
        if (this.chain.length > 0) {
            return this.chain[this.chain.length - 1];
        } else {
            return null;
        }
    }
      
    public addBlock(newBlock: Block): void {
        newBlock.previousHash = this.getLatestBlock()?.hash || '0';
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    public addBlockFromSync(newBlock: Block): void {
        newBlock.previousHash = this.getLatestBlock()?.hash || '0';
        this.chain.push(newBlock);
    }

    public addTransaction(transaction: Transaction): void {
        if (!transaction.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.getLatestBlock()!.transactions.push(transaction);
    }

    public isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
    public isChainSynced(latestBlock: Block | null): boolean {
        const lastBlock = this.getLatestBlock();
        if (!latestBlock || !lastBlock) return false;
        return latestBlock.hash === lastBlock.hash && latestBlock.validate(this.difficulty, lastBlock.previousHash);
      
    }
}
