const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user/index')
});

router.get('/login',(req,res)=>{
  res.render('user/login')
})


//signup page
router.get('/signup',(req,res)=>{
  res.render('user/signup',{signupError:req.session.signupError})
  req.session.signupError=false;
})

router.post('/signup',(req,res)=>{
 if(req.body.firstname.toString().length && req.body.lastname.toString().length && req.body.email.toString().length && req.body.password.toString().length && req.body.password.toString().length > 3){
  userHelper.doSignup(req.body).then((response)=>{
    if(response){
      res.json({status:true})
    }else{
      res.json({status:false})
    }
  })
 }else{
   req.session.signupError="Something went wrong try again"
 }
})


//index page
router.get('/imac',(req,res)=>{
  res.render('user/imac')
})

//iphone page 
router.get('/iphone',(req,res)=>{
  productHelper.getPhones().then((products)=>{
    res.render('user/iphone',{products:products})
  })
})

//iphone 12 page
router.get('/iphone-12',(req,res)=>{
  res.render('user/iphone-12')
})

//buy product page 
router.get('/buy-product',(req,res)=>{
  res.render('user/buy-product')
})

module.exports = router;
