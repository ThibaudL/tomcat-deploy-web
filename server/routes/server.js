var express = require('express');
var deploydb = require('../deploydb');
var router = express.Router();
var bodyParser = require('body-parser');

/* GET users listing. */
router.get('/', function (req, res, next) {
    var config = deploydb.config() || {data: [{}]};
    res.json( config.data[0]);
});
router.put('/', bodyParser.json(), function (req, res, next) {
    var body = req.body;
    var config = deploydb.config();
    deploydb.save(config, body);
    res.json(body);
});

module.exports = router;