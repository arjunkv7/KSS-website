var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')


const verifiyLogin = ((req, res, next) => {
  if (req.session.adminLogin == true) next()

  else {

    res.redirect('/admin-login')
  }
})

/* GET home page. */
router.get('/', function (req, res, next) {


  res.render('./admin/admin-home-page', { admin: req.session.admin });
});

router.get('/admin-signup', async (req, res) => {

  await adminHelper.adminExist().then((data) => {
    if (data >= 2) {

      res.render('./admin/admin-login.hbs', { err: "Maximum number of admin reached" })
    }
    else {

      res.render('./admin/admin-signup.hbs')
    }
  })

})

router.post("/admin-signup", (req, res) => {
  console.log(req.body)

  adminHelper.doAdminSignup(req.body.username, req.body.mobileNumber, req.body.password)
  res.redirect('/')
})

router.get('/admin-login', (req, res) => {

  if (req.session.adminLogin == true) {

    res.render('./admin/admin-home-page', { message: 'You are already loged in', admin: req.session.admin })
  } else {

    adminHelper.adminExist().then((data) => {
      console.log(data)

      if (data > 0) {

        res.render('./admin/admin-login.hbs')
      }
      else {

        res.render('./admin/admin-signup.hbs')
      }
    })
  }

})

router.get('/logout', (req, res) => {
  req.session.destroy()

  res.redirect("/")
})

router.post("/admin-login", (req, res) => {
  console.log(req.body)

  adminHelper.doadminLogin(req.body.mobile, req.body.password).then((data) => {
    console.log(data)

    req.session.adminLogin = true;
    req.session.loginStatus = true;
    req.session.admin = data.admin;
    console.log(req.session.admin)

    res.render('./admin/admin-home-page', { admin: req.session.admin })

  }).catch((err) => {
    console.log(err)

    res.render("./admin/admin-login.hbs", { loginErr: err.loginErr })
  })
})

router.get('/add-deposit', verifiyLogin, (req, res) => {

  res.render("./admin/add-deposit", { admin: req.session.admin })
})

router.get('/add-remove-member', verifiyLogin, (req, res) => {

  res.render("./admin/add-remove-member", { admin: req.session.admin })
})

router.get('/add-new-member', verifiyLogin, (req, res) => {

  res.render("./admin/add-new-member", { admin: req.session.admin })
})

router.get('/remove-member', verifiyLogin, (req, res) => {
  adminHelper.getAllMembers().then((data) => {

    let allMembers = data

    console.log(allMembers)

    res.render('./admin/remove-member', { admin: req.session.admin, allMembers })
  })
})

router.post('/add-deposit', verifiyLogin, (req, res) => {
  let member = req.body.member;
  console.log(member)

  res.render('./admin/do-deposit', { admin: req.session.admin })
})

router.post('/admin-add-new-member', (req, res) => {

  let memberName = req.body.username;
  let memberMobile = req.body.mobileNumber;

  console.log(memberName, memberMobile);

  adminHelper.addNewMember(memberName, memberMobile).then((data) => {
    res.render('./admin/admin-home-page', { message: "New member " + memberName + " was added to the database" })
  }).catch((data) => {
    console.log(data)

    res.render("./admin/add-new-member", { admin: req.session.admin, message: "Mobile number already exist" })
  })
})

router.post("/remove-member", (req, res) => {
  let memberName = req.body.member;

  console.log(memberName)

  adminHelper.removeMember(memberName).then((data) => {

    res.render('./admin/admin-home-page', { message: "Member removed successfully" })
  }).catch()

})

module.exports = router;
