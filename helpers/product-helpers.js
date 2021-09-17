
const { response } = require('express')
var collection = require('../config/collection')
const db = require('../config/connection')
module.exports = {
    addProduct:(productDetails)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productDetails).then((response)=>{
         
               resolve(response.ops[0]._id);
           })
        
        })
    },
    addCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            let categoryExist=db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:category.category});
            if(categoryExist){
                resolve(false);
            }else{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response)=>{
                    resolve(response);
                })
            }
        })
    }
}