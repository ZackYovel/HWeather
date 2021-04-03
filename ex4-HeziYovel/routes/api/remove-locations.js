const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/remove-locations');

/* GET home page. */
router.get('/', (req, res) => res.redirect('/'));

router.post('/', controller.removeLocations);

module.exports = router;
