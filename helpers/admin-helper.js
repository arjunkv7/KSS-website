const db = require("../configure/connection")
const collections = require("../configure/collections")
const async = require("hbs/lib/async")
const bcrypt = require('bcryptjs')
const { response } = require("express")

module.exports = {
    createAdminCollection: () => {
        
      
        db.get().listCollections({ name: 'admin' }).toArray(function (err, items) {
            if (err) console.log(err);

            console.log(items.length);
            if (items.length === 0) {
                db.get().createCollection(collections.ADMIN_COLLECTION)
                
            }
        })

    },
    doAdminSignup:(username,password)=>{
        return new Promise(async(resolve,reject)=>{
        let hashedPassword =await bcrypt.hash(password,10)
        console.log(hashedPassword)
        db.get().collection(collections.ADMIN_COLLECTION).insertOne({"mobile number":username,'password':hashedPassword},(err,data)=>{
            if(err) throw err
            else{
                 console.log(data)
                resolve(data)
            }
        })
    })
    },

    adminExist:()=>{
        return new Promise((resolve , reject)=>{
            db.get().collection(collections.ADMIN_COLLECTION).find().toArray((err,data)=>{
                if(err)console.log(err)
                console.log(data)
                resolve(data.length)

            })
        })
    },
    
    doadminLogin:async(mobile,password)=>{
        return new Promise (async (resolve,reject)=>{
          let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({"mobile":mobile})

          console.log(admin)
            if(admin){
          bcrypt.compare(password,admin.password,(err,data)=>{
            if(err){
                 console.log(err)
                
            }
            else if(data){
                console.log(data)
                response.staus = true ;
                loginStatus = true ;
                response .admin = admin
                console.log('login succcess')
                resolve(response)
            }
            else {
                console.log("login failed")
                reject({loginErr:"Wrong password"})
            }
          })
        }
        else{
            reject({loginErr:"Invalid Mobile number"})
        }
        })
       
    }

}