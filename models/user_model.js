const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

//firstname: String,
//lastname: String,
//mongodb+srv://nwap-ussd:nwap-ussd@nwapussd.cou2web.mongodb.net/
//mongodb+srv://nwap-ussd:nwap-ussd@nwapussd.cou2web.mongodb.net/?retryWrites=true&w=majority&appName=NWAPUSSD
fullname: String,
phone_number: String,
nin: String,
state: String,
local_govt: String,
ward: String,
commodity: String,
nwap_id: String

})

const User = mongoose.model('User', userSchema); 

module.exports = User