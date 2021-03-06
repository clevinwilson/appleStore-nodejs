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
router.get('/', async function (req, res, next) {
  if (req.session.loggedIn) {
    var bagItems = await userHelper.getBagProducts(req.session.user._id);
    res.render('user/index', { user: req.session.user, bagItems: bagItems });
  } else {
    res.render('user/index', { user: req.session.user });
  }

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


//imac page
router.get('/imac', async (req, res) => {
  if (req.session.loggedIn) {
    var bagItems = await userHelper.getBagProducts(req.session.user._id);
    let notebooks =await userHelper.getNotebooks()
    let desktop =await userHelper.getDesktop()
    res.render('user/imac', { user: req.session.user, bagItems: bagItems,notebooks:notebooks,desktop:desktop })
  } else {
    let notebooks =await userHelper.getNotebooks()
    console.log(notebooks);
    let desktop =await userHelper.getDesktop()
    res.render('user/imac', { user: req.session.user,notebooks:notebooks,desktop:desktop })
  }
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
router.get('/buy-product/:productId', async (req, res) => {
  if (req.session.loggedIn) {
    var bagItems = await userHelper.getBagProducts(req.session.user._id);
    let favorites = await userHelper.getFavoritedProduct(req.params.productId, req.session.user._id)
    productHelper.getProductDetails(req.params.productId).then((productDetails) => {
      if (productDetails) {
        if (favorites) {
          res.render('user/buy-product', { user: req.session.user, productDetails: productDetails, bagItems: bagItems, inFavorite: true });
        } else {
          res.render('user/buy-product', { user: req.session.user, productDetails: productDetails, inFavorite: false });
        }

      } else {
        res.redirect('/');
      }
    })
  } else {
    productHelper.getProductDetails(req.params.productId).then((productDetails) => {
      if (productDetails) {
        res.render('user/buy-product', { user: req.session.user, productDetails: productDetails });
      } else {
        res.redirect('/');
      }
    })
  }
})

//bag
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

//shipping page
router.get('/shipping', verifyLogin, (req, res) => {
  userHelper.getUser(req.session.user._id).then(async (userDetails) => {
    if (req.session.loggedIn) {
      var bagItems = await userHelper.getBagProducts(req.session.user._id);
      res.render('user/shipping', { user: userDetails, addressError: req.session.addressError, bagItems: bagItems })
    } else {
      res.render('user/shipping', { user: userDetails, addressError: req.session.addressError })
    }
    req.session.addressError = false
  })

})

//place order
router.post('/place-order', verifyLogin, async (req, res) => {
  let verigybag=await userHelper.verifyBag(req.session.user._id)
  if(verigybag){
  if (req.body.addressOption === 'newAddress') {

    let bag = await userHelper.getBag(req.body.userId);
    let total = await userHelper.getTotalAmound(req.session.user._id)
    userHelper.placeOrder(req.body, bag, total).then((orderId) => {
      if (orderId) {
        userHelper.generateRazorpay(orderId, total.total).then((response) => {
          if (response) {
            res.json(response)
          } else {
            res.json(false)
          }
        })
      } else {
        res.json({ status: true })
      }
    })


  } else if (req.body.addressOption === 'defaultAddress') {

    userHelper.getUser(req.body.userId).then(async (defaultAddress) => {
      if (defaultAddress.address) {
        defaultAddress.address.email=req.body.email;
        defaultAddress.address.number=req.body.number;
        let bag = await userHelper.getBag(req.body.userId)
        let total = await userHelper.getTotalAmound(req.session.user._id)
        userHelper.placeOrder(defaultAddress.address, bag, total).then((orderId) => {
          if (orderId) {
            userHelper.generateRazorpay(orderId, total.total).then((response) => {
              if (response) {
                console.log(response);
                res.json(response)
              } else {
                res.json(false)
              }
            })
          } else {
            res.json(false)
          }
        })



      } else {
        req.session.addressError = true
        res.json({defaultddressError:true})
      }
    })

  } else {
    res.json({addressError:true})
  }
  }else{
    res.json(false)
  }
})

router.get('/order', verifyLogin, async (req, res) => {
  if (req.session.loggedIn) {
    var bagItems = await userHelper.getBagProducts(req.session.user._id);

    userHelper.getOrders(req.session.user._id).then((orders) => {
      res.render('user/order', { orders: orders, user: req.session.user, bagItems: bagItems })

    })
  } else {
    userHelper.getOrders(req.session.user._id).then((orders) => {
      res.render('user/order', { orders: orders, user: req.session.user })

    })
  }
})

router.post('/verify-payment', verifyLogin, (req, res) => {
  userHelper.verifyPayment(req.body).then(() => {
    userHelper.chanePaymentStatus(req.body['order[receipt]']).then((response) => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

//add default address
router.post('/add-default-address', verifyLogin, (req, res) => {
  userHelper.addDefaultAddress(req.body).then((response) => {
    if (response) {
      res.redirect('/shipping')
    }
  })
})

//pay-pending-payment
router.get('/pay-pending-payment/:orderId', verifyLogin, async (req, res) => {

  let order = await userHelper.verifyOrder(req.params.orderId);
  if (order._id) {
    userHelper.generateRazorpay(order._id, order.total).then((response) => {
      if (response) {
        res.json(response)
      } else {
        res.json(false)
      }
    })
  } else {
    res.json({ status: true })
  }
})


//bag page
router.get('/remove-bag-item/:deviceId', verifyLogin, (req, res) => {
  userHelper.removeBagItem(req.params.deviceId, req.session.user._id).then((response) => {
    res.redirect('/bag')
  })
})

//favorites page
router.get('/favorites', verifyLogin, (req, res) => {
  userHelper.getFavoriteProducts(req.session.user._id).then(async (favoriteProduct) => {
    if (req.session.loggedIn) {
      var bagItems = await userHelper.getBagProducts(req.session.user._id);
      res.render('user/favorites', { user: req.session.user, favoriteProduct: favoriteProduct, bagItems: bagItems })
    } else {
      res.render('user/favorites', { user: req.session.user, favoriteProduct: favoriteProduct })
    }
  })
})

router.get('/add-to-favorite/:deviceId', verifyLogin, (req, res) => {
  console.log(req.params.deviceId);

  userHelper.addToFavorite(req.params.deviceId, req.session.user._id).then((response) => {
    if (response) {
      res.json(true)
    } else {
      res.json(false)
    }
  })
})

router.get('/remove-from-favorite/:deviceId', verifyLogin, (req, res) => {
  userHelper.removeFromFavorite(req.params.deviceId, req.session.user._id).then((response) => {
    if (response) {
      res.json(true)
    } else {
      res.json(false)
    }
  })
})

//ipad
router.get('/ipad',(req,res)=>{
  productHelper.getIpads().then(async (products) => {
    console.log(products);
    if (req.session.loggedIn) {
      var bagItems = await userHelper.getBagProducts(req.session.user._id);
      res.render('user/ipad', { products: products, user: req.session.user, bagItems: bagItems })
    } else {
      res.render('user/ipad', { products: products, user: req.session.user })
    }
  })
})

//watch
router.get('/watch',async(req,res)=>{
  if (req.session.loggedIn) {
    var bagItems = await userHelper.getBagProducts(req.session.user._id);
    res.render('user/watch',{user:req.session.user,bagItems:bagItems})
  }else{
    res.render('user/watch',{user:req.session.user})
  }
 
})

//account
router.get('/account', verifyLogin, async(req,res)=>{
    var bagItems = await userHelper.getBagProducts(req.session.user._id);
    var user =await userHelper.getUser(req.session.user._id);
    res.render('user/account',{user:user,bagItems:bagItems})
})

//update  address
router.post('/update-address', verifyLogin, (req, res) => {
  console.log(req.body);
  userHelper.updateAddress(req.body).then((response) => {
    if (response) {
      res.redirect('/account')
    }
  })
})

//privacy-control
router.get('/privacy-control',verifyLogin, async(req,res)=>{
  var bagItems = await userHelper.getBagProducts(req.session.user._id);
  var user =await userHelper.getUser(req.session.user._id);
  res.render('user/privacy',{user:user,changePasswordSucc:req.session.changePasswordSucc,changePasswordError:req.session.changePasswordError,bagItems:bagItems})
  req.session.changePasswordSucc=false
  req.session.changePasswordError=false
})

router.post('/change-username',verifyLogin,(req,res)=>{
  userHelper.changeUsername(req.body).then((response)=>{
    res.redirect('/privacy-control')
  })
})

router.post('/change-password',verifyLogin, (req,res)=>{
  userHelper.changePassword(req.body).then((response)=>{
    if(response){
      req.session.changePasswordSucc="Password Changed Successfully"
      res.redirect('/privacy-control')
    }else{
      req.session.changePasswordError="Something went wrong try again"
      res.redirect('/privacy-control')
    }
  })
})





module.exports = router;
