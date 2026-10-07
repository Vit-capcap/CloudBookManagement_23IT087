const express = require("express");

const {
    getBooks,
    createBook
} = require("../controllers/bookController");

const router = express.Router();

// Danh sách sách
router.get("/", getBooks);

// Thêm sách
router.post("/", createBook);

module.exports = router;