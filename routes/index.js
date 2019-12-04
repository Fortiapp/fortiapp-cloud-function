var express = require('express');
var router = express.Router();

/* Not used anymore */
router.get('/', function (req, res, next) {

    client.keys('*', function (err, keys) {
        if (err) return console.log(err);

        for (var i = 0, len = keys.length; i < len; i++) {
            console.log(keys[i]);
        }
    });

    res.render('index', {title: 'Fortiapp Cloud Functions'});
});

module.exports = router;
