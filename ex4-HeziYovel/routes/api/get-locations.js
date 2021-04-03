const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/get-locations');

/* GET home page. */
router.get('/', controller.getLocations);

module.exports = router;
