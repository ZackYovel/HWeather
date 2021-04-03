const models = require('../models');
const functions = require('../appFunctions');
const Cookies = require('cookies');

const ONE_MINUTE_IN_MS = 60000;

const keys = ['gklehnwklgbne;kit930u5rwcldsFESG ?HJDRZS fkje3rh2hr3'];

async function registerStep1(req, res, email, firstName, lastName) {
    models.User.findOne({
        where: {email: email},
    }).then(user => {
        if (user === null) {
            req.session.credentials = {email: email, firstName: firstName, lastName: lastName};
            const cookies = new Cookies(req, res, {keys: keys});
            cookies.set('RegisterStart', new Date().toISOString(), {signed: true, maxAge: ONE_MINUTE_IN_MS});
            res.render('password');
        } else {
            res.render('login', {
                opmode: 'register',
                modal_title: 'Registration Failed',
                message: `${email} is already in use. Please choose another email address.`,
            });
        }
    }).catch(err => {
        console.error(`Error in register(registerStep1):\n\n${err}`);
        res.status(500).render('login', {
            opmode: 'register',
            modal_title: 'Login Failed',
            message: 'The server had an error. With your permission, we would like to send our developers an error report.',
        });
    })
}

function didRegistrationExpire(req, res) {
    const cookies = new Cookies(req, res, {keys: keys});
    const registerStart = cookies.get('RegisterStart');
    let result = false;
    if (!registerStart) {
        res.render('login', {
            opmode: 'register',
            modal_title: 'Registration expired.',
            message: 'Please start over.'
        });
        result = true;
    }
    return result;
}

function doPasswordsMatch(req, password, res) {
    const confirmPassword = req.body.confirm_password;

    let result = true;

    if (password !== confirmPassword) {
        res.status(400).render('login', {
            opmode: 'register',
            modal_title: 'Login Failed',
            message: "Passwords don't match.",
        });
        result = false;
    }
    return result;
}

function createUser(req, password, res) {
    models.User.create({
        email: req.session.credentials.email,
        firstName: req.session.credentials.firstName,
        lastName: req.session.credentials.lastName,
        password: password,
    }).then(user => {
        if (user !== null) {
            res.render('welcome', {firstNameLastName: `${user.firstName} ${user.lastName}`});
        } else {
            throw new Error();
        }
    }).catch(err => {
        console.error(`Error in register(registerStep2(createUser)):\n\n${err}`);
        res.status(500).render('login', {
            opmode: 'register',
            modal_title: 'Login Failed',
            message: 'The server had an error. With your permission, we would like to send our developers an error report.',
        });
    });
}

async function registerStep2(req, res, password) {
    const registrationExpired = didRegistrationExpire(req, res);
    const passwordsMatch = doPasswordsMatch(req, password, res);
    if (!registrationExpired && passwordsMatch) {
        createUser(req, password, res);
    }
}

module.exports = {
    register: function (req, res) {
        const email = req.body.email;
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const password = req.body.password;

        let success = false;

        if (email) {
            registerStep1(req, res, email, firstName, lastName);
            success = true;
        } else if (password) {
            registerStep2(req, res, password);
            success = true;
        }

        if (!success) {
            console.error("Error in register: didn't receive email or password.");
            res.status(400).render('login', {
                opmode: 'register',
                modal_title: 'Login Failed',
                message: 'The page had an error. With your permission, we would like to send our developers an error report.',
            });
        }
    },
}