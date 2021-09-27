var collection = require('../config/collection');
var db = require('../config/connection');
var bcrypt = require('bcrypt');
const { response } = require('express');
const { ObjectId, ObjectID } = require('bson');
var objectId = require('mongodb').ObjectID
const Razorpay = require('razorpay');
const { resolve } = require('path');
const { resolveSoa } = require('dns');
var instance = new Razorpay({
    key_id: 'rzp_test_deE2E1795zFmxy',
    key_secret: 'zDZ8GFjzaxyncyKYdabslzOE',
});
module.exports = {

    doSignup: (signUpDetails) => {
        return new Promise(async (resolve, reject) => {
            var email = await db.get().collection(collection.USER_COLLECTION).findOne({ email: signUpDetails.email })
            if (email) {
                resolve({ status: false })
            } else {
                signUpDetails.joindate = new Date();
                signUpDetails.password = await bcrypt.hash(signUpDetails.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(signUpDetails).then((response) => {
                    resolve({ status: true })
                })
            }
        })
    },
    doLogin: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: details.email }).then((user) => {
                if (user) {
                    bcrypt.compare(details.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            response.status = false;
                            response.message = "Your account information was entered incorrectly.";
                            resolve(response)
                        }
                    })
                } else {
                    response.status = false;
                    response.message = "User not exists";
                    resolve(response)
                }
            })
        })
    },
    addToBag: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            data.deviceId = ObjectID(data.deviceId);
            var product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(data.deviceId) }, { storageOptions: { $elemMatch: { storagesize: data.storage } } }).toArray()
            if (product) {

                let productLength = product[0].storageOptions.length;
                for (let i = 0; i < productLength; i++) {
                    if (product[0].storageOptions[i].storagesize == data.storage) {
                        data.price = parseInt(product[0].storageOptions[i].storageprice) + parseInt(product[0].productprice);

                        let bag = await db.get().collection(collection.BAG_COLLECTION).findOne({ user: ObjectId(userId) });
                        if (bag) {
                            db.get().collection(collection.BAG_COLLECTION)
                                .updateOne({ user: ObjectID(userId) },
                                    {
                                        $push: { product: data }

                                    }).then((response) => {
                                        resolve({ status: true });
                                    })
                        } else {
                            let bagObj = {
                                user: ObjectId(userId),
                                product: [data]
                            };
                            db.get().collection(collection.BAG_COLLECTION).insertOne(bagObj).then((response) => {
                                resolve({ status: true });
                            })
                        }
                    }
                }
            } else {
                resolve({ statu: false })
            }
        })
    },
    getBagProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let bagItems = await db.get().collection(collection.BAG_COLLECTION).aggregate([
                {
                    $match: { user: ObjectID(userId) }
                },
                {
                    $unwind: "$product"
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product.deviceId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: "$productDetails"
                }


            ]).toArray()
            resolve(bagItems)
        })
    },
    getTotalAmound: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.BAG_COLLECTION).findOne({ user: ObjectID(userId) })
            if (cart) {
                let total = await db.get().collection(collection.BAG_COLLECTION).aggregate([
                    {
                        $match: {
                            user: ObjectID(userId)
                        }
                    },
                    { $unwind: '$product' },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$product.price" }
                        }
                    }
                ]).toArray()
                resolve(total[0])
            } else {
                resolve(false)
            }
        })
    },
    placeOrder: (order, products, total) => {
        let date = new Date()
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let fullDate = `${day}-${month}-${year}`;
        return new Promise((resolve, reject) => {
            var orderObj = {
                user: ObjectID(order.userId),
                address: order,
                product: products.product,
                total: total.total,
                date: fullDate,
                orderplaced: true,
                shipped: false,
                delivered: false,
                cancel: false,
                payment: false,

            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                if (response) {
                    db.get().collection(collection.BAG_COLLECTION).removeOne({ user: ObjectID(order.userId) })
                    resolve(response.ops[0]._id)
                }
            })
        })
    },
    getBag: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BAG_COLLECTION).findOne({ user: ObjectID(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    getOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { user: ObjectID(userId) }
                },
                { $unwind: '$product' },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product.deviceId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $project: {

                        payment: 1, cancel: 1, orderplaced: 1, shipped: 1, delivered: 1, date: 1, address: 1, product: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] },
                    }
                },
                { $sort : { _id : -1 } }

            ]).toArray()
            resolve(orders)
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId, total);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    resolve(false)
                } else {

                    resolve(order)
                }

            });
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'zDZ8GFjzaxyncyKYdabslzOE');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }

        })
    },
    chanePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        payment: true
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    addDefaultAddress: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: ObjectID(data.userId) },
                    {
                        $set: {
                            address: data
                        }
                    }).then((response) => {
                        resolve(response)
                    })
        })
    },
    getUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((response) => {
                if (response) {
                    resolve(response)
                } else {
                    response(false)
                }
            })
        })
    },
    verifyOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) }).then((response) => {
                resolve(response)
            })
        })
    },
    removeBagItem: (deviceId, userId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.BAG_COLLECTION)
            .updateOne({user:objectId(userId)},
            {
                $pull: { product: { deviceId: objectId(deviceId) } }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    addToFavorite:(deviceId,userId)=>{
        console.log(deviceId);
        return new Promise(async(resolve,reject)=>{
            let favoriteBag= await db.get().collection(collection.FAVORITE_COLLECTION).findOne({userId:objectId(userId)})
            if(favoriteBag){
                let favoriteObj={
                    deviceId:objectId(deviceId)
                }
                db.get().collection(collection.FAVORITE_COLLECTION)
                .updateOne({userId:objectId(userId)},
                {
                    $push: { devices: favoriteObj }

                }).then((response)=>{
                    resolve(response)
                })
            }else{
                let favoriteObj={
                    userId:objectId(userId),
                    devices:[{deviceId:objectId(deviceId)}]
                }

                db.get().collection(collection.FAVORITE_COLLECTION).insertOne(favoriteObj).then((response)=>{
                    resolve(response)
                })
            }
        })
    },
    removeFromFavorite:(deviceId,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.FAVORITE_COLLECTION)
            .updateOne({userId:objectId(userId)},
            {
                $pull: { devices: { deviceId: objectId(deviceId) } }
            }).then((response)=>{
               resolve(response)
            })
        })
    },
    getFavoritedProduct:(productId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let favorites=await db.get().collection(collection.FAVORITE_COLLECTION).find( { devices: { $elemMatch: { deviceId: objectId(productId) } } }).toArray()
            if(favorites[0]){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    },
    getFavoriteProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.FAVORITE_COLLECTION).aggregate([
                {
                    $match:{userId:objectId(userId)}
                },
                {
                    $unwind:'$devices'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'devices.deviceId',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {
                    $project: {

                        _id:1, products: { $arrayElemAt: ['$products', 0] },
                    }
                }
            ]).toArray();
            resolve(products)
        })
    },
    getNotebooks:()=>{
        return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:'notebook'});
            if(category){
                db.get().collection(collection.PRODUCT_COLLECTION).find({category:ObjectID(category._id),status:true}).toArray().then((products)=>{
                    resolve(products)
                })
            }else{
                resolve({status:false})
            }
        })
    },
    getDesktop:()=>{
        return new Promise(async(resolve,reject)=>{
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:'desktop'});
            if(category){
                db.get().collection(collection.PRODUCT_COLLECTION).find({category:ObjectID(category._id),status:true}).toArray().then((products)=>{
                    resolve(products)
                })
            }else{
                resolve({status:false})
            }
        })
    },
    verifyBag:(userId)=>{
        console.log(userId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BAG_COLLECTION).findOne({user:objectId(userId)}).then((response)=>{
                if(response){
                    resolve(true)
                }else{
                    resolve(false)
                }
            })
        })
    },
    updateAddress: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: ObjectID(data.userId) },
                    {
                        $set: {
                            address: data
                        }
                    }).then((response) => {
                        resolve(response)
                    })
        })
    }

}



// {
//     $lookup:{
//         from:collection.PRODUCT_COLLECTION,
//         let:{productList:'$product'},
//         pipeline:[
//             {
//                 $match:{
//                     $expr:{
//                         $in:['$_id','$$productList.deviceId']
//                     }
//                 }
//             },           
//         ],
//         as:'bagItems'
//     }
// },