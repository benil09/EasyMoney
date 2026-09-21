// Configures the setting for the express app object

import express, { Express } from 'express';
import { errorHandler } from './shared/middlewares/error-handler';
import walletRoute from './api-gateway/routes/wallet.routes'
import transactionRoute from './api-gateway/routes/transaction.routes'

const app: Express = express();

app.use(express.json()); // this will help express to deserialize the request body (JSON) into a JavaScript object
app.use(express.text());
app.use(express.urlencoded());

// Custom routes
app.get('/health', (_req, res) => {
    //console.log("Executed health route");
    res.status(200).json({
        status: 'ok!',
        timestamp: new Date().toISOString()
    })

});


// Express router based routes
app.use("/api/wallets",walletRoute)
app.use("/api/transactions",transactionRoute)



// at the last we mention our error handling middleware -> this middleware will run if there is any error or any exception 
// occurs -> so it will stop further execution of the program and handle the error and send the response to the client 
app.use(errorHandler);
export { app };

