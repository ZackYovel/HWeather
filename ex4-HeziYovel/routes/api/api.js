const express = require('express');
const router = express.Router();
const functions = require('../../appFunctions');
const addLocationRouter = require('./add-location');
const removeLocationsRouter = require('./remove-locations');
const getLocationsRouter = require('./get-locations');

/* GET home page. */
router.use(/.+/, functions.assertLogin);

router.get('/', functions.redirectToDefault);

router.use('/add-location', addLocationRouter);

router.use('/remove-locations', removeLocationsRouter);

router.use('/get-locations', getLocationsRouter);

module.exports = router;
