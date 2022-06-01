import Web3 from "web3";
import * as dotenv from "dotenv";
import { Transaction } from "web3-core";
import ethBlock from "ethereum-block-by-date";

dotenv.config();
interface TxGraph {
    [key: string]: {
        fromTx: Transaction[];
        toTx: Transaction[];
        visited: boolean;
    };
}

interface txDescr {
    from: string,
    to: string
    amount: string,
    blockNumber: number
}

export default class Web3Client {
    web3: Web3;
    updateTime = 5;

    constructor() {
        this.web3 = new Web3(`http://localhost:8545`);
        this.web3.eth.getChainId().then((value) => {
            console.log(
                `Web3 client initialized at chain with id ${value.toLocaleString()}`
            );
        });
    }

    async getAllUserTransactions(
        _txs: Transaction[],
        _address: string
    ): Promise<Transaction[]> {
        const address = this.web3.utils.toChecksumAddress(_address);
        try {
            let txs: Transaction[] = [];
            for (let j = 0; j < _txs.length; j++) {
                if (_txs[j].from == address || _txs[j].to == address) {
                    txs.push(_txs[j]);
                }
            }
            return txs;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async getAllTransactionsFromBlocks(
        fromBlock: number,
        toBlock: number
    ): Promise<Transaction[]> {
        try {
            console.log(
                `Getting transactions... From: ${fromBlock}. To: ${toBlock}`
            );
            let txs: Transaction[] = [];
            for (let i = fromBlock; i < toBlock; i++) {
                const block = await this.web3.eth.getBlock(i);
                if (block != null && block.transactions != null) {
                    for (let j = 0; j < block.transactions.length; j++) {
                        const tx = await this.web3.eth.getTransaction(
                            block.transactions[j]
                        );
                        txs.push(tx);
                    }
                }
            }
            return txs;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async calculateBlockNumbers(
        from: number,
        to: number
    ): Promise<Array<number>> {
        const blocks: number[] = [];
        const eth = new ethBlock(this.web3);
        blocks.push((await eth.getDate(from)).block);
        blocks.push((await eth.getDate(to)).block);
        return blocks;
    }

    async findPairTxs(from: string, to: string, _txs: Transaction[]) {
        try {
            const graph = this.createGraphView(_txs);
            const transferPath: txDescr[] = [];
            const dfc = (currentNode: string, blockNumber: number) => {
                const txsToCheck = graph[currentNode];
                console.log(
                    `DEBUG: current node: ${currentNode}, fromTxs: ${txsToCheck.fromTx}, toTxs: ${txsToCheck.toTx}`
                );

                if (!txsToCheck) {
                    console.log(`DEBUG: No txsToCheck`);
                    return false;
                }

                if (txsToCheck.visited) {
                    console.log(`DEBUG: already visited ${txsToCheck.visited}`);
                    return false;
                }

                if (currentNode == to) {
                    console.log(`DEBUG: node found ${currentNode}`);
                    return true;
                }

                graph[currentNode].visited = true;
                for (let i = 0; i < txsToCheck.fromTx.length; i++) {
                    if (
                        (txsToCheck.fromTx[i].blockNumber as number) >= blockNumber && // check if tx of the node could be after our previous tx
                        txsToCheck.fromTx[i].to && //check if tx is not contract creation 
                        graph[txsToCheck.fromTx[i].to as string] //check if tx has graph view
                    ) {
                        console.log(
                            `DEBUG: graph of checking node`,
                            graph[txsToCheck.fromTx[i].to as string]
                        );
                        if (!graph[txsToCheck.fromTx[i].to as string].visited) {
                            let result = dfc(
                                txsToCheck.fromTx[i].to as string,
                                txsToCheck.fromTx[i].blockNumber as number
                            );
                            if (result) {
                                const txDescr: txDescr = {
                                    from: txsToCheck.fromTx[i].from,
                                    to: (txsToCheck.fromTx[i].to as string),
                                    blockNumber: txsToCheck.fromTx[i].blockNumber as number,
                                    amount: txsToCheck.fromTx[i].value
                                }
                                transferPath.push(txDescr);
                                return true;
                            }
                        }
                    } else {
                        console.log(`DEBUG: Leaf tx`);
                    }
                }
            };

            const result = dfc(from, 0);
            if (result) {
                console.log(transferPath);
                return transferPath.reverse();
            } else {
                return [];
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    private createGraphView(txs: Transaction[]) {
        const graph: TxGraph = {};
        for (let i = 0; i < txs.length; i++) {
            if (!graph[txs[i].from]) {
                graph[txs[i].from] = {
                    fromTx: [],
                    toTx: [],
                    visited: false,
                };
            }
            graph[txs[i].from].fromTx.push(txs[i]);
            if (txs[i].to) {
                if (!graph[txs[i].to as string]) {
                    graph[txs[i].to as string] = {
                        fromTx: [],
                        toTx: [],
                        visited: false,
                    };
                }
                graph[txs[i].to as string].toTx.push(txs[i]);
            }
        }
        return graph;
    }
}
