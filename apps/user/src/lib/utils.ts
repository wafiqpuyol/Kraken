export const generateTransactionId = () => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let transactionId = "";

    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        transactionId += characters.charAt(randomIndex);
    }

    return transactionId;
}

export const generateOTP = () => {
    const otp = Math.floor(Math.random() * 1000000);
    return otp.toString().padStart(6, '0');
}