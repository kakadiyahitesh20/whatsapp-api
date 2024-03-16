const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const sessionController = require('./controller/sessionController');
const Session = require('./model/sessionModel');
require('dotenv').config();
const app = express();


app.use(cors());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));



app.post('/api/start-session/:username/:siteName', sessionController.startSession);
app.get('/api/authenticate/:username', sessionController.authenticate);
app.get('/api/apex/:sessionID', sessionController.deleteSession);
app.get('/api/qr-code/:username/:sessionID', sessionController.generateQRCode);
app.post('/api/send-message/:username/:sessionID', sessionController.sendMessage);

const PORT =  3000  || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
