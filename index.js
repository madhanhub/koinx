const express = require('express')
const multer = require('multer')
const csv = require('csv-parser')
const mongoose=require('mongoose')
const fs = require('fs')
const path=require('path')
const app = express();


app.use(express.json())

const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null, './uploads')
  },
  filename:function (req,file,cb){
    cb(null,file.originalname)
  }
})
const uploads=multer({storage:storage})

const Trade=require('./Schema/Filed')

app.listen(8000,()=>{
    console.log('server run');

    mongoose.connect('mongodb://localhost:27017/')
    .then(()=>{
        conn=mongoose.connection
        console.log('database connected');
    })
    .catch(()=>{
        console.log('db not connected');
    })
})

app.get('/',async(req,res)=>{
    res.send('welcome')
})

app.post('/upload',uploads.single('file'),(req,res)=>{
  
  const filePath = path.join(__dirname, 'uploads', req.file.filename)
  const result = []

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      console.log('Data row:', data)
      result.push(data)
    })
    .on('end', async () => {
      console.log('All data:', result)  
      try {
        await Trade.insertMany(result)
        res.send('File uploaded and data stored in database')
      } catch (error) {
        console.error('Error storing data in database:', error) 
        res.status(500).send('Error storing data in database')
      }
    })
})
app.post('/balance', async (req, res) => {
  const { timestamp } = req.body
  
  if (!timestamp) {
    return res.status(400).send('Timestamp is required')
  }

  const date = new Date(timestamp)

  if (isNaN(date.getTime())) {
    return res.status(400).send('Invalid date format')
  }

  try {
    const trades = await Trade.find({ UTC_Time: { $lte: date } })

    const balances = trades.reduce((acc, trade) => {
      const amount = trade.Operation === 'Buy' ? trade.BuySell_Amount : -trade.BuySell_Amount
      acc[trade.BaseCoin] = (acc[trade.BaseCoin] || 0) + amount
      return acc
    }, {})

    res.json(balances)
  } catch (error) {
    console.error('Error retrieving trades:', error)
    res.status(500).send('Error retrieving trades')
  }
})