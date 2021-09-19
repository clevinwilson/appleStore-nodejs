const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user/index')
});

router.get('/login',(req,res)=>{
  res.render('user/login')
})


//signup page
router.get('/signup',(req,res)=>{
  res.render('user/signup')
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
