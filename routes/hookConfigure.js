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
    var body = request.body;

    for (var i=0; i<body.length; i++){
        if (!(body[i].type.toString() === "CONSOLE")) {
            response.status(500);
            response.write("Only CONSOLE type endpoints are currently supported");
            response.end();
        }
    }

    var dbBody = {
        "destinations": request.body,
        "url": "/hook/" + objectKey
    };
    console.log(dbBody);
    db.put(collection, objectKey, dbBody).then(function (res) {
        console.log(res);
        response.write(objectKey);
        response.end();
    }).fail(function (err) {
        console.log(err); // prints error
        response.status(500);
        response.contentType('application/json');
        response.write(JSON.stringify(err));
        response.end();
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
            console.log(result.body.results);
            response.contentType('application/json');
            response.write("[");
            for (var i = 0; i < result.body.count; i++) {
                response.write(JSON.stringify(result.body.results[i].value));
                if (i < result.body.count -1){
                    response.write(",");
                }
            }
            response.write("]");
            response.end();
        })
        .fail(function (err) {
            console.log(err); // prints error
            response.status(500);
            response.contentType('application/json');
            response.write(JSON.stringify(err));
            response.end();
        });

});

router.get('/:id', function (request, response) {
    var object = JSON.stringify(request.body);

    console.log(object);

    db.get(collection, request.params.id).then(function (result) {
        console.log(result.body);
        response.contentType('application/json');
        response.write(JSON.stringify(result.body.results));
        response.end();
    }).fail(function (err) {
        console.log(err);
        response.status(500);
        response.contentType('application/json');
        response.write(JSON.stringify(err));
        response.end();
    });
});


router.delete('/:id', function (request, response) {
    var object = JSON.stringify(request.body);

    console.log(object);

    db.remove(collection, request.params.id).then(function (result) {
        console.log(result.body);
        response.end();
    }).fail(function (err) {
        console.log(err);
        response.status(500);
        response.contentType('application/json');
        response.write(JSON.stringify(err));
        response.end();
    });
});

module.exports = router;