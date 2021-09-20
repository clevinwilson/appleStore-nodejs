var collection=require('../config/collection');
var db=require('../config/connection');
var bcrypt=require('bcrypt');
const { response } = require('express');
module.exports={

    doSignup:(signUpDetails)=>{
        return new Promise(async(resolve,reject)=>{
            var email=await db.get().collection(collection.USER_COLLECTION).findOne({email:signUpDetails.email})
           if(email){
           resolve({status:false})
           }else{
            signUpDetails.joindate=new Date();
            signUpDetails.password= await bcrypt.hash(signUpDetails.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(signUpDetails).then((response)=>{
                resolve({status:true})
            })
           }
        })
    },
    doLogin:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).findOne({email:details.email}).then((user)=>{
                if (user) {
                    bcrypt.compare(details.password, user.password).then((status) => {
                        if (status) {
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            response.status=false;
                            response.message="Your account information was entered incorrectly.";
                            resolve(response)
                        }
                    })
                } else {
                    response.status=false;
                    response.message="User not exists";
                    resolve(response)
                }
            })
        })
    }
}