// Import packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const home = require("./routes/home");

// Middlewares
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/", home);

// connection
const port = 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
