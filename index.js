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
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("New User");

    socket.on("join", ({ username, room }, callback) => {

        const { user, error } = addUser(socket.id, room, username);
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessage("Admin", "Welcome!"));
        socket.broadcast.to(user.room)
            .emit("message", generateMessage("Admin", `${user.username} joined`));
        io.to(room).emit("roomData", {
            room,
            users: getUsersInRoom(room)
        });
        callback();
    });

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Bad words are not allowed");
        }
        const user = getUser(socket.id);
        if (!user) {
            return callback("User not found");
        }
        io.to(user.room).emit("message", generateMessage(user.username, message));
        callback();
    });

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            return callback("user not found");
        }
        if (!coords) {
            return callback("Location sharing failed");
        }
        const url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, url));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            const { username, room } = user;
            io.to(room).emit("message", generateMessage("Admin", `${username} left`));
            io.to(room).emit("roomData", {
                room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log("Server is Up and Running");
});