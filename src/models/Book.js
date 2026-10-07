const mongoose = require("mongoose");
const {
    readConnection,
    writeConnection
} = require("../config/database");

// ==========================================
// BOOK SCHEMA
// ==========================================

const bookSchema = new mongoose.Schema(
    {
        productCode: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        author: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        vat: {
            type: Number,
            required: true
        },

        priceAfterTax: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true,
        collection: "books"
    }
);

// ==========================================
// READ MODEL
// ==========================================

const BookRead = readConnection.model(
    "BookRead",
    bookSchema
);

// ==========================================
// WRITE MODEL
// ==========================================

const BookWrite = writeConnection.model(
    "BookWrite",
    bookSchema
);

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    BookRead,
    BookWrite
};