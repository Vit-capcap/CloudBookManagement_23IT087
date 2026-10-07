const mongoose = require("mongoose");
require("dotenv").config();

// ==========================================
// HÀM LẤY USERNAME TỪ MONGODB URI
// ==========================================
// Chỉ lấy username để kiểm tra.
// KHÔNG in password ra console.
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
    throw new Error(
        "❌ Thiếu MONGO_READ_URI trong Environment Variables"
    );
}

if (!process.env.MONGO_WRITE_URI) {
    throw new Error(
        "❌ Thiếu MONGO_WRITE_URI trong Environment Variables"
    );
}

if (!process.env.MONGO_SESSION_URI) {
    throw new Error(
        "❌ Thiếu MONGO_SESSION_URI trong Environment Variables"
    );
}

// ==========================================
// CẤU HÌNH CHUNG CHO MONGODB
// ==========================================
//
// Không sử dụng:
// dns.setServers()
// vì Render đã có hệ thống DNS riêng.
//
// TLS được bật thông qua mongodb+srv.
// Không cần tự thêm tls=true vào URI.
//

const mongoOptions = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,

    // Không tự động tạo index khi ứng dụng khởi động.
    autoIndex: false,

    // Giữ kết nối ổn định.
    maxPoolSize: 10,
    minPoolSize: 1
};

// ==========================================
// READ CONNECTION
// ==========================================
// User:
// book_read_23IT087
//
// Chỉ dùng để:
// GET /books
//
// Không dùng để:
// INSERT
// UPDATE
// DELETE
// SESSION
// ==========================================

const readConnection = mongoose.createConnection(
    process.env.MONGO_READ_URI,
    mongoOptions
);

readConnection.on("connected", () => {
    console.log("==========================================");
    console.log("✅ MongoDB READ connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_READ_URI)
    );
    console.log("==========================================");
});

readConnection.on("error", (err) => {
    console.error("==========================================");
    console.error("❌ MongoDB READ error");
    console.error("   Message:", err.message);
    console.error("==========================================");
});

readConnection.on("disconnected", () => {
    console.log("⚠️ MongoDB READ disconnected");
});

// ==========================================
// WRITE CONNECTION
// ==========================================
// User:
// book_write_23IT087
//
// Chỉ dùng để:
// INSERT sách mới
//
// Không dùng để:
// GET
// SESSION
// ==========================================

const writeConnection = mongoose.createConnection(
    process.env.MONGO_WRITE_URI,
    mongoOptions
);

writeConnection.on("connected", () => {
    console.log("==========================================");
    console.log("✅ MongoDB WRITE connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_WRITE_URI)
    );
    console.log("==========================================");
});

writeConnection.on("error", (err) => {
    console.error("==========================================");
    console.error("❌ MongoDB WRITE error");
    console.error("   Message:", err.message);
    console.error("==========================================");
});

writeConnection.on("disconnected", () => {
    console.log("⚠️ MongoDB WRITE disconnected");
});

// ==========================================
// SESSION CONNECTION
// ==========================================
// User:
// book_session_23IT087
//
// Connection này được export để sử dụng
// khi cần.
//
// LƯU Ý:
// connect-mongo hiện tại trong app.js
// đang sử dụng trực tiếp:
//
// MONGO_SESSION_URI
//
// nên connection này hiện chưa trực tiếp
// được connect-mongo sử dụng.
// ==========================================

const sessionConnection = mongoose.createConnection(
    process.env.MONGO_SESSION_URI,
    mongoOptions
);

sessionConnection.on("connected", () => {
    console.log("==========================================");
    console.log("✅ MongoDB SESSION connected");
    console.log(
        "   User:",
        getMongoUsername(process.env.MONGO_SESSION_URI)
    );
    console.log("==========================================");
});

sessionConnection.on("error", (err) => {
    console.error("==========================================");
    console.error("❌ MongoDB SESSION error");
    console.error("   Message:", err.message);
    console.error("==========================================");
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