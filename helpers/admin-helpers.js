
var collection=require('../config/collection');
var db=require('../config/connection');
var bcrypt=require('bcrypt');
const { ObjectId } = require('bson');
const { response } = require('express');

module.exports={
    doLogin:(data)=>{
        let response={}
       return new Promise(async(resolve,reject)=>{
           let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({username:data.username});

           if(admin){
               bcrypt.compare(data.password,admin.password).then((status)=>{
                   if(status){
                    response.admin = admin;
                    response.status = true;
                    resolve(response);
                   }else{
                    resolve({ status: false });
                   }
               })
           }else{
            resolve({ status: false });
           }
       })
    },
    getOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                      $match:{ payment:true}
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

                        payment:1,cancel:1,orderplaced:1,shipped:1,delivered:1, date:1,address: 1, product: 1, productDetails: { $arrayElemAt: ['$productDetails', 0] },
                    }
                }

            ]).toArray()
            resolve(orders)
        })
    },
    updateStatusToShipped:(orderId)=>{
        console.log(orderId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    orderplaced:false,
                    shipped:true
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    udateStatusToDelivered:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    shipped:false,
                    delivered:true
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    cancelOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    orderplaced:false,
                    shipped:false,
                    delivered:false,
                    cancel:true
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
 
}