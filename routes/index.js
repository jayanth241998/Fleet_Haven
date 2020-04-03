var express = require('express');
var router = express.Router();
var Vehicle = require('../models/vehicle');
var Driver = require('../models/driver');
var usersRoute = require('./usersRoute.js');
var ensureAuthenticated = require('../utils/authentication').ensureAuthenticated;

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	Vehicle.find({}).exec().then((vehicles) => {
		var userTrips = [];
		for (var i = 0; i < vehicles.length; i++) {
			if (vehicles[i].userId == usersRoute.userId) {
				for (var j = 0; j < vehicles[i].trips.length; j++) {
					userTrips.push(vehicles[i].trips[j]);
				}
			}
		}
		res.render('index', { items: userTrips });
	}).catch((err) => {
		req.flash('error_msg', err);
		res.redirect('/');
	});
});

module.exports = router;