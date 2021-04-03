const  express = require('express');
const  router = express.Router();
const  controller = require('../controllers/auth');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/login');
});

router.post('/', controller.authenticate);

module.exports = router;
