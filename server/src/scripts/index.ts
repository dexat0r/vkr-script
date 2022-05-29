import Web3 from "web3";
import * as dotenv from 'dotenv';
import { Transaction } from "web3-core"
import ethBlock from 'ethereum-block-by-date';

dotenv.config();

export default class Web3Client {
    
    web3: Web3;
    updateTime = 5;
    
    constructor() {
        const apiKey = process.env.INFURA_KEY;
        this.web3 = new Web3(`http://localhost:8545`);
        this.web3.eth.getChainId().then((value) => {
            console.log(`Web3 client initialized at chain with id ${value.toLocaleString()}`)
        })
    }

    async getAllUserTransactions(fromBlock: number, toBlock: number, _address: string) {
        const address = this.web3.utils.toChecksumAddress(_address)
        try {
            console.log(`Getting transactions from address ${address}. From: ${fromBlock}. To: ${toBlock}`);
            let txs: Transaction[] = []
            for (let i = fromBlock; i < toBlock; i++) {
                const block = await this.web3.eth.getBlock(i);
                console.log(block.number, block.transactions.length);
                if (block != null && block.transactions != null) {
                    for (let j = 0; j < block.transactions.length; j++) {
                        const tx = await this.web3.eth.getTransaction(block.transactions[j]);
                        if (tx.from == address || tx.to == address) {
                            txs.push(tx);
                        }
                    }
                }
            }
            return txs;
        } catch (error) {
            console.log(error)
            return [];
        }
    }

    async calculateBlockNumbers(from: number, to: number): Promise<Array<number>> {
        const blocks: number[] = [];
        const eth = new ethBlock(this.web3);
        blocks.push(
            (await eth.getDate(from)).block
        );
        blocks.push(
            (await eth.getDate(to)).block
        );
        return blocks;
    }

    // private async getClosestBlock(timestamp: number) {
    //     const currentTime = Date.now();
    //     const currentBlock = await this.web3.eth.getBlockNumber();
    //     const tryBlock = await this.web3.eth.getBlock(currentBlock - Math.floor((Math.abs(currentTime - timestamp) / (this.updateTime)) / 1000));
    //     let rotation = 0;
    //     if (Number(tryBlock.timestamp) * 1000 > timestamp) {
    //         rotation = -1;
    //     } else {
    //         rotation = 1;
    //     }
    //     let previousBlock = tryBlock.number;
    //     while(true) {
    //         const newTryBlock = await this.web3.eth.getBlock(previousBlock + rotation);
    //         previousBlock = newTryBlock.number;
    //         console.log(previousBlock, Number((await this.web3.eth.getBlock(previousBlock)).timestamp) * 1000, timestamp);

    //         if (Number(newTryBlock.timestamp) * 1000 <= timestamp && rotation < 0) {
    //             break;
    //         }
    //         if (Number(newTryBlock.timestamp) * 1000 >= timestamp && rotation > 0) {
    //             break;
    //         }
    //     }
    //     return previousBlock
    // }

    





}   