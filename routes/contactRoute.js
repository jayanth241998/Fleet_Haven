var router = require('express').Router();
var userRoute = require('./usersRoute');
var sendEmail = require('../utils/emailDispatcher').sendEmail;
var ensureAuthenticated = require('../utils/authentication').ensureAuthenticated;

router.get('/', ensureAuthenticated, function (req, res) {
    res.render('contact');
});

router.post('/', ensureAuthenticated, function (req, res) {
    let sender = userRoute.userEmail;
    let recipient = null;
    let subject = req.body.contactSubject;
    let html = "Message from:<br>" + "Name: " + userRoute.userName + "<br>Email: " + sender + "<br><br>";
    html += req.body.contactMessage;

    sendEmail(sender, recipient, subject, html).then(response => {
        console.log("SMTP response:");
        console.log(response);
    }, error => {
        console.log("SMTP error:");
        console.log(error);
        req.flash('error_msg', 'An error occurred.');
        return res.redirect('/contact');
    }).catch((err) => {
        console.log("Error: Contact message was not sent.");
        req.flash('error_msg', 'An error occurred. Message was not sent.');
        return res.redirect('/contact');
    });

    req.flash('success_msg', 'Message was sent! Thank you for your time.');
    return res.redirect('/contact');
});

module.exports = router;