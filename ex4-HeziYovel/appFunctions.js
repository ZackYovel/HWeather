function redirect(req, res, url) {
    if (!req.originalUrl.includes('/api/')) {
        res.redirect(url);
    } else {
        res.json({changeToURL: url});
    }
}

module.exports = {
    assertLogin: function (req, res, next) {
        if (!req.session.isLoggedIn) {
            redirect(req, res, '/login');
        } else {
            next();
        }
    },

    assertUnsigned: function (req, res, next) {
        if (req.session.isLoggedIn) {
            redirect(req, res, '/');
        } else {
            next();
        }
    },

    redirectToDefault: function (req, res) {
        if (req.session.isLoggedIn) {
            redirect(req, res, '/');
        } else {
            redirect(req, res, '/login');
        }
    },

    logout: function (req, res, changeToURL = null) {
        req.session.isLoggedIn = false;
        req.session.firstNameLastName = '';
        if (changeToURL === null) {
            res.render('logout');
        } else {
            res.json({changeToURL: changeToURL});
        }
    },

    apiLogout: function (req, res) {
        this.logout(req, res, '/login');
    },
}
