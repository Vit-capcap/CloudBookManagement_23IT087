const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// ==========================================
// CẤU HÌNH DNS
// ==========================================
// Máy bạn đang gặp vấn đề DNS với mongodb+srv.
// Dùng Google DNS để Node.js phân giải MongoDB Atlas.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ==========================================
// HÀM LẤY USERNAME TỪ MONGODB URI
// ==========================================
// Chỉ lấy username để kiểm tra.
// KHÔNG in password ra màn hình.
function getMongoUsername(uri) {
    if (!uri) {
        return "Không có URI";
    }

    try {
        const match = uri.match(
            /mongodb\+srv:\/\/([^:]+):/
        );

        return match ? match[1] : "Không xác định";
    } catch (error) {
        return "Không xác định";
    }
}

// ==========================================
// KIỂM TRA BIẾN MÔI TRƯỜNG
// ==========================================

console.log("\n==========================================");
console.log("        KIỂM TRA MONGODB URI");
console.log("==========================================");

console.log(
    "MONGO_READ_URI:",
    process.env.MONGO_READ_URI ? "Đã có" : "❌ Không có"
);

console.log(
    "MONGO_WRITE_URI:",
    process.env.MONGO_WRITE_URI ? "Đã có" : "❌ Không có"
);

console.log(
    "MONGO_SESSION_URI:",
    process.env.MONGO_SESSION_URI ? "Đã có" : "❌ Không có"
);

console.log("\n==========================================");
console.log("        KIỂM TRA USER MONGODB");
console.log("==========================================");

console.log(
    "READ USER:",
    getMongoUsername(process.env.MONGO_READ_URI)
);

console.log(
    "WRITE USER:",
    getMongoUsername(process.env.MONGO_WRITE_URI)
);

console.log(
    "SESSION USER:",
    getMongoUsername(process.env.MONGO_SESSION_URI)
);

console.log("==========================================\n");

// ==========================================
// KIỂM TRA URI BẮT BUỘC
// ==========================================

if (!process.env.MONGO_READ_URI) {
    throw new Error("❌ Thiếu MONGO_READ_URI trong file .env");
}

if (!process.env.MONGO_WRITE_URI) {
    throw new Error("❌ Thiếu MONGO_WRITE_URI trong file .env");
}

if (!process.env.MONGO_SESSION_URI) {
    throw new Error("❌ Thiếu MONGO_SESSION_URI trong file .env");
}

// ==========================================
// KẾT NỐI READ
// ==========================================
// User này chỉ dùng cho:
// GET /books
//
// Không dùng connection này cho:
// INSERT
// UPDATE
// DELETE
// SESSION

const readConnection = mongoose.createConnection(
    process.env.MONGO_READ_URI
);

readConnection.on("connected", () => {
    console.log("✅ MongoDB READ connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_READ_URI)
    );
});

readConnection.on("error", (err) => {
    console.error(
        "❌ MongoDB READ error:",
        err.message
    );
});

readConnection.on("disconnected", () => {
    console.log("⚠️ MongoDB READ disconnected");
});

// ==========================================
// KẾT NỐI WRITE
// ==========================================
// User này dùng cho:
// INSERT sách mới
//
// Không dùng cho:
// GET
// SESSION

const writeConnection = mongoose.createConnection(
    process.env.MONGO_WRITE_URI
);

writeConnection.on("connected", () => {
    console.log("✅ MongoDB WRITE connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_WRITE_URI)
    );
});

writeConnection.on("error", (err) => {
    console.error(
        "❌ MongoDB WRITE error:",
        err.message
    );
});

writeConnection.on("disconnected", () => {
    console.log("⚠️ MongoDB WRITE disconnected");
});

// ==========================================
// KẾT NỐI SESSION
// ==========================================
// User này CHỈ dùng để lưu Session
// vào MongoDB Atlas.
//
// Collection:
// DB_23IT087.sessions
//
// Không dùng READ/WRITE connection cho Session.

const sessionConnection = mongoose.createConnection(
    process.env.MONGO_SESSION_URI
);

sessionConnection.on("connected", () => {
    console.log("✅ MongoDB SESSION connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_SESSION_URI)
    );
});

sessionConnection.on("error", (err) => {
    console.error(
        "❌ MongoDB SESSION error:",
        err.message
    );
});

sessionConnection.on("disconnected", () => {
    console.log("⚠️ MongoDB SESSION disconnected");
});

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    readConnection,
    writeConnection,
    sessionConnection
};