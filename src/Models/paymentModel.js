const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const paymentSchema = new mongoose.Schema({
    orderId: {
        type: ObjectId,
        ref: 'order',
        required: true
    },
    paymentOption: {
        type: String,
        enum: ["Upi", "netBanking"],
        required:true,
        trim:true
    },
    totalAmount: {
        type: Number,
        required: true,
        trim: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'canceled'],
        trim: true
    },
}, { timestamps: true })


module.exports = mongoose.model('payment', paymentSchema)