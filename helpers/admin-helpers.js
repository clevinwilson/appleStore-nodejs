
var collection=require('../config/collection');
var db=require('../config/connection');
var bcrypt=require('bcrypt');
const { ObjectId } = require('bson');
const { response } = require('express');
var objectId = require('mongodb').ObjectID

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
                },
                { $sort : { _id : -1 } }

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
    },
    changeUsername:(details,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            if(admin){
                let oldPassword =await bcrypt.compare(details.oldpassword, admin.password)
                if(oldPassword){
                    db.get().collection(collection.ADMIN_COLLECTION)
                    .updateOne({_id:ObjectId(adminId)},{
                        $set:{
                            username:details.newusername
                        }
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"Something Went Wrong"})
            }
        })
    },
    changePassword:(details,adminId)=>{
        return new Promise(async(resolve,reject)=>{
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({_id:objectId(adminId)})
            if(admin){
                let oldPassword =await bcrypt.compare(details.oldpassword, admin.password)
                if(oldPassword){
                    details.confirmpassword = await bcrypt.hash(details.confirmpassword, 10)
                    db.get().collection(collection.ADMIN_COLLECTION)
                    .updateOne({_id:ObjectId(adminId)},{
                        $set:{
                            password:details.confirmpassword
                        }
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }else{
                    resolve({status:false,"message":"Incorrect old password. please retry"})
                }
            }else{
                resolve({status:false,"message":"Something Went Wrong"})
            }
        })
    },
    getDashboardCounts:()=>{
        return new Promise(async(resolve,reject)=>{
            let dashboardData={};
            let users=await db.get().collection(collection.USER_COLLECTION).count()
            let orders=await db.get().collection(collection.ORDER_COLLECTION).count();
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).count();
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).count();
            dashboardData.users=users;
            dashboardData.orders=orders;
            dashboardData.products=products;
            dashboardData.category=category;
            resolve(dashboardData)
        })
    }
 
}