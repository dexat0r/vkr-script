import { Request, Response, Router } from 'express';
import createHttpError from 'http-errors';
import Web3Client from '../../scripts';

class ETHController {
    
    web3: Web3Client

    constructor() {
        this.web3 = new Web3Client();
    }

    getUserTxs = async (req: Request, res: Response) => {
        try {
            let {
                address, 
                from,
                to
            } = req.body;
    
            if (!address && !from && !to) {
                throw new createHttpError.BadRequest();
            }

            if (isNaN(Number(from)) || isNaN(Number(to))) {
                throw new createHttpError.BadRequest();
            }

            if (to > Date.now()) to = Date.now()

            const [uFrom, uTo] = await this.web3.calculateBlockNumbers(Number(from),Number(to));
    
            try {
                const txs = await this.web3.getAllUserTransactions(uFrom, uTo, address);
                res.status(200).json(txs);
            } catch (error: any) {
                throw new createHttpError.ServiceUnavailable(error);
            }
        } catch (error: any) {
            console.log(error);
            res.status(error.status).json(error.message);
        }
    }
}

export default class ETHRouter {
    path = "/eth"
    router = Router();

    constructor() {
        const eth = new ETHController();

        this.router.post('/', eth.getUserTxs);
    }
}