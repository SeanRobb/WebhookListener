var express = require('express');
var router = express.Router();
var apiKey = "136f9268-a3f5-4714-a21f-d5198c6a103e";
var apiEndPoint = "api.ctl-uc1-a.orchestrate.io";
var oio = require('orchestrate');
oio.ApiEndPoint = apiEndPoint;
var db = oio(apiKey);
var Type = require("type-of-is");


const collection = 'hooks';

//This is for the actual webhook
router.post('/:id', function (request, response) {
    var object = request.body;

    db.get(collection, request.params.id)
        .then(function (result) {
            notify(result.body.destinations, object);
            response.end();
        }).fail(function (err) {
            logAndRespondWithError(err)
        });
});

function notify(destinations, object) {
    for (var index = 0; index < destinations.length; index++) {
        switch (destinations[index].type) {
            case "CONSOLE":
                console.log(buildMessage(object, "", destinations[index].format.message));
                break;
            case "CUSTOM WEBHOOK":
                var test = buildMessage(object, "", destinations[index].format.message)
            default:
                console.log("Did know how to notify in " + destinations[index].type + "case." +
                    "  Misplaced object is " + JSON.stringify(object))
        }
    }
}

function logAndRespondWithError(err) {
    console.log(err);
    response.status(500);
    response.contentType('application/json');
    response.write(JSON.stringify(err));
    response.end();
}

function buildMessage(object, keyPrefix, message) {
    for (var key in object) {
        var subItem = object[key];
        if (Type.is(subItem, Object)) {
            message = buildMessage(subItem, buildKey(keyPrefix, key), message)
        } else {
            message = message.replace("${" + buildKey(keyPrefix, key) + "}", subItem);
        }
    }
    return message;
}

function buildKey(keyPrefix, key) {
    if (!keyPrefix.trim()) {
        return key;
    }
    return keyPrefix + "." + key;
}

module.exports = router;
