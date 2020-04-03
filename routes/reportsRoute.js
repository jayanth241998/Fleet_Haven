var router = require('express').Router();
var mongoose = require('mongoose');
var objectId = require('mongodb').ObjectID;
var Vehicle = require('../models/vehicle');
var Driver = require('../models/driver');
var usersRoute = require('./usersRoute.js');
var ensureAuthenticated = require('../utils/authentication').ensureAuthenticated;

// Get reports
router.get('/', ensureAuthenticated, function (req, res) {
	Vehicle.find({}).exec().then((vehicles) => {
		Driver.find({}).exec().then((drivers) => {
			var userDrivers = [];
			for (var i = 0; i < drivers.length; i++) {
				if (drivers[i].userId == usersRoute.userId) {
					userDrivers.push(drivers[i]);
				}
			}
			var userVehicles = [];
			for (var i = 0; i < vehicles.length; i++) {
				if (vehicles[i].userId == usersRoute.userId) {
					userVehicles.push(vehicles[i]);
				}
			}
			res.render('reports', { vehicles: userVehicles, drivers: userDrivers });
		}).catch((err) => {
			req.flash('error_msg', err);
			res.redirect('/reports');
		});
	}).catch((err) => {
		req.flash('error_msg', err);
		res.redirect('/reports');
	});
});

router.get('/getdata', function (req, res) {
	Vehicle.find({}).exec().then((vehicles) => {
		var userVehicles = [];
		for (var i = 0; i < vehicles.length; i++) {
			if (vehicles[i].userId == usersRoute.userId) {
				userVehicles.push(vehicles[i]);
			}
		}
		res.send({ vehicles: userVehicles });
	}).catch((err) => {
		req.flash('error_msg', err);
		res.redirect('/reports');
	});
});

module.exports = router;