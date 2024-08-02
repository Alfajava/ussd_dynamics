const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;

// MODELS
const User = require('./models/user_model');

// MONGODB CONNECTION
const database_url = 'mongodb+srv://nwap-ussd:nwap-ussd@nwapussd.cou2web.mongodb.net/?retryWrites=true&w=majority&appName=NWAPUSSD';

//const database_url = "mongodb+srv://nwap-ussd:nwap-ussd@NWAPUSSD.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(database_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'test',
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for initial server selection
    socketTimeoutMS: 45000 // 45 seconds socket timeout
})
.then(() => console.log('MongoDB connected successfully.'))
.catch((err) => console.error('MongoDB connection error:', err));

// BODY PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Success Message');
});

// Utility function for promise timeout
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
    return Promise.race([promise, timeout]);
}

// Ensure the database is connected before handling requests
const dbReady = () => {
    return new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
            resolve();
        } else {
            reject(new Error('Database not connected'));
        }
    });
};

app.post('/', async (req, res) => {
    const { phoneNumber, text, sessionId } = req.body;
    let response;

    if (text === '') {
        response = 'CON Welcome to NWAP Registration Platform. Follow the prompt to register.\n Enter your Fullname';
    } else {
        let array = text.split('*');
        if (array.length === 1) {
            response = 'CON Enter your Phone Number';
        } else if (array.length === 2) {
            response = 'CON Enter your NIN';
        } else if (array.length === 3) {
            response = 'CON Enter your State';
        } else if (array.length === 4) {
            response = 'CON Enter your Local Government';
        } else if (array.length === 5) {
            response = 'CON Enter your Ward';
        } else if (array.length === 6) {
            response = 'CON Which commodity are you into?';
        } else if (array.length === 7) {
            if (array[6].trim() !== "") {
                response = 'CON Please confirm if you want to save the data\n1. Confirm \n2. Cancel';
            } else {
                response = 'END Invalid Details Input. Please enter a valid number.';
            }
        } else if (array.length === 8) {
            function between(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            var statecode;
            const state = array[3];

            // State code mapping logic
            const stateCodes = {
                'Oyo': 'NWAP/OY/', 'OSUN': 'NWAP/OS/', 'ogun': 'NWAP/OG/', 'ondo': 'NWAP/ON/', 'ekiti': 'NWAP/EK/',
                'EDO': 'NWAP/ED/', 'niger': 'NWAP/NI/', 'Abuja': 'NWAP/FCT/', 'RIVERS': 'NWAP/RIV/', 'adamawa': 'NWAP/AD/',
                'KOGI': 'NWAP/KG/', 'borno': 'NWAP/BOR/', 'nasarawa': 'NWAP/NAS/', 'enugu': 'NWAP/ENU/', 'plateau': 'NWAP/PLA/',
                'kaduna': 'NWAP/KAD/', 'kano': 'NWAP/KAN/', 'ebonyi': 'NWAP/EBO/', 'ABIA': 'NWAP/AB/', 'imo': 'NWAP/IM/',
                'akwa ibom': 'NWAP/AK/', 'cross river': 'NWAP/CR/', 'katsina': 'NWAP/KAT/', 'anambra': 'NWAP/AN/', 'delta': 'NWAP/DE/',
                'bayelsa': 'NWAP/BA/', 'zamfara': 'NWAP/ZA/', 'kebbi': 'NWAP/KEB/', 'gombe': 'NWAP/GO/', 'kwara': 'NWAP/KW/',
                'sokoto': 'NWAP/SOK/', 'yobe': 'NWAP/YO/', 'jigawa': 'NWAP/JIG/', 'lagos': 'NWAP/LA/', 'taraba': 'NWAP/TA/',
                'benue': 'NWAP/BE/'
            };

            statecode = stateCodes[state.toLowerCase()] || 'NWAP/NG/';

            const nwap_id = statecode + between(1, 20000);

            if (parseInt(array[7]) === 1) {
                let data = new User({
                    fullname: array[0],
                    phone_number: array[1],
                    nin: array[2],
                    state: array[3],
                    local_govt: array[4],
                    ward: array[5],
                    commodity: array[6],
                    nwap_id: nwap_id
                });

                try {
                    // Check if the database is connected before saving
                    await dbReady();

                    // Wrap the save operation with a timeout
                    await withTimeout(data.save(), 30000); // 30 seconds timeout
                    response = 'END Data saved successfully! Your NWAP_ID is ' + nwap_id;
                } catch (err) {
                    console.error('Error saving data:', err);
                    response = err.message === 'Operation timed out' ? 
                        'END Operation timed out, please try again.' : 
                        'END Error occurred while saving data: ' + err.message;
                }
            } else if (parseInt(array[7]) === 2) {
                response = 'END Registration canceled';
            } else {
                response = 'END Invalid Input';
            }
        } else {
            response = 'END Network error. Please try again';
        }
    }

    res.send(response);
});

app.listen(PORT, () => {
    console.log('App is running on Port ' + PORT);
});
