var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Webhook Listener'});
});

/* GET home page. */
router.get('/:id/', function (req, res, next) {


    res.render('configure', {
        title: 'Configure',
        destination: [
            {
                "url": "my.slack.com/webhook/",
                "type": "SLACK"
            },
            {
                "url": "my.pagerduty.com/webhook/",
                "type": "PAGERDUTY"
            }
        ]
    });
});


module.exports = router;
