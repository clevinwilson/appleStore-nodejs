const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
var userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session.user);
  res.render('user/index', { user: req.session.user });

});

//login 
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/login', { loginError: req.session.loginError })
    req.session.loginError = false;
  }
})

router.post('/signin', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginError = response.message
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
router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/signup', { signupError: req.session.signupError })
    req.session.signupError = false;
  }
})

router.post('/signup', (req, res) => {
  if (req.body.firstname.toString().length && req.body.lastname.toString().length && req.body.email.toString().length && req.body.password.toString().length && req.body.password.toString().length > 3) {
    userHelper.doSignup(req.body).then((response) => {
      if (response.status) {
        res.json({ status: true })
      } else {
        req.session.signupError = "Something went wrong or User already exists "
        console.log('false');
        res.json({ status: false })
      }
    })
  } else {
    req.session.signupError = "Something went wrong try again"
  }
})


//index page
router.get('/imac', (req, res) => {
  res.render('user/imac', { user: req.session.user })
})

//iphone page 
router.get('/iphone', (req, res) => {
  productHelper.getPhones().then(async (products) => {
    if (req.session.loggedIn) {
      var bagItems = await userHelper.getBagProducts(req.session.user._id);
      res.render('user/iphone', { products: products, user: req.session.user, bagItems: bagItems })
    } else {
      res.render('user/iphone', { products: products, user: req.session.user })
    }
  })
})

//iphone 12 page
router.get('/iphone-12', (req, res) => {
  res.render('user/iphone-12', { user: req.session.user })
})

//buy product page 
router.get('/buy-product/:productId', (req, res) => {
  productHelper.getProductDetails(req.params.productId).then((productDetails) => {
    if (productDetails) {
      res.render('user/buy-product', { user: req.session.user, productDetails: productDetails });
    } else {
      res.redirect('/');
    }
  })
})

router.post('/add-to-bag', verifyLogin, (req, res) => {
  userHelper.addToBag(req.body, req.session.user._id).then((response) => {
    if (response.status) {
      res.redirect('/bag')
    } else {
      res.redirect('/')
    }
  })
})

router.get('/bag', verifyLogin, async (req, res) => {
  let getTotalAmound = await userHelper.getTotalAmound(req.session.user._id)
  if (getTotalAmound) {
    userHelper.getBagProducts(req.session.user._id).then((products) => {
      res.render('user/bag', { user: req.session.user, bagItems: products, total: getTotalAmound.total })
    })
  } else {
    res.render('user/bag', { user: req.session.user })
  }
})

router.get('/shipping', verifyLogin, (req, res) => {
  res.render('user/shipping', { user: req.session.user })
})

router.post('/place-order', verifyLogin, async (req, res) => {
  let bag = await userHelper.getBag(req.body.userId)
  let total = await userHelper.getTotalAmound(req.session.user._id)
  userHelper.placeOrder(req.body, bag, total).then((orderId) => {
    if (response) {
      userHelper.generateRazorpay(orderId, total.total).then((response) => {
        if (response) {
          console.log(response);
          res.json(response)
        } else {
          res.json(false)
        }
      })
    } else {
      res.json({ status: false })
    }
  })
})

router.get('/order', verifyLogin, (req, res) => {
  userHelper.getOrders(req.session.user._id).then((orders) => {
    res.render('user/order', { orders: orders, user: req.session.user })

  })
})

router.post('/verify-payment',verifyLogin, (req, res) => {
  userHelper.verifyPayment(req.body).then(() => {
    userHelper.chanePaymentStatus(req.body['order[receipt]']).then((response) => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

module.exports = router;
