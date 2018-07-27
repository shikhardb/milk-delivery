var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

var Q = require('Q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('milkdata');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.post('/new/aggregator', newData);
router.get('/all', getAllDeliveries);

module.exports = router;

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function newData(data, res) {
    var deferred = Q.defer();

    db.milkdata.insert(
        data.body,
        function (err, doc) {
            if (err) {
                deferred.reject(err.name + ': ' + err.message);
                res.status(400).send(err);
            } else {
                res.sendStatus(200);
            }

            deferred.resolve();
        });

    return deferred.promise;
}

function getAllDeliveries(req, res) {
    var deferred = Q.defer();

    var cursor = db.milkdata.find();

    db.milkdata.find({}).toArray(function(error, doc){
        if (error) {
            deferred.reject(error.name + ': ' + error.message);
            err.status(400).send(error);
        } else {
            res.status(200).send(JSON.stringify(doc));
        }

        deferred.resolve();
    })

    return deferred.promise;
}