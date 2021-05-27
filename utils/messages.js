module.exports.generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

module.exports.generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}