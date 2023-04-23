import { Block } from "./block";
import { Transaction } from "./transaction";

export class Blockchain {
    public readonly chain: Block[];
    readonly difficulty: number;
    public miningReward: number;
    public pendingTransactions: Transaction[];


    constructor(difficulty: number) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.miningReward = 0;
        this.pendingTransactions = [];
    }

    public createGenesisBlock(): Block {
        return new Block(new Date(), [], "0");
    }

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public addBlock(newBlock: Block): void {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    public addTransaction(transaction: Transaction): void {
        if (!transaction.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.getLatestBlock().transactions.push(transaction);
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
    public isChainSynced(latestBlock: Block): boolean {
        const lastBlock = this.getLatestBlock();
        return latestBlock.hash === lastBlock.hash && latestBlock.validate(this.difficulty);
      }
      
}
