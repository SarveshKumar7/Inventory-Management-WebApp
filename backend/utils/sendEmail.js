const nodemailer = require("nodemailer");

const sendEmail = async (subject, message, send_to, send_from, reply_to) => {
    try {
        // Create Email Transporter 
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });

        // Options for sending email
        const options = {
            from: send_from,
            to: send_to,
            replyTo: reply_to,
            subject: subject,
            html: message,
        };

        // Send the email
        const info = await transporter.sendMail(options);
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending error: ", error);
        throw error; // Ensure error is handled where function is called
    }
};



module.exports = sendEmail;
