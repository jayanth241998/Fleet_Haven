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


		//for drivers
		Driver.find({}).exec().then((drivers) => {
            var userDrivers = [];
            for (var i = 0; i < drivers.length; i++) {
                var totalDistanceTraveled = 0;
                // Get drivers and vehicles of the logged in user
                if (drivers[i].userId == usersRoute.userId) {
                    for (var j = 0; j < vehicles.length; j++) {
                        if (vehicles[j].userId == usersRoute.userId) {
                            for (var k = 0; k < vehicles[j].trips.length; k++) {
                                if (vehicles[j].trips[k].driver.nationalId == drivers[i].nationalId) {
                                    totalDistanceTraveled += vehicles[j].trips[k].distance;
                                }
                            }
                        }
                    }
                    if (totalDistanceTraveled != drivers[i].distanceTraveled) {
                        Driver.findOneAndUpdate({ nationalId: drivers[i].nationalId }, { $set: { distanceTraveled: totalDistanceTraveled } }, { upsert: true }).exec();
                    }
                    userDrivers.push(drivers[i]);
                }
			}
			res.render('index', { items: userTrips, driver: userDrivers });
		}).catch((err) => {
			req.flash('error_msg', err);
			res.redirect('/');
		})
		
	}).catch((err) => {
		req.flash('error_msg', err);
		res.redirect('/');
	});
});

module.exports = router;