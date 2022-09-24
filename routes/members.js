var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var memberHelper = require('../helpers/member-helper')

const verifiyLogin = (req, res, next) => {
  if (req.session.loginStatus = true) next()

  else {
    res.render('./member/member-login')
  }
  
}



/* GET users listing. */
router.get('/', function (req, res, next) {

console.log(req.session.member)
  res.render('members/member-home-page',{member:req.session.member});
});

router.get("/attendance-history", (req, res) => {
  res.render('./members/attendance-history.hbs',{member:req.session.member})
})

router.get('/member-login', (req, res) => {
  if (req.session.memberLogin == true) {
    res.render('./members/member-home-page', { message: "You are already loged in" ,member:req.session.member})
  } else {
    res.render('./members/member-login')
  }
})

router.post('/member-login', (req, res) => {
  let mobileNum = req.body.mobile;
  let password = req.body.password;
  console.log(req.body)
  memberHelper.doMemberLogin(mobileNum, password).then((result) => {
    if (result) {
      req.session.member = result.member;
      req.session.loginStatus = true;
      req.session.memberLogin = true;
      console.log('session created')
      res.render('./members/member-home-page', { member: result.member })
    }
  }).catch((data) => {
    if (data) {
      res.render('./members/member-login', { loginErr: data.loginErr })
    }
  })

})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
