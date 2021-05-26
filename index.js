if (process.env.NODE_ENV !== "production")
    require("dotenv").config();
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log("Server is Up and Running");
});