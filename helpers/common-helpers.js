const collections = require("../configure/collections")
const db = require("../configure/connection")
const date = require('date-and-time')
const { response } = require("express")

module.exports = {

    calculateDistance: (lat1, lat2, lon1, lon2) => {
        return new Promise((resolve, reject) => {
            // The math module contains a function
            // named toRadians which converts from
            // degrees to radians.
            lon1 = lon1 * Math.PI / 180;
            lon2 = lon2 * Math.PI / 180;
            lat1 = lat1 * Math.PI / 180;
            lat2 = lat2 * Math.PI / 180;

            // Haversine formula
            let dlon = lon2 - lon1;
            let dlat = lat2 - lat1;
            let a = Math.pow(Math.sin(dlat / 2), 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.pow(Math.sin(dlon / 2), 2);

            let c = 2 * Math.asin(Math.sqrt(a));

            // Radius of earth in kilometers. Use 3956
            // for miles
            let r = 6371;

            // calculate the result
            resolve(c * r);
        })

    },

    updateWeeklyAmount: () => {
        let newdate = date.format((new Date()), 'YYYY/MM/DD ');
        return new Promise((resolve, reject) => {
            db.get().collection(collections.WEEKLY_AMOUNT_COLLECTION).updateMany({},
                {
                    $push: {

                        "weekly amount": { $each:[
                            {'date': newdate,
                            'attendence': "absent",
                            'weekly amount': 150,
                            'fine': 30}
                        ]
                        }
                    }
                }, (err, data) => {
                    if (err) throw err;

                    else {
                        console.log(data)
                        resolve(data)
                    }
                })
        })
    }


}