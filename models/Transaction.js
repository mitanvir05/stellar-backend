const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    senderPublicKey: { type: String, required: true },
    receiverPublicKey: { type: String, required: true },
    amount: { type: String, required: true },
    transactionHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
