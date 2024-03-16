const { Client, RemoteAuth, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const qrImage = require('qr-image');
const Session = require('../model/sessionModel');
const mimeUtils = require('../utilities/mimeUtils'); 
const validateUser=require('../utilities/validateuser');
const { connectToDatabase }=require('../dbConnection/dbconnect');
const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
 const secretKey = process.env.MyKey;
 console.log(secretKey);

let qrImageBuffer = {};
let whatsappClients = {};
let store;


mongoose.connect('mongodb://122.170.99.166:27017/RefactorDB')
.then(() => {
    store = new MongoStore({ mongoose });
})
.catch(err => {
    console.log('Failed to connect to MongoDB:', err);
    process.exit(1);
});

// connectToDatabase()
//   .then(() => {
//     console.log("connection establish successfully...");
//   })
//   .catch(err => {
//     console.log("connection establish error....");
//   });

exports.startSession = async (req, res) => {
    const username = req.params.username;
    const siteName = req.params.siteName;
    const logoutURL = req.body.logoutURL;
    
    const validKey = req.headers['validkey'];
    console.log(validKey);
    const authetication=validateUser(secretKey);
    console.log("encrypted: " + validKey);
    console.log("url: " + logoutURL);

    if(validKey!=authetication){console.log(authetication);}
    // Verify authenticity of request
    if (validKey != authetication) {
        return res.status(401).json({ message: 'Unauthorized ' });
    }
    //genrate sessoin id
    let sessionID = uuidv4();

    const activeSession = await Session.findOne({ username, active: true });
    let existingSession = await Session.findOne({ username, siteName });

    if (existingSession) {
        // If session already exists and is not active, update the session ID
        if (!existingSession.active) {
            return res.status(200).json({ message: 'You have previous created session.', sessionID: existingSession.sessionID });
        } 
    }
     if (activeSession) {
        sessionID = activeSession.sessionID;
        return res.status(200).json({ message: 'You have an active session', sessionID: activeSession.sessionID });
    }
     else {
         // Delete inactive session if exists
        //  await Session.findOneAndDelete({ username,siteName, active: false });

         //create a new session on database.
        const session = new Session({ username, sessionID, active: false, siteName, logoutURL });
        await session.save();
        whatsappClients[sessionID] = new Client({
            authStrategy: new RemoteAuth({
                clientId: sessionID,
                store,
                backupSyncIntervalMs: 300000,
            }),
        });
    }

    whatsappClients[sessionID].on("ready", () => {
        console.log("client is ready to sent message...");
    })

    whatsappClients[sessionID].on('qr', qr => {
        qrImageBuffer[sessionID] = qrImage.imageSync(qr, { type: 'png' });
        console.log(qrImageBuffer[sessionID]);
    });

    whatsappClients[sessionID].on('authenticated', async (session) => {
        console.log('Authenticated successfully with session:', sessionID);
        try {
            const dbSession = await Session.findOne({ username, sessionID });
            if (dbSession) {
                dbSession.active = true;
                await dbSession.save();
                // res.redirect(`/api/authnticate/${username}`);
            }
        } catch (error) {
            console.log('Error updating session active status:', error);
        }
    });

    whatsappClients[sessionID].on('disconnected', async (reason) => {
        console.log('Client'  + 'sessoin id :' + sessionID + ' disconnected:', reason);
        if (reason === 'session' || reason === 'qr' || reason === 'auth_failure') {
            console.log('Session expired. You need to reauthenticate.');
            whatsappClients[sessionID].initialize().catch(err => {
                console.log('Failed to initialize WhatsApp client:', err);
            });
        }

        // Retrieve the logout URL from the database
        const session = await Session.findOne({ sessionID });
        if (!session) {
            console.log('Session not found in the database');
        }

        const logoutURL = session.logoutURL;
        console.log(logoutURL);
        // Send a GET request to the logout URL
        try {
            await axios.get(logoutURL + `/${sessionID}`);
            console.log('Logout URL sent successfully');
        } catch (error) {
            console.log('Error sending logout URL:',);
        }

    });

    whatsappClients[sessionID].initialize().catch(err => {
        console.log('Failed to initialize WhatsApp client:', err);
    });

    whatsappClients[sessionID].on('error', err => {
        console.error('WhatsApp client error:', err);
    });

    res.status(200).json({ message: 'Session started successfully', sessionID });
};

exports.authenticate = async (req, res) => {
    const username = req.params.username;
    try {
        const session = await Session.findOne({ username, active: true });
        if (session) {
            // Session is active
            res.json({ statuscode: 1, message: "Successful authentication" });
        } else {
            // Session is not active
            res.json({ statuscode: 0, message: "Session not active." });
        }
    } catch (error) {
        console.log('Error in /api/authnticate endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

exports.deleteSession = async (req, res) => {
    const sessionID = req.params.sessionID;
    try {
        // Find the session with the provided session ID and delete it
        const deletedSession = await Session.findOneAndDelete({ sessionID });
        
        if (deletedSession) {
            // Session data successfully deleted
             console.log(`Session data with session ID ${sessionID} deleted successfully` );
        } else {
            // Session with the provided ID not found
            console.log(  `Session data with session ID ${sessionID} not found` );
        }
    } catch (error) {
        // Error occurred during deletion
        console.error('Error deleting session data:', error);
       
    }
};

exports.generateQRCode = async (req, res) => {
    const username = req.params.username;
    const sessionID = req.params.sessionID;
    const validKey = req.headers['validkey'];
  
    const hash = validateUser(secretKey);
    console.log("encrypted: " + validKey);
    

    // Verify authenticity of request

    console.log("decryption : " + hash);
    if (validKey != hash) {
        return res.status(401).json({ message: 'Unauthorized ' });
    }

    const session = await Session.findOne({ username, active: true });
    if (session) {

        return res.status(200).json({ message: 'You already have an active session', sessionID: session.sessionID });
    } else {
        try {
            
            let startTime = Date.now();
            const checkQrCode = () => {
                // Check if QR code is available
                if (qrImageBuffer[sessionID]) {
                    // If QR code is available, send the response immediately
                    const base64String = qrImageBuffer[sessionID].toString('base64');
                    console.log("QR code: " + base64String);
                    return res.status(200).json({ QrBase64: base64String });
                } else {
                    // If QR code is not available
                    const currentTime = Date.now();
                    // Check if 20 seconds have passed
                    if (currentTime - startTime >= 160000) {
                        // If 20 seconds have passed and QR code is still not available, return 404
                        return res.status(404).json({ error: 'QR code not available' });
                    } else {
                        // If less than 20 seconds have passed, wait for a short time and check again
                        setTimeout(checkQrCode, 1000); // Check again after 1 second
                    }
                }
            };
        
            // Start checking for QR code
            checkQrCode();

        } catch (error) {
            console.log('Error sending QR code:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

exports.sendMessage = async (req, res) => {
    const { username, sessionID } = req.params;
    // const encryptionKey = req.body.encryptionKey;
    const validKey = req.headers['validkey'];
    const hash = validateUser(secretKey);

    //fetch data which is coming from body.
    const bodyData = req.body;
    const pdf64Read = bodyData.pdf;
    const recipientList = bodyData.contactList;
    const pdfCaption = bodyData.pdfCaptionMessage

    console.log("pdf : "+" list:"+recipientList+"caption : "+pdfCaption);

     const recipientNumbers = recipientList.split(",").map(number => `${number}@c.us`);
    // Verify authenticity of request
    if (validKey !== hash) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    var filename = 'Test.pdf'; // Update this with your filename

    var mimetype = mimeUtils.getMimeTypeFromBase64(pdf64Read); // Update this with the correct MIME type

     // Now, create the MessageMedia object directly from the received base64 content
    const media = new MessageMedia(mimetype, pdf64Read, filename);

    const session = await Session.findOne({ username, sessionID });
    if (!session) {
        return res.status(404).json({ error: 'Invalid session ID' });
    }
    try {
        for (const recipient of recipientNumbers) {
           
            if(pdf64Read){
            await whatsappClients[sessionID].sendMessage(recipient, media, { caption: pdfCaption, sendMediaAsDocument: true, thumbnailHeight: 480, thumbnailWidth: 339 }).then(() => {
                console.log('Message sent successfully with pdf');

            });
            }else{
                await whatsappClients[sessionID].sendMessage(recipient, 'Hello from WhatsApp!').then(() => {
                    console.log('Message sent successfully');
                    
                })
            }
            console.log(`Message sent successfully to ${recipient}`);

        }
        res.status(200).json({ message: 'Message sent successfully' });
        
    } catch (error) {
        console.log('Error in send-message endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
