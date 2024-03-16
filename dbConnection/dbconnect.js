const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
let store;


const connectToDatabase = async () => {
    try{
        await mongoose.connect('mongodb://122.170.99.166:27017/RefactorDB')
        .then(() => {
            store = new MongoStore({ mongoose });
        })
    }catch(err){
        console.log('Failed to connect to MongoDB:', err);
    }
}

module.exports = { connectToDatabase, store };