import express, { Application as App, Router } from "express";

interface Route {
    path: string;
    router: Router
}

export default class Application {
    public port: number;
    private app: App;

    constructor(options: {port: number, routes: Array<Route>, middlewares: Array<any>}) {
        const { port, routes, middlewares } = options;
        this.port = port || 3000;
        this.app = express();  
        this.app.use(express.json())    
        this.routers(routes);
        this.middlewares(middlewares);
    }

    private routers(routes: Array<Route>): void {
        routes.forEach((route) => {
            this.app.use(route.path || "/", route.router);
        })
    }

    private middlewares(middlewares: Array<any>): void {
        middlewares.forEach(mdwr => {
            this.app.use(mdwr);
        }) 
    }

    public async listen(): Promise<void> {
        await new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`App started at http://localhost:${this.port}`);
                resolve(true);
            })
        })
    }
}