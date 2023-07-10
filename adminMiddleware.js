const jwt = require('jsonwebtoken')
const getUserbyId = require('./config/database').getUserbyId;

async function isAdmin(authHeader){

    const token = authHeader.substring(7, authHeader.length);
    const decodedjwt = jwt.decode(token, {complete:true})
    const result = await getUserbyId(decodedjwt.payload.sub);
    if(result[0].isAdmin == 1) return true;
    else return false; 
}

module.exports.isAdmin = isAdmin;