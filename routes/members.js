var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('members/home-page',{member:true});
});

module.exports = router;
