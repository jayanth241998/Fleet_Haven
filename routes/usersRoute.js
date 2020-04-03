var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var userId;
var objectId = require('mongodb').ObjectID;

var sendEmail = require('../utils/emailDispatcher').sendEmail;
var ensureDeAuthenticated = require('../utils/authentication').ensureDeAuthenticated;

// var cookiesig = require('cookie-signature');
// const requestLimit = 30;	// TODO

// Function to generate 36 character string
const guid = function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}

// Register
router.get('/register', ensureDeAuthenticated, function (req, res) {
	res.render('register');
});

// Login
router.get('/login', ensureDeAuthenticated, function (req, res) {
	// console.log(req.session)
	// console.log(req.headers)
	// console.log(cookiesig.sign(req.sessionID, 'rand0ms3cr3tSession'));
	res.render('login');
});

// Register User
router.post('/register', function (req, res) {

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		req.flash('error_msg', parseValidationErrors(errors));
		return res.redirect('/users/login');
	} else {
		User.findOne({ username: req.body.username }).exec().then((foundUser) => {
			var username = req.body.username;

			if (foundUser) {
				if (username === foundUser.username) {
					console.log('Username ' + username + ' already exists.');
					req.flash('error_msg', 'Username ' + username + ' already exists.');
					return res.redirect('/users/login');
				} else {
					req.flash('error_msg', 'An error occurred.');
					return res.redirect('/users/login');
				}
			} else if (username) {
				User.findOne({ email: req.body.email }).exec().then((foundEmail) => {
					var email = req.body.email;

					if (foundEmail) {
						if (email === foundEmail.email) {
							console.log('Email ' + email + ' already exists.');
							req.flash('error_msg', 'Email ' + email + ' already exists.');
							return res.redirect('/users/register');
						} else {
							req.flash('error_msg', 'An error occurred.');
							return res.redirect('/users/register');
						}
					} else {
						var newUser = new User({
							name: req.body.name,
							email: req.body.email,
							username: req.body.username,
							password: req.body.password
						});
						User.createUser(newUser, function (err, user) {
							console.log("New User: " + user);
							if (err) {
								req.flash('error_msg', 'An error occurred.');
								return res.redirect('/users/register');
							}
						});

						req.flash('success_msg', 'You are registered and can now log in.');
						return res.redirect('/users/login');
					}
				});
			} else {
				req.flash('error_msg', 'An error occurred.');
				return res.redirect('/users/register');
			}
		}).catch((err) => {
			console.log('An error occurred: ' + err);
			req.flash('error_msg', 'An error occurred.');
			return res.redirect('/users/register');
		});
	}
});


// Recover account
router.get('/reset-password', ensureDeAuthenticated, function (req, res) {
	const token = req.body.token;

	if (typeof token === "string" && token.length === 36) {
		res.render('resetpassword', { token: token });
	} else {
		req.flash('error_msg', 'An error occurred.');
		return res.redirect('/users/login');
	}
});

router.post('/reset-password', function (req, res) {
	// Validation
	req.checkBody('token', 'Token is not valid').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	if (errors) {
		req.flash('error_msg', parseValidationErrors(errors));
		return res.redirect('/users/login');
	}

	if (req.body.token) {
		const token = req.body.token;
		const password = req.body.password;
		const username = req.body.username;

		if (typeof token === "string" && token.length === 36 && username && password) {
			let updateUser = {};
			User.encryptPassword(password, function (hash) {
				if (hash) {
					updateUser = {
						token: '',
						password: hash
					};
				} else {
					req.flash('error_msg', 'An error occurred.');
					return res.redirect('/users/login');
				}

				User.findOneAndUpdate({ token: token, username: username }, updateUser, { upsert: false })
					.exec().then((updatedUser) => {
						console.log("Updated user:");
						console.log(updatedUser);

						if (updateUser) {
							req.flash('success_msg', "You can now log into your recovered account.")
							return res.redirect('/users/login');
						} else {
							req.flash('error_msg', 'No user found. Please try again.');
							return res.redirect('/users/login');
						}
					}).catch((err) => {
						console.log("No user found by token.");
						req.flash('error_msg', 'An error occurred.');
						return res.redirect('/users/login');
					});
			});
		} else {
			console.log("Wrong token.");
			req.flash('error_msg', 'An error occurred.');
			return res.redirect('/users/login');
		}
	} else {
		console.log("No token.");
		req.flash('error_msg', 'An error occurred.');
		return res.redirect('/users/login');
	}
});

router.get('/recover-account', function (req, res) {
	// console.log(req.headers.cookie);
	if (req.query.key) {
		const genKey = req.query.key;
		console.log(genKey);

		if (typeof genKey === "string" && genKey.length === 36) {
			User.findOne({ token: genKey }).exec().then((foundUser) => {	// TODO, it also gets here
				if (foundUser) {
					console.log("foundUser: ", foundUser);
					req.flash('success_msg', "You can now enter the new password.");
					res.render('resetpassword', { token: genKey });
				} else {
					console.log("Token is not valid.");
					req.flash('error_msg', 'Token is not valid.');
					return res.redirect('/users/login');
				}
			}).catch((err) => {
				console.log("User not found.");
				req.flash('error_msg', 'An error occurred.');
				return res.redirect('/users/login');
			});
		} else {
			req.flash('error_msg', 'An error occurred.');
			return res.redirect('/users/login');
		}
	} else {
		req.flash('error_msg', 'An error occurred.');
		return res.redirect('/users/login');
	}
});

router.post('/recover-account', function (req, res) {

	// Validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();

	var errors = req.validationErrors();
	if (errors) {
		req.flash('error_msg', parseValidationErrors(errors));
		return res.redirect('/users/login');
	} else {
		User.findOne({ email: req.body.email }).exec().then((foundUser) => {
			if (foundUser) {
				let genKey = guid();
				let recipient = foundUser.email;
				let subject = "Password reset ✔";
				let baseurl = 'https://afm.herokuapp.com';

				if (req.headers.host) {
					baseurl = "http://" + req.headers.host;
				}

				let html = "<html><body>";
				html += "Hi " + foundUser.name + ",<br><br>";
				html += "Your username is <b>" + foundUser.username + "</b><br><br>";
				html += "<a href='" + baseurl + '/users/recover-account?key=' + genKey + "'>Click here to reset your password</a><br><br>";
				html += "Feel free to reply if you need something from us!<br>";
				html += "Keep in touch,<br>";
				html += "<a href='https://afm.herokuapp.com'>Fleet Management Team</a><br><br>";
				html += "</body></html>";

				let updateUser = {
					token: genKey
				};
				User.findOneAndUpdate({ _id: objectId(foundUser._id) }, updateUser, { upsert: true }).exec().then((updatedUser) => {
					console.log("User updated.");
					console.log(updatedUser);
				}).catch((err) => {
					console.log("User update error:", err);
					req.flash('error_msg', 'An error occurred.');
					return res.redirect('/users/login');
				});

				sendEmail(null, recipient, subject, html).then(response => {
					console.log("SMTP response:");
					console.log(response);
				}, error => {
					console.log("SMTP error:");
					console.log(error);
					req.flash('error_msg', 'An error occurred.');
					return res.redirect('/users/login');
				}).catch((err) => {
					console.log("Error: Contact message was not sent.");
					req.flash('error_msg', 'An error occurred. Message was not sent.');
					return res.redirect('/users/login');
				});

				let confirmMessage = 'We sent you an email to ' + recipient + ' in order to reset your password.';
				req.flash('success_msg', confirmMessage);
				return res.redirect('/users/login');
			} else {
				req.flash('error_msg', 'The email was not found in our database.');
				return res.redirect('/users/login');
			}
		});
	}
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;

			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					userId = user._id;
					module.exports.userId = userId;
					module.exports.userEmail = user.email;
					module.exports.userName = user.name;
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
	function (req, res) {
		res.redirect('/');
	});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	// res.clearCookie('login');
	req.session.destroy(function (err) {
		if (err) {
			console.log('An error occurred on logout: ' + err);
		}
		res.redirect('/users/login');
	});
});

function parseValidationErrors(errors) {
	let msg = "";
	for (let i = 0; i < errors.length; i++) {
		msg += errors[i].msg;
		if (i < errors.length - 1) {
			msg += '\n';
		}
	}
	return msg;
}

module.exports = router;