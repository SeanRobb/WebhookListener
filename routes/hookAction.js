var express = require('express');
var router = express.Router();
var apiKey = "136f9268-a3f5-4714-a21f-d5198c6a103e";
var apiEndPoint = "api.ctl-uc1-a.orchestrate.io";
var oio = require('orchestrate');
oio.ApiEndPoint = apiEndPoint;
var db = oio(apiKey);

const collection = 'hooks';

//This is for the actual webhook
router.post('/:id', function (request, response) {
    var object = request.body;

    db.get(collection, request.params.id)
        .then(function (result) {
            notify(result.body.destinations.destinations, object);
            response.end();
        }).fail(function (err) {
            console.log(err);
        });
});

function notify(destinations, object) {
    for (var i = 0; i < destinations.length; i++) {
        switch (destinations[i].type) {
            case "CONSOLE":
                var message = destinations[i].format.message;
                for (var key in object) {
                    message = message.replace("${" + key + "}", object[key]);
                }
                console.log(message);
                break;
            default:
                console.log("Did know how to notify in " + destinations[i].type + "case." +
                    "  Misplaced object is " + JSON.stringify(object))
        }
    }
}

module.exports = router;
