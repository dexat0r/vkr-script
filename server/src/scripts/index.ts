import Web3 from "web3";
import * as dotenv from 'dotenv';

dotenv.config();

export default class Web3Client {
    
    web3: Web3;
    updateTime = 1;
    
    constructor() {
        const apiKey = process.env.INFURA_KEY;
        this.web3 = new Web3(`http://localhost:8545`);
        this.web3.eth.getChainId().then((value) => {
            console.log(`Web3 client initialized at chain with id ${value.toLocaleString()}`)
        })
    }

    async getAllUserTransactions(fromBlock: number, toBlock: number, address: string) {
        try {
            console.log(`Getting transactions from address ${address}. From: ${fromBlock}. To: ${toBlock}`);
            const txs = await this.web3.eth.getPastLogs({
                fromBlock,
                toBlock,
                address
            });
            return txs;
        } catch (error) {
            // console.log(error)
            return [];
        }
    }

    async calculateBlockNumbers(from: number, to: number): Promise<Array<number>> {
        const blocks: number[] = [];
        const currentBlock = await this.web3.eth.getBlockNumber();
        let i = currentBlock;
        do {
            const checkingBlock = await this.web3.eth.getBlock(i);

            console.log(checkingBlock.timestamp)
            i--;
            if (i == 0) break;
        } while(true);
        const currentTime = Date.now();
        blocks.push(
            currentBlock - Math.floor((Math.abs(currentTime - from) / (this.updateTime)) / 1000)
        );
        blocks.push(
            currentBlock - Math.floor((Math.abs(currentTime - to) / (this.updateTime)) / 1000)
        );
        return blocks;
    }

    private async getClosestBlock(timestamp: number) {
        const currentTime = Date.now();
        const currentBlock = await this.web3.eth.getBlockNumber();
        const tryBlock = await this.web3.eth.getBlock(currentBlock - Math.floor((Math.abs(currentTime - timestamp) / (this.updateTime)) / 1000));
        let rotation = 0;
        if (Number(tryBlock.timestamp) * 1000 > timestamp) {
            rotation = -1;
        } else {
            rotation = 1;
        }
        let previousBlock = tryBlock.number;
        while(true) {
            const newTryBlock = await this.web3.eth.getBlock(previousBlock + rotation);
            previousBlock = newTryBlock.number;

            if (Number(newTryBlock.timestamp) * 1000 <= timestamp && rotation < 0) {
                break;
            }
            if (Number(newTryBlock.timestamp) * 1000 >= timestamp && rotation > 0) {
                break;
            }
        }
    }
    





}   