const models = require('../../models');
const functions = require('../../appFunctions');

function doAfterDelete(rowsDeleted, req, res) {
    if (rowsDeleted > 0) {
        res.json('Locations deleted.');
    } else {
        res.json("Locations don't exist in list.");
    }
    if (rowsDeleted !== req.body.locationNames.length) {
        // This is bad, because it means there are duplicate names in the list.
        throw new Error(`Error on deleting location: rowsDeleted=${rowsDeleted}, number of names=${req.body.locationNames.length}`);
    }
}

module.exports = {

    removeLocations: function (req, res) {
        models.Location.destroy({where: {name: req.body.locationNames}})
            .then(rowsDeleted => doAfterDelete(rowsDeleted, req, res))
            .catch((err) => {
                console.error(`Error in removeLocations:\n${err}`);
                functions.apiLogout(req, res);
            });
    }
}