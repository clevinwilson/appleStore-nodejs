
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
    res.render('admin/add-product', { admin: req.session.admin })
})

router.post('/add-product', verifyLogin, async (req, res) => {
    console.log(req.body);
    productHelpers.addProduct(req.body).then((response)=>{


        if(Array.isArray(req.files.colorimage)){
            if (req.files.colorimage) {
                let image = req.files.colorimage;
                for (var i = 0; i < req.files.colorimage.length; i++) {
                    image[i].mv('./public/device-colors/' + req.body.productname+i + '.jpg', (err) => {
                        if (!err) {
                            // req.session.imagesucc="Photo Updated successfully"
                            // res.redirect('/admin/profile')
                            console.log('succ');
                        } else {
                            // req.session.imgerror="Something went wrong try again"
                            // res.redirect('/admin/profile')
                            console.log('err');
                        }
                    })
        
                }
            }
        }else{
    
            if(req.files.colorimage){
                let colorimage=req.files.colorimage
                colorimage.mv('./public/device-colors/' + req.body.productname+ 'q' + '.jpg',(err)=>{
                  if(!err){
                    req.session.imagesucc="Photo Updated successfully"
                    // res.redirect('/admin/profile')
                  }else{
                    req.session.imgerror="Something went wrong try again"
                    // res.redirect('/admin/profile')
                  }
                })
                
              }
        }

    })
})











module.exports = router;
