const bcrypt = require('bcrypt');

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

export const getNextDayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    // @ts-ignore
    const formattedDate = today.toLocaleDateString('en-US', options);
    return formattedDate
}

export const hoursLeft = () => {
    const countdown = (deadline: number) => {

        const now = new Date().getTime();
        const distance = deadline - now;

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (distance < 0) {
            return 'Countdown finished!';
        } else {
            return `${hours} hours`;
        }
    }

    const deadline = new Date(getNextDayDate()).getTime();

    return countdown(deadline);
}

export const generateToken = async () => {
    try {
        const token = Math.random().toString(36).substring(2, 15);
        const hashedToken = await bcrypt.hash(token, 10);
        return hashedToken;
    } catch (error) {
        console.error('Error generating password reset token:', error);
    }
}