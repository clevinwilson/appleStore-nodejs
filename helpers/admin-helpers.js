
var collection=require('../config/collection');
var db=require('../config/connection');
var bcrypt=require('bcrypt');

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
 
}