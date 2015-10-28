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
    var object = JSON.stringify(request.body);

    console.log(object);

    db.get(collection, request.params.id).then(function (result) {
        console.log(result.body);
        response.end();
    }).fail(function (err) {
        console.log(err);
    });
});


module.exports = router;
