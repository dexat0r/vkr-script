import Application from "./express";
import routers from "./routers";

async function main() {

    const app = new Application({
        port: 3000,
        routes: routers,
        middlewares: []
    });

    await app.listen();
}

main();