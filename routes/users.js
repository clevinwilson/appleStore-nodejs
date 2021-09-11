var express = require('express');
var router = express.Router();

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
module.exports = router;
