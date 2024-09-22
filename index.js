require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server, Networks, TransactionBuilder, BASE_FEE, Operation, Asset, Keypair } = require('stellar-sdk');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stellarDB';
const server = new Server('https://horizon-testnet.stellar.org');

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Route to send Stellar payment
app.post('/send-payment', async (req, res) => {
    const { senderPublicKey, senderSecretKey, receiverPublicKey, amount } = req.body;

    try {
        // Load sender's account from the Stellar network
        const senderAccount = await server.loadAccount(senderPublicKey);

        // Create a transaction
        const transaction = new TransactionBuilder(senderAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
            .addOperation(Operation.payment({
                destination: receiverPublicKey,
                asset: Asset.native(), // XLM is the native asset
                amount: amount
            }))
            .setTimeout(30) // Transaction expires in 30 seconds
            .build();

        // Sign the transaction with the sender's secret key
        const senderKeypair = Keypair.fromSecret(senderSecretKey);
        transaction.sign(senderKeypair);

        // Submit the transaction to the Stellar network
        const transactionResult = await server.submitTransaction(transaction);
        
        // Save transaction to MongoDB
        const newTransaction = new Transaction({
            senderPublicKey,
            receiverPublicKey,
            amount,
            transactionHash: transactionResult.hash,
            createdAt: new Date()
        });

        await newTransaction.save();

        // Respond with the transaction result
        res.json({ transactionResult });
    } catch (error) {
        console.error('Transaction failed:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
