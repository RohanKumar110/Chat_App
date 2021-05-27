if (process.env.NODE_ENV !== "production")
    require("dotenv").config();

const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("New User");
    socket.emit("message", generateMessage("Welcome!"));

    socket.broadcast.emit("message", generateMessage("User joined"));

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Bad words are not allowed");
        }
        io.emit("message", generateMessage(message));
        callback();
    });

    socket.on("sendLocation", (coords, callback) => {
        if (!coords) {
            return callback("Location sharing failed");
        }
        const location = generateLocationMessage(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`);
        io.emit("locationMessage", location);
        callback();
    });

    socket.on("disconnect", () => {
        io.emit("message", generateMessage("User left"));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server is Up and Running");
});