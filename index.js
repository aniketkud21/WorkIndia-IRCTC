const express = require('express');
const app = express()

const passport = require('passport');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const port = process.env.PORT || 3000

require('./config/passport')(passport)
app.use(passport.initialize())

//DATABASE USER
const getUserbyName = require('./config/database').getUserbyName;
const addUser = require('./config/database').addUser;
const getUserbyId = require('./config/database').getUserbyId;

//DATABASE TRAINS
const addTrain = require('./config/database').addTrain;

//DATABASE BOOKINGS
const makeBooking = require('./config/database/makeBooking');

//Utils
const genPassword = require('./utils').genPassword
const validatePassword = require('./utils').validatePassword
const issueJWT = require('./utils').issueJWT

//Admin
const isAdmin = require('./adminMiddleware').isAdmin

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req,res)=>{
    res.send('Hello');
})

app.post('/register', async(req,res)=>{
    const user = await getUserbyName(req.body.username);
    if(user.length>0){
        return res.json({success: false, message:'User already exists'})
    } else {
        const saltHash = genPassword(req.body.password);

        salt = saltHash.salt;
        hash = saltHash.hash;
        try {
            const result = await addUser(req.body.username,hash,salt,false,req.body.email);
            return res.json({status: 'Account successfully created', status_code:200, user_id: result})
        } catch (error) {
            return res.json({success: false, error})
        }
    }
})

app.post('/login', async(req,res)=>{
    const user = await getUserbyName(req.body.username);
    if ( user.length == 0) return res.json({status: 'Incorrect Username/Password provided. Please retry', status_code: 401});

    const isValid = validatePassword(req.body.password,user[0].hashedPassword, user[0].salt);
        if (isValid) {
            const tokenObject = issueJWT(user[0]);
            return res.json({status: "Login successful",
                             status_code: 200,
                             user_id: user[0].id,
                             access_token: tokenObject.token});
        } else {
            return res.json({status: 'Incorrect Username/Password provided. Please retry', status_code: 401});
        }
})

app.post('/trains/create', passport.authenticate('jwt',{session:false}), async(req,res)=>{
    console.log(req.headers['authorization']);
    const isvalidAdmin = isAdmin(req.headers['authorization']);
    if(!isvalidAdmin) return res.json({status: 'Unauthorized', status_code: 401}); 

    try {
        const {name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination} = req.body
        const result = await addTrain(name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination);
        return res.json({message: "Train added successfully",train_id: result.insertId});
    } catch (error) {
        return res.json({status: error, status_code: 401});
    }
})

app.get('/trains/availability?source=:SOURCE&destination:DESTINATION', async(req,res)=>{
    const source = req.params.source
    const destination = req.params['SOURCE&destination:DESTINATION']
})

app.post('/api/trains/:train_id/book', passport.authenticate('jwt', {session:false}), async(req,res)=>{
    const train_id = req.params.train_id
    
    
    const result = await makeBooking(train_id, req.body.user_id, req.body.no_of_seats);
})

app.get('/protected', passport.authenticate('jwt',{session:false}), (req,res)=>{
    res.send('Protected Route');
})

app.listen(port, ()=>{
    console.log('Server Started');
})