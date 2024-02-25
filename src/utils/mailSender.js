//import nodemailer pckg
const nodemailer = require("nodemailer");

//create a func for sending mail
const mailSender = async (email, title, body) => {
    try{
        //create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
        })

        //sending mail
        let info = await transporter.sendMail({
            from: 'EduLearn || G39',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })

        console.log(info);
        return info;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;