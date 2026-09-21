import { app } from './app.js';
// import { connectDatabase } from './shared/config/database.js';
import { Port  }  from './shared/config/env.js';

async function startServer() {
    //await connectDatabase();
    app.listen(Port, async () => {
        console.log(`[server]: Running on port ${Port}`);
    });
}


startServer().catch((err) => {
    console.error('[Server]: Failed to start', err);
    process.exit(1);
})