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
            var product =await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(data.deviceId) }, { storageOptions: { $elemMatch: { storagesize:data.storage } } } ).toArray()
            if (product) {
            
                let productLength= product[0].storageOptions.length;
                for(let i =0;i<productLength;i++){
                    if(product[0].storageOptions[i].storagesize == data.storage){
                        data.price=  parseInt(product[0].storageOptions[i].storageprice) + parseInt(product[0].productprice);

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
                    }
                }
            }else{
                resolve({statu:false})
            }
        })
    },
    getBagProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let bagItems=await db.get().collection(collection.BAG_COLLECTION).aggregate([
                {
                    $match:{user:ObjectID(userId)}
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
    getTotalAmound:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let total=await db.get().collection(collection.BAG_COLLECTION).aggregate([
                {
                    $match:{
                        user:ObjectID(userId)
                    }
                },
                {$unwind:'$product'},
                {
                    $group:{
                        _id:null,
                        total:{$sum:"$product.price"}
                    }
                }
            ]).toArray()
            resolve(total[0])
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