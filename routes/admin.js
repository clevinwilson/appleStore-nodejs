var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helpers');


//login 
router.get('/', (req, res) => {
    res.render('admin/login',{adminLoginError:req.session.adminLoginError});
    req.session.adminLoginError = false;
})
router.post('/login', (req, res) => {
    adminHelper.doLogin(req.body).then((response) => {
        if (response.status) {
            if (response.status) {
                console.log(response.admin);
                req.session.admin = response.admin;
                req.session.loggedIn = true;
                console.log(req.session.admin);
                res.redirect("/admin/dashboard");
            } else {
                req.session.adminLoginError = "Incorrect username or password ";
                res.redirect("/admin");
            }
        }else {
            req.session.adminLoginError = "Incorrect username or password ";
            console.log(req.session.adminLoginError);
            res.redirect("/admin");
          }
    })
})




module.exports = router;
