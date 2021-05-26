if (process.env.NODE_ENV !== "production")
    require("dotenv").config();

const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("New User");
    socket.emit("message", "welcome!!!");

    socket.broadcast.emit("message", "User joined");

    socket.on("sendMessage", (message) => {
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        io.emit("message", "User left");
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server is Up and Running");
});