import { Block } from "./block";

export class Validation {
  static isValidChain(chain: Block[]): boolean {
    // Check that the genesis block is valid
    const genesisBlock = chain[0];
    if (!Validation.isValidBlock(genesisBlock)) {
      return false;
    }

    // Check that each subsequent block is valid and has the correct previous hash
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const previousBlock = chain[i - 1];

      if (!Validation.isValidBlock(block) || block.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    // If all checks pass, the chain is valid
    return true;
  }

  static isValidBlock(block: Block): boolean {
    const hash = block.calculateHash();
    if (hash !== block.hash) {
      return false;
    }

    return true;
  }
}
