
const { response } = require('express');
var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');



// verifyLogin

const verifyLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
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
                req.session.adminLoggedIn = true;
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
router.get('/add-product', verifyLogin,async (req, res) => {
    let category = await productHelpers.getCategory();
    res.render('admin/add-product', { admin: req.session.admin,deviceError:req.session.deviceError,deviceSucc:req.session.deviceSucc,category:category})
    req.session.deviceError=false;
    req.session.deviceSucc=false;
})



router.post('/add-product', verifyLogin, async (req, res) => {
    productHelpers.addProduct(req.body).then((response) => {
        if (Array.isArray(req.files.colorimage)) {
            if (req.files.colorimage) {
                let colorimage = req.files.colorimage;
                for (var i = 0; i < req.files.colorimage.length; i++) {
                    colorimage[i].mv('./public/device-colors/' + response +  req.body.color[i]+ '.jpg', (err) => {
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
        let allcolors = req.files.allcolors;
        processorimage.mv('./public/device-processor/' + response + '.jpg', (err) => {
            productimage.mv('./public/device-image/' + response + '.jpg', (err) => {
                allcolors.mv('./public/device-all-colors/' + response + '.jpg', (err) => {
                    if (!err) {
                        res.render('admin/add-storageoptions',{productId:response,admin:req.session.admin});
                    } else {
                        req.session.deviceError = "Something went wrong try again"
                        res.redirect('/admin/add-product');
                    }
                })
            })
        })
    })
})



router.get('/add-storageoptions/:productId',verifyLogin,(req,res)=>{
    res.render('admin/add-storageoptions',{admin:req.session.admin,productId:req.params.productId})
})

router.post('/add-storage',verifyLogin,(req,res)=>{
    console.log(req.body);
    productHelpers.addStorage(req.body).then((response)=>{
       if(response){
        req.session.deviceSucc = "Added Successfully";
        res.json({status:true})
       }else{
        res.json({status:false})
       }
    })
})

router.get('/check-product/:productId',verifyLogin,(req,res)=>{
    productHelpers.checkProduct(req.params.productId).then((response)=>{
       if(response.status){
           res.json({status:true})
       }else{
           res.json({status:false})
       }
    })
})

router.get('/manage-product',verifyLogin,(req,res)=>{
    productHelpers.getProducts().then((products)=>{
        res.render('admin/manage-products',{admin:req.session.admin,products:products})
    })
})
router.get('/delete-product/:id',verifyLogin,(req,res)=>{
    console.log('delet');
    productHelpers.deleteProduct(req.params.id).then((response)=>{
        if(response){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    })
})

// category 
router.get('/add-category',verifyLogin,(req,res)=>{
    res.render('admin/add-category',{admin: req.session.admin,categorySucc:req.session.categorySucc,categoryError:req.session.categoryError});
    req.session.categorySucc=false;
    req.session.categoryError=false
})

router.post('/add-category',verifyLogin,(req,res)=>{
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

router.get('/manage-category',verifyLogin,(req,res)=>{
    productHelpers.getCategorys().then((response)=>{
        res.render('admin/manage-category',{admin:req.session.admin,category:response,editCategoryError:req.session.editCategoryError});
        req.session.editCategoryError=false
    })
})

router.get('/edit-category/:categoryId',(req,res)=>{
    productHelpers.getCategory(req.params.categoryId).then((response)=>{
        res.render('admin/edit-category',{admin:req.session.admin,category:response})
       
    })
})

router.post('/edit-category/:categoryId',(req,res)=>{
    productHelpers.editCategory(req.params.categoryId,req.body).then((response)=>{
        console.log(response);
       if(response){
        res.redirect('/admin/manage-category')
       }else{
        req.session.editCategoryError='Something went wrong try again or Category already exists .'
        res.redirect('/admin/manage-category')
        
       }
    })
})



router.get('/delete-category/:id',verifyLogin,(req,res)=>{
    productHelpers.deleteCategory(req.params.id).then((response)=>{
        if(response){
            res.json({status:true})
        }else{
            res.json({status:false})
        }
    })
})

router.get('/manage-orders',verifyLogin,(req,res)=>{
    adminHelpers.getOrders().then((response)=>{
        res.render('admin/manage-orders',{admin:req.session.admin,orders:response})
    })
  })

router.get('/update-status/:number/:orderId',(req,res)=>{
    if(req.params.number == 1){
        adminHelpers.updateStatusToShipped(req.params.orderId).then((response)=>{
            res.redirect('/admin/manage-orders');
        })
    }else if(req.params.number == 2){
        adminHelpers.udateStatusToDelivered(req.params.orderId).then((response)=>{
            res.redirect('/admin/manage-orders');
        })
    }else{
        res.redirect('/admin/manage-orders');
    }
})

router.get('/cancel-order/:orderId',(req,res)=>{
    adminHelpers.cancelOrder(req.params.orderId).then((response)=>{
        res.json({status:true})
    })
})

router.get("/settings", verifyLogin, (req, res) => {
    res.render("admin/settings", { admin: req.session.admin });
  });

//Admin profile
router.get('/profile',verifyLogin,(req,res)=>{
    let admin = req.session.admin;
    res.render('admin/profile',{admin,"imagesucc":req.session.imagesucc,"imgerror":req.session.imgerror})
    req.session.imagesucc=false
    req.session.imgerror=false
  })
  
  router.post('/profile/:id',verifyLogin,(req,res)=>{
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/admin-photo/' + req.params.id + '.jpg',(err)=>{
        if(!err){
          req.session.imagesucc="Photo Updated successfully"
          res.redirect('/admin/profile')
        }else{
          req.session.imgerror="Something went wrong try again"
          res.redirect('/admin/profile')
        }
      })
      
    }
  })

  //change username
router.get("/change-username", verifyLogin, (req, res) => {
    let admin = req.session.admin;
    res.render("admin/change-username", {
      admin,
      usernamemessage: req.session.usernamemessage,
    });
    req.session.usernamemessage = false;
  });
  
  router.post("/changeusername", verifyLogin, (req, res) => {
    let admin = req.session.admin;
    adminHelpers.changeUsername(req.body, req.session.admin._id).then((response) => {
        if (response.status) {
          req.session.usernamemessage = {
            message: "User Name Updated Successfully",
            color: "green",
          };
          res.redirect("/admin/change-username");
        } else {
          req.session.usernamemessage = {
            message: response.message,
            color: "red",
          };
          res.redirect("/admin/change-username");
        }
      });
  });

  // admin change passwor router
router.get("/change-password", verifyLogin, (req, res) => {
    let admin = req.session.admin;
    res.render("admin/change-password", {
      admin,passwordmessage: req.session.passwordmessage,
    });
    req.session.passwordmessage = false;
  });
  
  //change password
  router.post("/changePassword", verifyLogin, (req, res) => {
    let admin = req.session.admin._id;
    adminHelpers.changePassword(req.body, admin).then((response) => {
      if (response.status) {
        req.session.passwordmessage = {
          message: "Password Updated Successfully",
          color: "green",
        };
        res.redirect("/admin/change-password");
      } else {
        req.session.passwordmessage = {
          message: response.message,
          color: "red",
        };
        res.redirect("/admin/change-password");
      }
    });
  });













module.exports = router;
