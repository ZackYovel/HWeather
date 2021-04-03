const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/add-location');

/* GET home page. */
router.get('/', (req, res) => res.redirect('/'));

router.post('/', controller.addLocation);

module.exports = router;
