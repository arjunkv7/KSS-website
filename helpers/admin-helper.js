const db = require("../configure/connection")
const collections = require("../configure/collections")
const async = require("hbs/lib/async")
const bcrypt = require('bcryptjs')
const { response } = require("express")
const date = require('date-and-time')

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
        return new Promise(async (resolve, reject) => {
            let newPassword = await bcrypt.hash(mobileNumber, 10)
            let member = await db.get().collection(collections.MEMBER_COLLECTION).findOne({ "mobile number": mobileNumber })
            if (member) {
                console.log(member)
                console.log("mobile already exist")
                reject(member)
            }
            else {
                db.get().collection(collections.MEMBER_COLLECTION).insertOne({ 'member name': memberName, "mobile number": mobileNumber, 'password': newPassword }, (err, data) => {
                    if (err) console.log(err)

                    else {
                        console.log(data)
                        db.get().collection(collections.ATTENDENCE_COLLECTION).insertOne({ 'member name': memberName, "mobile number": mobileNumber, "attendence": [] }, (err, result) => {
                            if (err) console.log(err)



                        })
                        db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).insertOne({ 'member name': memberName, "mobile number": mobileNumber, "weekly amount": [] }, (err, result) => {
                            if (err) console.log(err)

                        })

                        db.get().collection(collections.DEPOSIT_COLLECTION).insertOne({ 'member name': memberName, "mobile number": mobileNumber, "weekly deposits": [] }, (err, result) => {
                            if (err) console.log(err)
                        })

                        resolve(data)
                    }
                })
            }
        })

    },

    removeMember: (memberName) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.MEMBER_COLLECTION).deleteOne({ "member name": memberName }, (err, data) => {
                if (err) {
                    console.log(err)

                }
                else {
                    console.log(data)
                    console.log("member removed successfully")
                    resolve(data)
                }
            })
        })
    },

    getAllMembers: () => {
        return new Promise(async (resolve, reject) => {
            let Allmembers = await db.get().collection(collections.MEMBER_COLLECTION).find().toArray()
            if (Allmembers) {
                resolve(Allmembers)
                console.log(Allmembers)
            }
            else (
                console.log("Some error occured")
            )
        })
    },

    saveDeposit: (memberMobile, amount) => {
        return new Promise(async (resolve, reject) => {
            amount = parseInt(amount)
            let newDate = await date.format((new Date()), 'YYYY/MM/DD ');

            //update deposited amount in weekly amount collection 
            await db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).updateOne({

                "mobile number": memberMobile, "weekly amount.date": newDate
            },
                {
                    $inc: {
                        "weekly amount.$.deposited amount": amount,
                    }
                }, (err, data) => {

                    if (err) throw err

                    else {
                        console.log(data)
                        console.log("deposit amount updated for the date " + newDate)
                    }
                })


            // update deposit amount in deposit collection
            db.get().collection(collections.DEPOSIT_COLLECTION).updateOne({

                "mobile number": memberMobile, "weekly deposits.date": newDate
            },
                {
                    $inc: {

                        "weekly deposits.$.deposited amount": amount,
                    }
                }, (err, data) => {

                    if (err) throw err

                    else {
                        console.log(data)
                        console.log("deposit amount updated for the date " + newDate)
                        resolve()
                    }
                })
        })
    },

    getAllMemberDetails: (memberMobile) => {
        return new Promise(async (resolve, reject) => {

           let allPaymentDetails = await db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).aggregate([{
                $match: {
                    'mobile number': memberMobile,
                }
            }, {
                $project: {
                    "member name": 1,
                    "mobile number": 1,
                    "weekly amount": {$reverseArray:"$weekly amount"},
                    'total installment': {
                        $add: [{ $sum: '$weekly amount.weekly installment' },
                        { $sum: "$weekly amount.fine" }]
                    },
                    "total deposited amount": {
                        $sum: '$weekly amount.deposited amount'
                    },
                    'total present days':{
                        $size: {
                            "$filter": {
                              "input": "$weekly amount",
                              "as": "part",
                              "cond": { "$eq": ["$$part.attendence", "present"]}
                            }
                        }
                    },
                    'total absent days':{
                        $size: {
                            "$filter": {
                              "input": "$weekly amount",
                              "as": "part",
                              "cond": { "$eq": ["$$part.attendence", "absent"]}
                            }
                        }
                    },
                    "pending or advance amount":{
                        $subtract: [{$sum: '$weekly amount.deposited amount'},{  $add: [{ $sum: '$weekly amount.weekly installment' },
                        { $sum: "$weekly amount.fine" }]}]
                    }
                   
                },  
                                         
            },

            ]).toArray()
            console.log(allPaymentDetails)
            resolve(allPaymentDetails)
        })
    },

    getAllDates:(member)=>{
        return new Promise(async(resolve,reject)=>{
            let allDates = db.get().collection(collections.ATTENDENCE_COLLECTION).findOne({'mobile number':member})
            if(allDates){
                resolve(allDates)
            }
            else{
                console.log("an error occured")
            }
        })
        
    },

    getAttDetailsByDate:(date)=>{
        return new Promise(async (resolve,reject)=>{
            console.log(date)
        let attDetails = await db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).aggregate([
            {
                $match:{
                    'weekly amount.date':date,
                }
            },{
                $unwind:"$weekly amount"
            },
            { $match:{
                'weekly amount.date':date,
            }
        }
                
        ]).toArray()
            console.log(attDetails)
            resolve(attDetails)
        })
    },

    getAllAdmin:()=>{
        return new Promise (async(resolve,reject)=>{
         let admin =await   db.get().collection(collections.ADMIN_COLLECTION).find().toArray()
         resolve(admin)
         console.log("got all admin")
            })
        
    },
    
    removeAdmin:(admin)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ADMIN_COLLECTION).deleteOne({'mobile number':admin},(err,data)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log(data)
                    resolve(data)
                    console.log('admin removed successfully')
                }
            })
        })
    }





}