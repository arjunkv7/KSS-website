var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')

/* GET users listing. */
router.get('/', function(req, res, next) {


  res.render('members/member-home-page',);
});

router.get("/attendance-history",(req,res)=>{
  res.render('./members/attendance-history.hbs')
})

module.exports = router;
