var fs = require('fs'),
    path = require('path'),
    
    // utilities
    Q = require('q'),
    
    // image processing and face detection
    lwip = require('lwip'),
    oxford = require('project-oxford'),
    client = new oxford.Client(process.env.OXFORD_API),
    
    // web app
    express = require('express'),
    app = express(),
    multer = require('multer');

// initialize global variables
var imgSrc = process.argv[2] || 'defualt-img.png',
    imgSrcHeight = 300,
    imgSrcWidth = 300;

// express middleware and view engine
app.use(express.static('output'));
app.set('view engine', 'jade');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

if (fs.existsSync('output') === false) {
    fs.mkdirSync('output');
}

app.use(multer({
    storage: storage
}).single('userPhoto'));

// routes
app.get('/', getIndex)
app.get('/bobble', displayBobble)
app.post('/api/photo', generateBobble)

// spin up port
var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on http://localhost:' + port);


function getIndex(req, res) {
    var url = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.redirect('http://nyanit.com/' + url + 'bobble');
}

function generateBobble(req, res) {
    imgSrc = req.file.path;
    detectFace()
        .then(generateBobblePermutations)
        .then(generateGif)
        .then(function() {
            res.redirect('/bobble')
        })
}

function displayBobble(req, res) {
    res.render('index', {
        title: 'Bobblehead Generator',
        message: 'Bobble!',
        imgs: ['myanimated.gif']
    });
}

function detectFace() {
    return client.face.detect({
        path: imgSrc,
        analyzesAge: true,
        analyzesGender: true
    })
}

function generateBobblePermutations(response) {
    var faceRectangle = response[0].faceRectangle;
    var degreesArray = [10, 0, -10];
    
    console.log(imgSrc);

    var promises = [];
    for (var i = 0; i < degreesArray.length; i++) {
        var degrees = degreesArray[i];
        var outputName = 'output/' + i + path.basename(imgSrc, path.extname(imgSrc)) + '.png';

        var promise = cropHeadAndPasteRotated(faceRectangle, degrees, outputName);
        promises.push(promise);
    }

    return Q.all(promises);
}


function cropHeadAndPasteRotated(faceRectangle, degrees, outputName) {
    // face detection algorithms typically begin at the eyes, and on average eyes lie
    // in the middle of the head. So compensate for this by moving the top up and
    // increase height appropriately.
    var height = faceRectangle['height'];
    var top = faceRectangle['top'] - height * 0.5;
    height *= 1.6;

    var left = faceRectangle['left'];
    var width = faceRectangle['width'];
    var right = left + width;
    var bottom = top + height;

    var deferred = Q.defer();

    lwip.open(imgSrc, function(err, image) {
        imgSrcWidth = image.width();
        imgSrcHeight = image.height();
        image.batch()
            .crop(left, top, right, bottom)
            .scale(1.05)
            .rotate(degrees, {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            })
            .exec(function(err, newImage) {
                lwip.open(imgSrc, function(err, img) {
                    img.batch()
                        .paste(left - (1.1 * width - width), top - (1.05 * height - height), newImage)
                        .writeFile(outputName, function(err) {
                            console.log(outputName);
                            // check err
                            deferred.resolve();
                        });
                });
            });
    });

    return deferred.promise;
}

function generateGif() {
    var GIFEncoder = require('gifencoder');
    var encoder = new GIFEncoder(imgSrcWidth, imgSrcHeight);
    var pngFileStream = require('png-file-stream');
    var fs = require('fs');
    var deferred = Q.defer();

    pngFileStream('output/?' + path.basename(imgSrc, path.extname(imgSrc)) + '.png')
        .pipe(encoder.createWriteStream({
            repeat: 0,
            delay: 500,
            quality: 10
        }))
        .pipe(fs.createWriteStream('output/myanimated.gif'))
        .on('finish', function() {
            deferred.resolve();
        });
    return deferred.promise;
}