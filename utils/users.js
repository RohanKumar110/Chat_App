const users = [];

// Add new user to userlist
module.exports.addUser = (id, room, username) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    // Validate username and room
    if (!username || !room) {
        return {
            error: "username and room are required"
        }
    }
    // Check for existing user
    const existingUser = users.find(user => user.room === room && user.username === username);
    // Validate Username
    if (existingUser) {
        return {
            error: "username already taken"
        }
    }
    const user = { id, room, username };
    users.push(user);
    return { user };
}

// Remove existing user from userlist
module.exports.removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        // Returning the removed user
        return users.splice(index, 1)[0];
    }
}

// Get user by id from userlist
module.exports.getUser = id => users.find(user => user.id === id);


// Get all users for a specfic room from userlist
module.exports.getUsersInRoom = (room) => users.filter(user => user.room === room);