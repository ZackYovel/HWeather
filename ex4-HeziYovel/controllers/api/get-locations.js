const models = require('../../models');
const functions = require('../../appFunctions');

module.exports = {

    getLocations: function (req, res) {
        models.Location.findAll({where: {userId: req.session.userId}})
            .then(locations => res.json({locations: locations}))
            .catch((err) => {
                console.error(`Error in getLocations:\n\n${err}`);
                functions.apiLogout(req, res);
            });
    }
}