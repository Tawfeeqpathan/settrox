let error = {
    status: Number,
    message: String,
}

module.exports = (status, message) => {
    error.status = status
    error.message = message
    return error
}