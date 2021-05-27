const socket = io();
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("#message");
const $messageFormButton = document.querySelector("button");
const $locationBtn = document.querySelector("#location-btn");
const $messageContainer = document.querySelector("#message-container");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;


socket.on("message", (message) => {
    const { text, createdAt } = message;
    const newMessage = Mustache.render(messageTemplate, {
        text,
        createdAt: moment(createdAt).format("h:mm A")
    });
    $messageContainer.insertAdjacentHTML("beforeend", newMessage);
});

socket.on("locationMessage", (location) => {
    const { url, createdAt } = location;
    const locationMessage = Mustache.render(locationTemplate, {
        url,
        createdAt: moment(createdAt).format("h:mm A")
    });
    $messageContainer.insertAdjacentHTML("beforeend", locationMessage);
});

const sendMessage = () => {
    const message = form.message.value;
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