
const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');



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
    adminHelpers.doLogin(req.body).then((response) => {
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
router.get('/add-product', verifyLogin, (req, res) => {
    res.render('admin/add-product', { admin: req.session.admin,deviceError:req.session.deviceError,deviceSucc:req.session.deviceSucc })
    req.session.deviceError=false;
    req.session.deviceSucc=false;
})

router.post('/add-product', verifyLogin, async (req, res) => {
    productHelpers.addProduct(req.body).then((response) => {
        if (Array.isArray(req.files.colorimage)) {
            if (req.files.colorimage) {
                let colorimage = req.files.colorimage;
                for (var i = 0; i < req.files.colorimage.length; i++) {
                    colorimage[i].mv('./public/device-colors/' + response + i + '.jpg', (err) => {
                        if (err) {
                            req.session.deviceError = "Something went wrong try again"
                             res.redirect('/admin/add-product')
                            
                        }
                    })

                }
            }
        } else {

            if (req.files.colorimage) {
                let colorimage = req.files.colorimage
                colorimage.mv('./public/device-colors/' + response + 0 + '.jpg', (err) => {
                    if (err) {
                        req.session.deviceError = "Something went wrong try again"
                         res.redirect('/admin/add-product');
                        
                    }
                })

            }
        }



        let processorimage = req.files.processorimage;
        let productimage = req.files.productimage;
        processorimage.mv('./public/device-processor/' + response + '.jpg', (err) => {
            productimage.mv('./public/device-image/' + response + '.jpg', (err) => {
                if (!err) {
                    req.session.deviceSucc = "Added Successfully"
                    res.redirect('/admin/add-product');
                } else {
                    req.session.deviceError = "Something went wrong try again"
                    res.redirect('/admin/add-product');
                }
            })
        })
    })
})

//add category 
router.get('/add-category',verifyLogin,(req,res)=>{
    res.render('admin/add-category',{admin: req.session.admin,categorySucc:req.session.categorySucc,categoryError:req.session.categoryError});
    req.session.categorySucc=false;
    req.session.categoryError=false
})

router.post('/add-category',(req,res)=>{
    productHelpers.addCategory(req.body).then((response)=>{
        if(response){
            req.session.categorySucc="Added Successfully";
            res.redirect('/admin/add-category');
        }else{
            req.session.categoryError = "Something went wrong try again or Category already exists .";
            res.redirect('/admin/add-category');
        }
    })
})










module.exports = router;
