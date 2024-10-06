const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    confirmedParticipants: [{
        name: String,
        email: String,
    }],
    waitlistParticipants: [{
        name: String,
        email: String,
    }]
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;