var express = require('express');
var uuid = require('uuid');
var router = express.Router();

var apiKey = "136f9268-a3f5-4714-a21f-d5198c6a103e";
var apiEndPoint = "api.ctl-uc1-a.orchestrate.io";
var oio = require('orchestrate');
oio.ApiEndPoint = apiEndPoint;
var db = oio(apiKey);

const collection = 'hooks';

//This will allow you to set a new endpoint
//The endpoint location should be returned
router.post('/', function (request, response) {
    var objectKey = uuid.v4();

    destinationTypeCheck(request.body);

    var dbBody = {
        "destinations": request.body,
        "url": "/hook/" + objectKey
    };

    console.log(dbBody);
    db.put(collection, objectKey, dbBody)
        .then(function (res) {
            console.log(res);
            response.write(objectKey);
            response.end();
        }).fail(function (err) {
            logAndRespondWithError(err);
        });

});

//Here is a getter for all of your endpoints
router.get('/all/', function (request, response) {
    db.newSearchBuilder()
        .collection(collection)
        .limit(100)
        .offset(0)
        .query('*')
        .then(function (result) {
            var results = result.body.results;
            console.log(results);
            response.contentType('application/json');
            response.write(buildResponse(results));
            response.end();
        }).fail(function(err){
            logAndRespondWithError(err)
        });
});

router.get('/:id', function (request, response) {
    db.get(collection, request.params.id)
        .then(function (result) {
            console.log(result.body);
            response.contentType('application/json');
            response.write(JSON.stringify(result.body));
            response.end();
        }).fail(function(err){
            logAndRespondWithError(err)
        });
});

router.delete('/:id', function (request, response) {
    db.remove(collection, request.params.id)
        .then(function (result) {
            console.log(result.body);
            response.end();
        }).fail(function(err){
            logAndRespondWithError(err)
        });
});

function logAndRespondWithError(err) {
    console.log(err);
    response.status(500);
    response.contentType('application/json');
    response.write(JSON.stringify(err));
    response.end();
}

function destinationTypeCheck(destinations) {
    for (var i = 0; i < destinations.length; i++) {
        switch (destinations[i].type) {
            case "CONSOLE":
                console.log("Supported Type: " + destinations[i].type);
                break;
            case "CUSTOM WEBHOOK":
                console.log("Supported Type: " + destinations[i].type);
                break;
            case "FILE":
                console.log("Supported Type: " + destinations[i].type);
                break;
            default:
                response.status(500);
                response.write("Only CONSOLE or CUSTOM WEBHOOK type endpoints are currently supported");
                response.end();
                break;
        }
    }
}

function buildResponse(results) {
    response = "[";
    for (var i = 0; i < results.length; i++) {
        response += JSON.stringify(results[i].value);
        if (i < results.length - 1) {
            response += ",";
        }
    }
    response += "]";
    return response;
}
module.exports = router;