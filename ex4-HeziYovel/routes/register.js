const  express = require('express');
const  router = express.Router();
const  controller = require('../controllers/register');

/* GET home page. */

router.get('/', function (req, res) {
    res.redirect('/login');
});

router.post('/', controller.register);

module.exports = router;
