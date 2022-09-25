const bcrypt = require("bcryptjs/dist/bcrypt")
const cookieParser = require("cookie-parser")
const { response } = require("express")
const async = require("hbs/lib/async")
const { ReturnDocument } = require("mongodb")
const collections = require("../configure/collections")
const db = require("../configure/connection")
const commonHelper = require('../helpers/common-helpers')

module.exports = {

    doMemberLogin: (mobile, password) => {
        return new Promise(async (resolve, reject) => {
            // let encrPassword = bcrypt.hash(password, 10)
            let member = await db.get().collection(collections.MEMBER_COLLECTION).findOne({ "mobile number": mobile })
            console.log(member)
            if (member) {
                bcrypt.compare(password, member.password, (err, data) => {
                    if (err) {
                        console.log(err)
                        console.log("compare error")


                    }
                    else if (data) {
                        console.log(data + '   jhkh')
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
    },

    markAttendence: (latitude, longitude, member) => {
        return new Promise((resolve, reject) => {
            const hostLat = 11.867531 ;
            const hostLong =  75.506928 ;
           
            commonHelper.calculateDistance(hostLat,latitude,hostLong,longitude).then((result)=>{
                console.log(result)
                if(result * 1000 <= 10){

                }else{
                    console.log("Cordinates not matching..")
                    reject()
                }
            })

        })
    }
}