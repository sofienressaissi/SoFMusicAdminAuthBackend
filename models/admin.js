const mongoose = require ("mongoose");

const fashionSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 4
    },
    lastName: {
        type: String,
        required: true,
        minlength: 4
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    dateCreation: {
        type: Date
    }
});

module.exports = mongoose.model("admin_sm", fashionSchema);