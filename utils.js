const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

require('dotenv').config()

function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

function validatePassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

function issueJWT(user){
    //const _id = user.id
    const expiresIn = '1d'

    const payload = {
        sub:user.id,
        iat:Date.now()
    }
    
    const signedToken = jsonwebtoken.sign(payload,process.env.PRIV_KEY,{expiresIn:expiresIn})

    return {
        token : signedToken,
        expires :expiresIn
    }
}

module.exports.genPassword = genPassword
module.exports.validatePassword = validatePassword
module.exports.issueJWT = issueJWT