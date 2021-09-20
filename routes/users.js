const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
      next();
  } else {
      res.redirect("/login");
  }
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.session.user);
    res.render('user/index',{user:req.session.user});

});

//login 
router.get('/login',(req,res)=>{
  if( req.session.loggedIn){
    res.redirect('/');
  }else{
  res.render('user/login',{loginError:req.session.loginError})
  req.session.loginError=false;
  }
})

router.post('/signin',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user;
      res.redirect('/');
    }else{
      req.session.loginError=response.message
      res.redirect('/login')
    }
  })
})

//logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/')
})


//signup page
router.get('/signup',(req,res)=>{
  if( req.session.loggedIn){
    res.redirect('/');
  }else{
  res.render('user/signup',{signupError:req.session.signupError})
  req.session.signupError=false;
  }
})

router.post('/signup',(req,res)=>{
 if(req.body.firstname.toString().length && req.body.lastname.toString().length && req.body.email.toString().length && req.body.password.toString().length && req.body.password.toString().length > 3){
  userHelper.doSignup(req.body).then((response)=>{
    if(response.status){
      res.json({status:true})
    }else{
      req.session.signupError="Something went wrong or User already exists "
      console.log('false');
      res.json({status:false})
    }
  })
 }else{
   req.session.signupError="Something went wrong try again"
 }
})


//index page
router.get('/imac',(req,res)=>{
  res.render('user/imac',{user:req.session.user})
})

//iphone page 
router.get('/iphone',(req,res)=>{
  productHelper.getPhones().then((products)=>{
    res.render('user/iphone',{products:products,user:req.session.user})
  })
})

//iphone 12 page
router.get('/iphone-12',(req,res)=>{
  res.render('user/iphone-12',{user:req.session.user})
})

//buy product page 
router.get('/buy-product/:productId',(req,res)=>{
  productHelper.getProductDetails(req.params.productId).then((productDetails)=>{
    if(productDetails){
      res.render('user/buy-product',{user:req.session.user,productDetails:productDetails});
    }else{
      res.redirect('/');
    }
  })
})

module.exports = router;
