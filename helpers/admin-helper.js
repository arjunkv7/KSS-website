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
                db.get().createCollection(collections.MEMBER_COLLECTION)

            }
        })

    },
    doAdminSignup: (username, mobilenumber, password) => {
        return new Promise(async (resolve, reject) => {
            let hashedPassword = await bcrypt.hash(password, 10)
            console.log(hashedPassword)
            db.get().collection(collections.ADMIN_COLLECTION).insertOne({ "user name": username, 'mobile number': mobilenumber, 'password': hashedPassword }, (err, data) => {
                if (err) throw err
                else {
                    console.log(data)
                    resolve(data)
                }
            })
        })
    },

    adminExist: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ADMIN_COLLECTION).find().toArray((err, data) => {
                if (err) console.log(err)
                console.log(data)
                resolve(data.length)

            })
        })
    },

    doadminLogin: async (mobile, password) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ "mobile number": mobile })

            console.log(admin)
            if (admin) {
                bcrypt.compare(password, admin.password, (err, data) => {
                    if (err) {
                        console.log(err)

                    }
                    else if (data) {
                        console.log(data)
                        response.staus = true;
                        loginStatus = true;
                        response.admin = admin
                        console.log('login succcess')
                        resolve(response)
                    }
                    else {
                        console.log("login failed")
                        reject({ loginErr: "Wrong password" })
                    }
                })
            }
            else {
                reject({ loginErr: "Invalid Mobile number" })
            }
        })

    },

    addNewMember: (memberName, mobileNumber) => {
        return new Promise((resolve, reject) => {
            let member = db.get().collection(collections.MEMBER_COLLECTION).findOne({ "member name": memberName, "mobile number": mobileNumber })
            if (member) {
                console.log(member)
                console.log("member already exist")
                reject(member)
            }
            else {
                db.get().collection(collections.MEMBER_COLLECTION).insertOne({ 'member name': memberName, "mobile number": mobileNumber }, (err, data) => {
                    if (err) console.log(err)

                    else {
                        console.log(data)
                        resolve(data)
                    }
                })
            }
        })

    }

}