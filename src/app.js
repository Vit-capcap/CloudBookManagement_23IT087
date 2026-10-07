require("dotenv").config();

const express = require("express");
const session = require("express-session");
const { engine } = require("express-handlebars");
const MongoStore = require("connect-mongo").default;

const {
    sessionConnection
} = require("./config/database");

const bookRoutes = require("./routes/bookRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// HANDLEBARS
// ==========================================

app.engine(
    "handlebars",
    engine({
        defaultLayout: "main"
    })
);

app.set("view engine", "handlebars");

app.set(
    "views",
    "./src/views"
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_SESSION_URI,
            collectionName: "sessions",
            autoRemove: "disabled"
        }),

        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: false
        }
    })
);

// ==========================================
// BOOK ROUTES
// ==========================================

app.use("/books", bookRoutes);

// ==========================================
// TRANG CHỦ
// ==========================================

app.get("/", (req, res) => {
    res.redirect("/books");
});

// ==========================================
// SESSION TEST
// ==========================================

app.get("/session-test", (req, res) => {

    if (!req.session.visits) {
        req.session.visits = 0;
    }

    req.session.visits++;

    res.json({
        success: true,
        message: "Session đang hoạt động",
        visits: req.session.visits
    });
});

// ==========================================
// SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});