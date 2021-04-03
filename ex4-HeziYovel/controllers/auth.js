const models = require('../models');


module.exports = {
    authenticate: function (req, res) {
        const email = req.body.email;
        const password = req.body.password;

        models.User.findOne({
            where: {email: email, password: password},
        }).then(user => {
            if (user) {
                req.session.isLoggedIn = true;
                req.session.firstNameLastName = `${user.firstName} ${user.lastName}`;
                req.session.userId = user.id;
                res.redirect('/');
            } else {
                res.status(400).render('login', {
                    modal_title: 'Login Failed',
                    message: 'Email or password is incorrect.'
                });
            }
        }).catch((err) => {
            console.error(`Error in authenticate:\n\n${err}`);
            res.status(500).render('login', {
                modal_title: 'Login Failed',
                message: 'The server had an error. With your permission, we would like to send our developers an error report.',
            });
        });
    },
}