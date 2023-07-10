const express = require('express');
const app = express()

const passport = require('passport');

require('dotenv').config()

const port = process.env.PORT || 3000

require('./config/passport')(passport)
app.use(passport.initialize())

//DATABASE
const getUserbyName = require('./config/database').getUserbyName;
const addUser = require('./config/database').addUser
const getUserbyId = require('./config/database').getUserbyId

//Utils
const genPassword = require('./utils').genPassword
const validatePassword = require('./utils').validatePassword
const issueJWT = require('./utils').issueJWT

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

app.get('/protected', passport.authenticate('jwt',{session:false}), (req,res)=>{
    res.send('Protected Route');
})

app.listen(port, ()=>{
    console.log('Server Started');
})