const express = require('express');
const router = express.Router();
const sessionController = require('../controller/sessionController');

router.post('/start-session/:username/:siteName', sessionController.startSession);
router.get('/authenticate/:username', sessionController.authenticate);
router.get('/apex/:sessionID', sessionController.deleteSession);
router.get('/qr-code/:username/:sessionID', sessionController.generateQRCode);
router.post('/send-message/:username/:sessionID', sessionController.sendMessage);

module.exports = router;
