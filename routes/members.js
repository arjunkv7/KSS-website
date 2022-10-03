var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
var memberHelper = require('../helpers/member-helper')

const verifiyLogin = (req, res, next) => {
  if (req.session.loginStatus == true) next()

  else {
    res.render('./members/member-login')
  }

}



/* GET users listing. */
router.get('/', function (req, res, next) {

  console.log(req.session.member)
  res.render('members/member-home-page', { member: req.session.member });
});

router.get("/attendance-history", (req, res) => {
  res.render('./members/history-by-date-or-name', { member: req.session.member })
})

router.get('/history-by-name', verifiyLogin, (req, res) => {
  adminHelper.getAllMembers().then((data) => {
    let allMembers = data
    console.log(allMembers)
    res.render('./members/att-history-by-name', { member: req.session.member, allMembers })
  })
})

router.get('/history-by-date',verifiyLogin,(req,res)=>{
  adminHelper.getAllDates(req.session.member["mobile number"]).then((Dates)=>{
    let allDates = Dates ;
    console.log(allDates)
    console.log(req.session.member["mobile number"])
    res.render("./members/att-history-by-date",{ member: req.session.member,allDates})
  })
})

router.post('/show-history-by-date',verifiyLogin,(req,res)=>{
  let date = req.body.date;
  adminHelper.getAllDates(req.session.member["mobile number"]).then((Dates)=>{
    let allDates = Dates
  adminHelper.getAttDetailsByDate(date).then((data)=>{
    let attDetails = data
     res.render("./members/att-history-by-date",{ member: req.session.member,allDates,attDetails})
    
  })
})
})

router.post('/show-history-by-name', verifiyLogin, (req, res) => {
  let member = req.body.member
  console.log(member)

  adminHelper.getAllMembers().then((data) => {
    let allMembers = data
    console.log(allMembers)
    adminHelper.getAllMemberDetails(member).then((allDepositDetails) => {
      console.log(allDepositDetails)
      res.render('./members/att-history-by-name', { admin: req.session.admin, allDepositDetails,allMembers })
    })
  })

})

router.get('/member-login', (req, res) => {
  if (req.session.memberLogin == true) {
    res.render('./members/member-home-page', { message: "You are already loged in", member: req.session.member })
   } 
  else if (req.session.adminLogin == true) {
     res.render('./members/member-home-page', { message: "Please Logout first" })
   } 
  else {
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

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/mark-attendance', verifiyLogin, (req, res) => {
  res.render("./members/mark-attendance", { member: req.session.member })
})

router.post('/mark-attendance', (req, res) => {

  memberHelper.markAttendence(req.body.latitude, req.body.longitude, req.session.member).then((data) => {
    res.render('./members/member-home-page', { message: "Attendence marked successfully" })

  }).catch(() => {
    res.render('./members/mark-attendance', { message: "Invalid Location" })
  })
  console.log(req.body)
})

module.exports = router;
