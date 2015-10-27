var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));

router.route('/')
    // get all instruments
    .get(function (req, res, next) {
        mongoose.model('Instrument').find({}, function (err, instruments) {
            if (err) {
                return console.error(err);
            } else {
                res.format({
                    html: function () {
                        res.render('instruments/index', {
                            title: 'All instruments',
                            "instruments": instruments
                        })
                    },
                    json: function () {
                        res.json(instruments)
                    }
                });
            }
        })
    })
    // post a new instrument
    .post(function (req, res) {
        var make = req.body.make;
        var model = req.body.model;
        var year = req.body.year;
        var price = req.body.price;

        mongoose.model('Instrument').create({
            make: make,
            model: model,
            year: year,
            price: price
        }, function (err, instrument) {
            if (err) {
                res.send('There was a problem adding the instrument to the database.')
            } else {
                console.log("POST creating new instrument: " + instrument);
                res.format({
                    html: function () {
                        res.location('instruments')
                        res.redirect('/instruments')
                    },
                    json: function () {
                        res.json(instrument)
                    }
                });
            }
        })
    });

// get new Instrument page
router.get('/new', function (req, res) {
    res.render('instruments/new', {title: 'Add new instrument'})
});

//router middleware to find and validate :id
router.param('id', function (req, res, next, id) {
    mongoose.model('Instrument').findById(id, function (err, instrument) {
        if (err) {
            console.log(id + ' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function () {
                    next(err);
                },
                json: function () {
                    res.json({message: err.status + ' ' + err});
                }
            });
        } else {
            console.log(instrument);
            req.id = id;
            next()
        }
    })
});

router.route('/:id')
    .get(function (req, res) {
        mongoose.model('Instrument').findById(req.id, function (err, instrument) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err)
            } else {
                console.log('GET Retrieving ID: ' + instrument._id);
                res.format({
                    html: function () {
                        res.render('instruments/show', {
                            "instrument": instrument
                        })
                    },
                    json: function () {
                        res.json(instrument);
                    }
                });
            }
        });
    });

// get the instrument by Mongo ID
router.route('/:id/edit')
    .get(function (req, res) {
        mongoose.model('Instrument').findById(req.id, function (err, instrument) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + instrument._id);
                res.format({
                    html: function () {
                        res.render('instruments/edit', {
                            title: 'Instrument ' + instrument._id,
                            "instrument": instrument
                        })
                    },
                    json: function () {
                        res.json(instrument);
                    }
                });
            }
        });
    })

// PUT to update an instrument by ID
    .put(function (req, res) {
        var make = req.body.make;
        var model = req.body.model;
        var year = req.body.year;
        var price = req.body.price;
        mongoose.model('Instrument').findByID(req.id, function (err, instrument) {
            instrument.update({
                make: make,
                model: model,
                year: year,
                price: price
            }, function (err, instrumentID) {
                if (err) {
                    res.send("There was a problem updating the instrument to the database: " + err);
                } else {
                    res.format({
                        html: function () {
                            res.redirect('/instruments/' + instrument._ID)
                        },
                        json: function () {
                            res.json(instrument)
                        }
                    })
                }
            })
        })
    })

// delete an instrument by ID
    .delete(function (req, res) {
        mongoose.model('Instrument').findById(req.id, function (err, instrument) {
            if (err) {
                return console.error(err);
            } else {
                instrument.remove(function (err, instrument) {
                    if (err) {
                        return console.error(err)
                    } else {
                        console.log('DELETE removing ID: ' + instrument._id);
                        res.format({
                            html: function () {
                                res.redirect('/instruments')
                            },
                            json: function () {
                                res.json({
                                    message: 'deleted',
                                    item: instrument
                                });
                            }
                        });
                    }
                });
            }
        });
    });

module.exports = router;