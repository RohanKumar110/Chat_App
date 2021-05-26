const socket = io();
const form = document.querySelector("#form");

socket.on("message", (message) => {
    console.log(message);
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.message.value;
    socket.emit("sendMessage", message);
});