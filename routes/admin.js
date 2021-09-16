var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-helpers');
var productHelper =require('../helpers/product-helpers');



// verifyLogin

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/admin");
    }
};

//login 
router.get('/', (req, res) => {
    res.render('admin/login', { adminLoginError: req.session.adminLoginError });
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
                res.render("admin/dashboard", { admin: req.session.admin });
            } else {
                req.session.adminLoginError = "Incorrect username or password ";
                res.redirect("/admin");
            }
        } else {
            req.session.adminLoginError = "Incorrect username or password ";
            console.log(req.session.adminLoginError);
            res.redirect("/admin");
        }
    })
})

//dashboard

router.get('/dashboard', verifyLogin, (req, res) => {
    res.render('admin/dashboard', { admin: req.session.admin })
})

//logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

//add product 
router.get('/add-product',verifyLogin,(req,res)=>{
    res.render('admin/add-product',{admin:req.session.admin})
})

router.post('/add-product',verifyLogin,(req,res)=>{
    console.log(req.body);
    console.log(req.files.colorimage);
})





module.exports = router;
