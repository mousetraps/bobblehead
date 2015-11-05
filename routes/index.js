var express = require('express');
var FB = require('fb');
var config = require('../config');

var router = express.Router();

FB.options(config.facebook);

/* GET home page. */
router.get('/', function(req, res, next) {
  var accessToken = req.session.access_token;
  if (!accessToken) {
    res.render('index', {
      title: 'Express',
      loginUrl: FB.getLoginUrl({ scope: 'user_about_me' })
    })
  } else {
    res.render('index', { title: 'Express' });
  }
});

module.exports = router;
