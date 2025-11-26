require("dotenv").config(); // ✅ Load environment variables first
const express = require("express");
const cors = require("cors");
const path = require("path");


const app = express();

// ✅ Allow all origins (CORS)
app.use(cors());

// ✅ Parse incoming JSON requests
app.use(express.json());

// Import Routers
const adminRouter = require("./api/admin/admin.router");
const userRouter = require("./api/users/user.router");
const postRouter = require("./api/posts/posts.router");
const businessRouter = require("./api/business/business.router");


// Routes
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/business", businessRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start the server
app.listen();