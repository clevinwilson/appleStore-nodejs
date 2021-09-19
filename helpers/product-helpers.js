
const { ObjectID, ObjectId } = require('bson')
const { response } = require('express')
var collection = require('../config/collection')
const db = require('../config/connection')
module.exports = {
    addProduct: (productDetails) => {
        productDetails.status = false;
        productDetails.storageOptions = [];
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productDetails).then((response) => {

                resolve(response.ops[0]._id);
            })

        })
    },
    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            let categoryExist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category.category });
            console.log(categoryExist);
            if (categoryExist) {
                resolve(false);
            } else {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response) => {
                    resolve(response);
                })
            }
        })
    },
    getCategory: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },
    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).removeOne({ _id: ObjectID(categoryId) }).then((response) => {
                resolve(response);
            })
        })
    },
    addStorage: (data) => {
        data = Object.assign({}, data)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectId(data.productId) },
                    {
                         $push: {storageOptions: data}
                    }

                ).then((response)=>{
                    resolve(response);
                })
        })
    },
    checkProduct:(productId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectID(productId)});
            if(product.storageOptions[0]){
                db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({_id:ObjectID(productId)},{
                    $set:{
                        status:true
                    }
                }).then((response)=>{
                    if(response){
                        resolve({status:true});
                    }else{
                        resolve({statu:false})
                    }
                })
            }else{
                resolve({status:false})
            }
        })
    }
}