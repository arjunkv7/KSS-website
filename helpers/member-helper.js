const bcrypt = require("bcryptjs/dist/bcrypt")
const cookieParser = require("cookie-parser")
const { response } = require("express")
const async = require("hbs/lib/async")
const { ReturnDocument } = require("mongodb")
const collections = require("../configure/collections")
const db = require("../configure/connection")
const commonHelper = require('../helpers/common-helpers')
const date = require('date-and-time')

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
        return new Promise(async(resolve, reject) => {
            console.log(member)
            console.log(member["member name"])
            const hostLat = 11.867531;
            const hostLong = 75.506928;
            let newDate =await date.format((new Date()), 'YYYY/MM/DD ');

            await commonHelper.calculateDistance(hostLat, latitude, hostLong, longitude).then((result) => {
                console.log(result)
                if (result * 1000 <= 10) {
                    db.get().collection(collections.ATTENDENCE_COLLECTION).updateMany({
                        "member name": member['member name'],
                        "mobile number": member['mobile number'], "attendence.date": newDate
                    }, {
                        $set: {
                            "attendence.$.status": "present"
                        }
                    },async (err, result) => {
                        if (err) throw err

                        else {
                            console.log("attendence updated as present")

                           await db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).updateMany({
                                "member name": member['member name'],
                                "mobile number": member['mobile number'], "weekly amount.date": newDate
                            },
                                {
                                    $set: {
                                        "weekly amount.$.attendence": "present",
                                        "weekly amount.$.fine": 0,

                                    }
                                }, (err, data) => {
                                    if (err) throw err;

                                    else {
                                        console.log(data)
                                        console.log('fine  updated based on attendence')
                                    }
                                })
                        }
                    })
                }

                else {
                    console.log("Cordinates not matching..")
                    reject()
                }
            })

        })
    }
}