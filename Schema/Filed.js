
const mongoose = require('mongoose');

const Trade = new mongoose.Schema({
  User_ID:{type:String},
  UTC_Time: { type: Date, required: true},
  Operation: { type: String, required: true },
  Market: { type: String, required: true },
  BuySell_Amount: { type: Number, required: true },
  Price: { type: Number, required: true },
});

module.exports = mongoose.model('Trade', Trade);
