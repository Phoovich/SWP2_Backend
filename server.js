const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path:'./config/config.env'});

//connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//route files
const hospitals = require('./routes/hospitals');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

//Mount routers
app.use('/api/v1/hospitals', hospitals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);

// app.get('/', (req, res) => {
//     //1. res.send('<h1>Hello from express</h1>');
//     //2. res.send({name:'Brad'});
//     //3. res.json({name:'Brad'});
//     //4. res.sendStatus(400);
//     //5. res.status(400).json({success:false});
//     res.status(200).json({success:true, data:{id:1}});
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message}`);
    //close server & exit process
    server.close(() => process.exit(1));
});