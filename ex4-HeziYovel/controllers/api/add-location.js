const models = require('../../models');
const functions = require('../../appFunctions');

function doWhenLocationIsAdded(newLocation, req, res, message = 'Location added.') {
    if (!newLocation) {
        console.error(`Error in addLocation(doWhenLocationIsAdded): no location updated or created.`);
        functions.apiLogout(req, res);
    } else {
        res.json({message: message});
    }
}

function doAfterUpdate(updatedLocation, req, res) {
    if (!updatedLocation) {
        models.Location.create({
            name: req.body.name,
            lat: req.body.lat,
            lon: req.body.lon,
            userId: `${req.session.userId}`,
        })
            .then(newLocation => doWhenLocationIsAdded(newLocation, req, res))
            .catch((err) => {
                console.error(`Error in addLocation(doAfterUpdate):\n\n${err}`);
                functions.apiLogout(req, res)
            });
    } else {
        doWhenLocationIsAdded(updatedLocation, req, res, 'Location updated.');
    }
}

function updateLocation(location, req, res) {

    if (location) {
        location.lat = req.body.lat;
        location.lon = req.body.lon;

        location.save()
            .then(location => doAfterUpdate(location, req, res))
            .catch((err) => {
                console.error(`Error in addLocation(updateLocation): ${err}`);
                functions.apiLogout(req, res);
            })
    } else {
        doAfterUpdate(location, req, res);
    }
}

module.exports = {

    addLocation: function (req, res) {
        models.Location.findOne({where: {name: req.body.name, userId: req.session.userId}})
            .then(location => updateLocation(location, req, res))
            .catch((err) => {
                console.error(`Error in addLocation:\n\n${err}`);
                functions.apiLogout(req, res);
            })
    }
}