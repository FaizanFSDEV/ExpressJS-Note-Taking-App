const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const PORT = 4000

const noteRoutes = require('./notes/routes')
const userRoutes = require('./users/routes')

mongoose.connect('mongodb+srv://admin:123@cluster0.o6jhm.mongodb.net/notetakingapp?retryWrites=true&w=majority', { useNewUrlParser: true })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/notes', noteRoutes)
app.use('/users', userRoutes)

app.listen(PORT,()=>{
  console.log('The app is running on port ' + PORT);
})