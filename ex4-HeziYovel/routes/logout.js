const express = require('express');
const router = express.Router();
const functions = require('../appFunctions');

/* GET home page. */
router.get('/', (req, res) => functions.logout(req, res));

module.exports = router;
