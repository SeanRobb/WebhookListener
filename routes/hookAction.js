var express = require('express');
var router = express.Router();
var apiKey = "136f9268-a3f5-4714-a21f-d5198c6a103e";
var apiEndPoint = "api.ctl-uc1-a.orchestrate.io";
var oio = require('orchestrate');
oio.ApiEndPoint = apiEndPoint;
var db = oio(apiKey);
var Type = require("type-of-is");
var request = require('request');
var fs = require('fs');
var util = require('util');

const settingsKey = "settings";
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
        var currentDestinationSettings = destinations[index][settingsKey];
        switch (destinations[index].type) {
            case "CONSOLE":
                sendToConsole(object, currentDestinationSettings);
                break;
            case "CUSTOM WEBHOOK":
                sendCustomWebhook(object, currentDestinationSettings);
                break;
            case "FILE":
                sendToFile(object, currentDestinationSettings);
                break;
            default:
                failedToNotifyWithType(object,destinations[index].type);
                break;
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

function sendCustomWebhook(object, currentDestinationSettings) {
    var jsonObject = JSON.parse(buildMessage(object, "", JSON.stringify(currentDestinationSettings.webhook)));
    request({
        url: currentDestinationSettings.url,
        method: "POST",
        json: true,
        body: jsonObject
    }, function (error, response, body) {
        console.log(response);
    });
}
function sendToFile(object, currentDestinationSettings) {
    fs.access(currentDestinationSettings.file, fs.W_OK, function (err) {
        console.log(err ? 'can not write' : 'can write');
    });
    fs.appendFile(currentDestinationSettings.file, util.format(
            buildMessage(object, "", currentDestinationSettings.messageFormat)) + '\n',
        function (err) {
            if (err) {
                console.log('The "data to append" was appended to file!');
            }
        });
}
function sendToConsole(object, currentDestinationSettings) {
    console.log(buildMessage(object, "", currentDestinationSettings.messageFormat));
}
function failedToNotifyWithType(object,type) {
    console.log("Did not know how to notify in " + type + " case." +
        "  Misplaced object is " + JSON.stringify(object));
}

module.exports = router;
