const bcrypt = require("bcryptjs/dist/bcrypt")
const { response } = require("express")
const async = require("hbs/lib/async")
const collections = require("../configure/collections")
const db = require("../configure/connection")

module.exports = {

    doMemberLogin: (mobile, password) => {
        return new Promise(async (resolve, reject) => {
            // let encrPassword = bcrypt.hash(password, 10)
            let member = await db.get().collection(collections.MEMBER_COLLECTION).findOne({ "mobile number": mobile })
            console.log(member)
            if (member) {
                bcrypt.compare( password,member.password, (err, data) => {
                    if (err) {
                        console.log(err)
                        console.log("compare error")
                        
                        
                    }
                    else if(data) {
                        console.log(data  +   '   jhkh')
                        response.member = member;
                        response.loginstatus = true
                        resolve(response)
                    }
                    else {
                        console.log("login failed")
                        reject({ loginErr: "Wrong password" })
                    }
                })
            }
            else {
                response.loginErr = " Invalid user name"
                reject(response)
            }
        })
    }
}