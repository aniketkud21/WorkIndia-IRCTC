const mysql = require('mysql2')

require('dotenv').config()

const db = mysql.createConnection({
    host:'localhost',
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_TABLE
}).promise();

async function getUserbyId(id){
    q = 'SELECT * FROM user WHERE id = ?'
    const result = await db.query(q,[id]);
    return result[0];
}

async function getUserbyName(name){
    q = 'SELECT * FROM user WHERE name = ?'
    const result = await db.query(q,[name]);
    console.log(result)
    return result[0];
}

async function addUser(name,password,salt,isAdmin,email){
    q = 'INSERT INTO user(name,hashedPassword,salt,isAdmin,email) VALUES(?,?,?,?,?)'
    const result = await db.query(q,[name,password,salt,isAdmin,email]);
    return result[0].insertId;
}

module.exports.db = db
module.exports.getUserbyId = getUserbyId
module.exports.getUserbyName = getUserbyName
module.exports.addUser = addUser

