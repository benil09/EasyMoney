import { app } from './app.js';
// import { connectDatabase } from './shared/config/database.js';
import { Port } from './shared/config/env.js';
import { closePrismaClients, getShard1Client, getShard2Client } from './shared/database/prisma.client.js';

// initialize prisma clients
async function initDB(): Promise<void> {
    try {
        getShard1Client();
        getShard2Client();
    } catch (error) {
        console.error("Failed to initializeDB", error);
        process.exit(1);
    }

}

initDB().then(() => {
    app.listen(Port, async () => {
        console.log(`[server]: Running on port ${Port}`);
    });
})

process.on('SIGTERM',async ()=>{
    console.log("SIGTERM signal received");
    await closePrismaClients();
    process.exit(0);
})

process.on('SIGINT',async ()=>{
    console.log("SIGINT signal received");
    await closePrismaClients();
    process.exit(0);
})

