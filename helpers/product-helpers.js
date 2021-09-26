
const { ObjectID, ObjectId } = require('bson')
const { response } = require('express')
var collection = require('../config/collection')
const db = require('../config/connection')
module.exports = {
    addProduct: (productDetails) => {
        productDetails.status = false;
        productDetails.storageOptions = [];
        productDetails.category = ObjectID(productDetails.category)
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
    getCategorys: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },
    deleteCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ category: ObjectID(categoryId) })
            if (product) {
                resolve(false)
            }else{
                db.get().collection(collection.CATEGORY_COLLECTION).removeOne({ _id: ObjectID(categoryId) }).then((response) => {
                    resolve(response);
                })
            }
        })
    },
    addStorage: (data) => {
        data = Object.assign({}, data)
        data.productId = ObjectID(data.productId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectId(data.productId) },
                    {
                        $push: { storageOptions: data }
                    }

                ).then((response) => {
                    resolve(response);
                })
        })
    },
    checkProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(productId) });
            if (product.storageOptions[0]) {
                db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ _id: ObjectID(productId) }, {
                        $set: {
                            status: true
                        }
                    }).then((response) => {
                        if (response) {
                            resolve({ status: true });
                        } else {
                            resolve({ statu: false })
                        }
                    })
            } else {
                resolve({ status: false })
            }
        })
    },
    getPhones: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: 'iPhone' });
            if (category) {
                db.get().collection(collection.PRODUCT_COLLECTION).find({ category: ObjectID(category._id), status: true }).toArray().then((products) => {
                    resolve(products)
                })
            } else {
                resolve({ status: false })
            }

        })
    },
    getProductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(productId) }).then((response) => {
                if (response) {
                    resolve(response);
                } else {
                    resolve(false)
                }
            })
        })
    },
    getProducts: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).find().toArray().then((products) => {
                resolve(products);
            })
        })
    },
    deleteProduct: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: ObjectID(categoryId) }).then((response) => {
                resolve(response);
            })
        })
    },
    getIpads: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: 'iPad' });
            if (category) {
                db.get().collection(collection.PRODUCT_COLLECTION).find({ category: ObjectID(category._id), status: true }).toArray().then((products) => {
                    resolve(products)
                })
            } else {
                resolve({ status: false })
            }

        })
    },
    getCategory:(categoryId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:ObjectID(categoryId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    editCategory:(categoryId,data)=>{
        return new Promise(async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: data.category });
            if(category){
                resolve(false)
            }else{
                db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:ObjectID(categoryId)},
            {
                $set:{
                    category:data.category
                }
            }).then((response)=>{
                resolve(response)
            })
            }
        })
    }
}