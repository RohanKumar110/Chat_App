const socket = io();
// Elements
const $sidebar = document.querySelector("#sidebar");
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#message");
const $messageFormButton = document.querySelector("button");
const $locationBtn = document.querySelector("#location-btn");
const $messageContainer = document.querySelector("#message-container");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messageContainer.lastElementChild;
    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // Visible Height
    const visibleHeight = $messageContainer.offsetHeight;
    // Total height of message container
    const containerHeight = $messageContainer.scrollHeight;
    // How far has user scrolled
    const scrollOffset = $messageContainer.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messageContainer.scrollTop = $messageContainer.scrollHeight;
    }
}

socket.on("message", (message) => {
    const { text, username, createdAt } = message;
    const newMessage = Mustache.render(messageTemplate, {
        text,
        username,
        createdAt: moment(createdAt).format("h:mm A")
    });
    $messageContainer.insertAdjacentHTML("beforeend", newMessage);
    autoScroll();
});

socket.on("locationMessage", (location) => {
    const { url, username, createdAt } = location;
    const locationMessage = Mustache.render(locationTemplate, {
        url,
        username,
        createdAt: moment(createdAt).format("h:mm A")
    });
    $messageContainer.insertAdjacentHTML("beforeend", locationMessage);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const userlist = Mustache.render(sidebarTemplate, {
        room, users
    });
    $sidebar.innerHTML = userlist;
});

const sendMessage = () => {
    const message = $messageForm.message.value;
    socket.emit("sendMessage", message, error => {
        // Enabling the form button and clear the input after acknowledgement
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message Delivered");
    });
}

const sendLocation = () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }
    const sucess = position => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, (error) => {
            // Enabling the location button the input after acknowledgement
            $locationBtn.removeAttribute("disabled");
            if (error) {
                return console.error(error);
            }
            console.log("Location Shared");
        });
    }
    const error = () => alert("Unable to retrieve your location");
    navigator.geolocation.getCurrentPosition(sucess, error);
}

$messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // Disabling the button while sending the message
    $messageFormButton.setAttribute("disabled", "disabled");
    sendMessage();
});

$locationBtn.addEventListener("click", function () {
    // / Disabling the button while fetching the location
    this.setAttribute("disabled", "disabled");
    sendLocation();
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/"
    }
});