const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const getUserbyId = require('./database').getUserbyId
require('dotenv').config()

const options = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PRIV_KEY,
}

module.exports = (passport)=>{
    passport.use(new JwtStrategy(options, async(jwt_payload, done)=>{

        try {
            const user = await getUserbyId(jwt_payload.sub);
            if ( user.length == 0) return done(null, false , {status: 'Incorrect Username/Password provided. Please retry', status_code: 401});

            return done(null,user[0]);
        } catch (error) {
            return done(error, false, {status: 'Incorrect Username/Password provided. Please retry', message:error, status_code: 401})
        }
    
    })
    )
}

