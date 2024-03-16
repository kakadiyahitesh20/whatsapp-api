const crypto = require('crypto');
// const encryptionKey = generateHash(secretKey);
function generateHash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

module.exports=generateHash;