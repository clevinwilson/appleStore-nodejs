var collection=require('../config/collection');
var db=require('../config/connection');
var bcrypt=require('bcrypt');
const { response } = require('express');
module.exports={

    doSignup:(signUpDetails)=>{
        return new Promise(async(resolve,reject)=>{
            var email=await db.get().collection(collection.USER_COLLECTION).findOne({email:signUpDetails.email})
           if(email){
           console.log(email);
           }else{
            signUpDetails.joindate=new Date();
            signUpDetails.password= await bcrypt.hash(signUpDetails.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(signUpDetails).then((response)=>{
                resolve(response)
            })
           }
        })
    }
}