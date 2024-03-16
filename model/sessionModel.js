const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    username: String,
    sessionID: String,
    active: Boolean,
    siteName: String,
    logoutURL: String,
    createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

