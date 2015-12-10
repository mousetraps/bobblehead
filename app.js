var fs = require('fs'),
    path = require('path'),
        
    // web app
    express = require('express'),
    app = express(),
    multer = require('multer'),

    routes = require('./routes.js');

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

if (fs.existsSync('uploads') === false) {
    fs.mkdirSync('uploads');
}

app.use(multer({
    storage: storage
}).single('userPhoto'));

// routes
app.get('/', routes.getIndex)
app.get('/bobble', routes.displayBobble)
app.get('/bobble/:bobbleId', routes.displayBobble);
app.post('/api/photo', routes.generateBobble)

// spin up port
var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on http://localhost:' + port);
