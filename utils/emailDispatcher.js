var emailDispatcher = {};
module.exports = emailDispatcher;

const nodemailer = require("nodemailer");
const fs = require('fs');

// async..await is not allowed in global scope, must use a wrapper
emailDispatcher.sendEmail = async function sendEmail(sender, recipient, subject, htmlMsg) {
    const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'my.web.dev.user@gmail.com',
            pass: 'S4f3_p4ssw0rD'
        },
        tls: {
            rejectUnauthorized: false
        },
        disableFileAccess: true,
        // path: '/path',
        // method: 'GET',
        key: fs.readFileSync('./certificate/key.key'),
        cert: fs.readFileSync('./certificate/certificate.crt'),
        ca: await fs.promises.readFile("./certificate/ca-cert.pem")
    };

    if (!sender) {
        sender = '"Fleet Management 🚗" <my.web.dev.user@gmail.com>';
    }
    if (!recipient) {
        recipient = smtpConfig.auth.user;
    }

    // Turn on: https://myaccount.google.com/lessecureapps

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(smtpConfig);

    // send mail with defined transport object
    await transporter.sendMail({
        from: sender, // sender address
        to: recipient, // list of receivers
        subject: subject, // Subject line
        html: htmlMsg
    }, function (error, response) {
        if (error) {
            console.log("Error in SMTP:")
            console.log(error);
        } else {
            console.log("Message sent.");
        }
    });

    return "Ok";
}