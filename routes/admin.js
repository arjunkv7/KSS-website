var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')

/* GET home page. */
router.get('/', function(req, res, next) {

  
  res.render('./admin/admin-home-page',);
});

router.get('/admin-signup',async(req,res)=>{

 await adminHelper.adminExist().then((data)=>{
    if(data >= 2){
      res.render('./admin/admin-login.hbs',{err:"Maximum number of admin reached"})
    }
    else
    {
      res.render('./admin/admin-signup.hbs')
    }
  })
  
})

router.post("/admin-signup",(req,res)=>{
  console.log(req.body)
  adminHelper.doAdminSignup(req.body.username,req.body.password)
  res.redirect('/')
})

router.get('/admin-login',(req,res)=>{

  adminHelper.adminExist().then((data)=>{
    console.log(data)
    if (data > 0 ){
      res.render('./admin/admin-login.hbs')
    }
    else {
      res.render('./admin/admin-signup.hbs')
    }
  })
  
})

router.post("/admin-login",(req,res)=>{
  console.log(req.body)
  adminHelper.doadminLogin(req.body.mobile,req.body.password).then((data)=>{
    console.log(data)
    req.session.adminLogin = true ;
    req.session.admin = data.admin ;
    res.render('./admin/admin-home-page',{admin:req.session.admin})
    
  }).catch((err)=>{
    console.log(err)
    res.render("./admin/admin-login.hbs",{loginErr:err.loginErr})
  })
})

module.exports = router;
