const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('connected to database :)')
    }).catch((err) => {
        console.log(err)
    })

let url = process.env.MONGO_URI
let bucket, gridfs;
mongoose.createConnection(process.env.MONGO_URI, (err, con) => {
    bucket = new mongoose.mongo.GridFSBucket(con.db)
    gridfs = Grid(con.db, mongoose.mongo)
})

module.exports = {
    'getConnection': () => {
        return { bucket: bucket, gridfs: gridfs }
    }
}