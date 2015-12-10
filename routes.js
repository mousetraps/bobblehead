var Q = require('q'),
    path = require('path'),
    fs = require('fs'),

    bobble = require('./bobble.js');
    
var IS_NYAN = false;

exports.getIndex = function (req, res) {
    var url = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.redirect((IS_NYAN ? 'http://nyanit.com/' : '') + url + 'bobble');
}

exports.generateBobble = function (req, res) {
    var imgSrc = req.file.path;
    bobble.detectFace(req.file.path)
        .then(bobble.generateBobblePermutations)
        .then(bobble.generateGif)
        .then(function () {
        console.log('generate');
        res.redirect(301, '/bobble/' + path.basename(imgSrc, path.extname(imgSrc)));
    })
}

exports.displayBobble = function (req, res) {
    var myImg = 'myanimated.gif';
    console.log(req.params['bobbleId'])
    if (typeof req.params['bobbleId'] !== 'undefined') {
        myImg = req.params['bobbleId'] + '.gif';
    }
    console.log('my image:', myImg);
    // res.end('hello');
    res.render('index', {
        title: 'Bobblehead Generator',
        location: "http://nyanit.com/" + req.get('host') + '/bobble/' + path.basename(myImg, path.extname(myImg)),
        imgs: [myImg]
    });
    // res.end('hello');
}
