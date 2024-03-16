const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    username: String,
    sessionID: String,
    active: Boolean,
    siteName: String,
    logoutURL: String,
    createdAt: { type: Date, default:  () => new Date(Date.now() + (5.5 * 60 * 60 * 1000)) }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

