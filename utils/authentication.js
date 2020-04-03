module.exports.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports.ensureDeAuthenticated = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        req.logout();
        req.session.destroy(function (err) {
            if (err) {
                console.log('An error occurred on logout: ' + err);
            }
        });
        res.redirect('/users/login');
    }
}