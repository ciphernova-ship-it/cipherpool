const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    maker: {
        type: String,
        required: true
    },
    sourceToken: {
        type: String,
        required: true
    },
    destToken: {
        type: String,
        required: true
    },
    ciphertext: {
        type: String,
        required: true
    },
    dataToEncryptHash: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});


module.exports = mongoose.connection
    .useDb("cipherpool")
    .model("order", orderSchema);