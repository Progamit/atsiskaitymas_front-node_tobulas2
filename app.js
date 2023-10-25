const express = require("express")
const app = express()
const router = require("./router/mainRouter")
const mongoose = require("mongoose")
const cors = require("cors")
const {createServer} = require('node:http')

require("dotenv").config()

const server = createServer(app)

require('./modules/sockets')(server)
server.listen (3001,()=> {
    console.log("server running at http://localhost:3001")
})
mongoose.connect(process.env.db_key ="mongodb+srv://progamit229:Mano12345@cluster0.umh5vol.mongodb.net/?retryWrites=true&w=majority")
    .then (()=> {
        console.log("connect success")
    }).catch (e=> {
    console.log('Error', e)
})

app.use(cors())
app.use(express.json())
app.use("/",router)
const port = 8000
app.listen(port)

const jwt = require("jsonwebtoken")