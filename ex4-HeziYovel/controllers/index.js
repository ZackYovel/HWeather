const models = require('../models');

module.exports = {
    index: async function (req, res) {
        res.render('index', {firstNameLastName: req.session.firstNameLastName});
    },
}