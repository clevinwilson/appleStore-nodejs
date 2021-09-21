var collection = require('../config/collection');
var db = require('../config/connection');
var bcrypt = require('bcrypt');
const { response } = require('express');
const { ObjectId, ObjectID } = require('bson');
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
            data.deviceId=ObjectID(data.deviceId);
            let product = db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(data.deviceId), })
            if (product) {
                let bag = await db.get().collection(collection.BAG_COLLECTION).findOne({ user: ObjectId(userId) });
                if (bag) {
                    db.get().collection(collection.BAG_COLLECTION)
                    .updateOne({user:ObjectID(userId)},
                    {
                            $push:{product:data}

                    }).then((response)=>{
                        resolve({status:true});
                    })
                } else {
                    let bagObj = {
                        user: ObjectId(userId),
                        product: [data]
                    };
                    db.get().collection(collection.BAG_COLLECTION).insertOne(bagObj).then((response) => {
                        resolve({status:true});
                    })
                }
            }else{
                resolve({statu:false})
            }
        })
    },
    getBagProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.BAG_COLLECTION).aggregate([
                {
                    $match:{user:ObjectID(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{productList:'$product'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$productList.deviceId']
                                    }
                                }
                            }
                        ],
                        as:'bagItems'
                    }
                },
               
            ]).toArray()
            resolve(cartItems)
        })
    }
}