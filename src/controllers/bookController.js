const { BookRead, BookWrite } = require("../models/Book");

// ==========================================
// CẤU HÌNH
// ==========================================

const VAT = 11;
const MSSV_PREFIX = "087";

// ==========================================
// FORMAT TIỀN
// ==========================================

function formatMoney(value) {
    return Number(value).toLocaleString("vi-VN");
}

// ==========================================
// GET DANH SÁCH SÁCH
// GET /books
// ==========================================

const getBooks = async (req, res) => {
    try {
        const books = await BookRead
            .find()
            .sort({ createdAt: -1 })
            .lean();

        // Format dữ liệu để Handlebars hiển thị
        const formattedBooks = books.map((book) => ({
            ...book,

            priceFormatted: formatMoney(book.price),

            vatAmountFormatted: formatMoney(
                book.price * VAT / 100
            ),

            priceAfterTaxFormatted: formatMoney(
                book.priceAfterTax
            )
        }));

        // Tổng số sách
        const totalBooks = formattedBooks.length;

        // Tổng giá trị
        const totalValue = formattedBooks.reduce(
            (sum, book) => {
                return sum + Number(book.priceAfterTax || 0);
            },
            0
        );

        // Render giao diện
        res.render("home", {
            books: formattedBooks,

            totalBooks,

            totalValueFormatted: formatMoney(totalValue),

            vat: VAT,

            success: req.query.success || null,

            error: req.query.error || null
        });

    } catch (error) {

        console.error("GET BOOKS ERROR:", error);

        res.render("home", {
            books: [],

            totalBooks: 0,

            totalValueFormatted: "0",

            vat: VAT,

            error: "Không thể tải danh sách sách."
        });
    }
};

// ==========================================
// CREATE BOOK
// POST /books
// ==========================================

const createBook = async (req, res) => {
    try {

        const {
            productCode,
            name,
            author,
            price
        } = req.body;

        // ==========================================
        // VALIDATE DỮ LIỆU
        // ==========================================

        if (
            !productCode ||
            !name ||
            !author ||
            !price
        ) {
            return res.redirect(
                "/books?error=Vui lòng nhập đầy đủ thông tin"
            );
        }

        // ==========================================
        // KIỂM TRA MÃ SẢN PHẨM
        // ==========================================

        if (!productCode.startsWith(MSSV_PREFIX)) {
            return res.redirect(
                "/books?error=Mã sản phẩm phải bắt đầu bằng 087"
            );
        }

        // ==========================================
        // KIỂM TRA GIÁ
        // ==========================================

        const originalPrice = Number(price);

        if (
            Number.isNaN(originalPrice) ||
            originalPrice <= 0
        ) {
            return res.redirect(
                "/books?error=Giá sách không hợp lệ"
            );
        }

        // ==========================================
        // TÍNH VAT
        // ==========================================

        const vatAmount =
            originalPrice * VAT / 100;

        const priceAfterTax =
            originalPrice + vatAmount;

        // ==========================================
        // TẠO SÁCH
        // ==========================================

        const newBook = new BookWrite({
            productCode: productCode.trim(),

            name: name.trim(),

            author: author.trim(),

            price: originalPrice,

            vat: VAT,

            priceAfterTax: priceAfterTax
        });

        // ==========================================
        // SAVE BẰNG WRITE USER
        // ==========================================

        await newBook.save();

        console.log(
            `✅ Đã tạo sách: ${productCode}`
        );

        // ==========================================
        // REDIRECT
        // ==========================================

        return res.redirect(
            "/books?success=Sách đã được thêm thành công"
        );

    } catch (error) {

        console.error(
            "CREATE BOOK ERROR:",
            error
        );

        return res.redirect(
            "/books?error=Không thể thêm sách"
        );
    }
};

module.exports = {
    getBooks,
    createBook
};