
var collection = require('../config/collection')
const db = require('../config/connection')
module.exports = {
    addProduct:(productDetails)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productDetails).then((response)=>{
               console.log(response);
               
           })
        
        })
    }
}