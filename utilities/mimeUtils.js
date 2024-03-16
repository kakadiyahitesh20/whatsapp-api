function getMimeTypeFromBase64(base64String) {
    // Remove data prefix if present
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');

    // Convert base64 string to buffer
    const bufferData = Buffer.from(base64Data, 'base64');

    // Determine MIME type based on the magic numbers
    if (bufferData[0] === 0xFF && bufferData[1] === 0xD8 && bufferData[2] === 0xFF) {
        return 'image/jpeg';
    } else if (bufferData[0] === 0x89 && bufferData[1] === 0x50 && bufferData[2] === 0x4E && bufferData[3] === 0x47) {
        return 'image/png';
    } else if (bufferData[0] === 0x47 && bufferData[1] === 0x49 && bufferData[2] === 0x46) {
        return 'image/gif';
    }else if (bufferData[0] === 0x25 && bufferData[1] === 0x50 && bufferData[2] === 0x44 && bufferData[3] === 0x46) {
        return 'application/pdf';
    } else if (bufferData[0] === 0x47 && bufferData[1] === 0x49 && bufferData[2] === 0x46 && bufferData[3] === 0x38) {
        return 'image/gif';
    } else if (bufferData[0] === 0x00 && bufferData[1] === 0x00 && bufferData[2] === 0x00 && bufferData[3] === 0x18) {
        return 'video/mp4'; // MPEG-4 video format
    } else if (bufferData[0] === 0x00 && bufferData[1] === 0x00 && bufferData[2] === 0x01 && bufferData[3] === 0xBA) {
        return 'video/mpg'; // MPEG video format
    } else {
        // Default to octet-stream if MIME type is unknown
        return 'application/octet-stream';
    }
}

module.exports = {
    getMimeTypeFromBase64
};
