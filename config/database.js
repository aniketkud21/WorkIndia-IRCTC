const mysql = require('mysql2')

require('dotenv').config()

const db = mysql.createConnection({
    host:'localhost',
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_TABLE
}).promise();


// AUTH

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

// TRAIN

async function addTrain(name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination){
    q = 'INSERT INTO train(name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination) VALUES(?,?,?,?,?,?)'
    const result = await db.query(q,[name,source,destination,seat_capacity,arrival_time_at_source,arrival_time_at_destination]);
    return result[0].insertId;
}

async function getTrain(source, destination){
    q= 'SELECT id, name, seat_capacity as available_seats FROM train WHERE source = ? AND destination = ?'
    const result = await db.query(q,[source,destination]);
    return result[0];
}

//BOOKINGS

async function makeBooking(train_id,id,no_of_seats){
    q='SELECT seat_capacity FROM train WHERE id = ?'
    const result1 = await db.query(q,[train_id]);

    if(result1[0][0].seat_capacity >= no_of_seats){
        seatsLeft = result1[0][0].seat_capacity - no_of_seats;
        q2 = 'UPDATE train SET seat_capacity = ? WHERE id = ?'
        const result2 = await db.query(q,[seatsLeft,train_id]);
        return {
            booking_id:result2.updateId
        }
    }
    return -1;
}

module.exports.db = db
module.exports.getUserbyId = getUserbyId
module.exports.getUserbyName = getUserbyName
module.exports.addUser = addUser

module.exports.addTrain = addTrain
module.exports.getTrain = getTrain

module.exports.makeBooking = makeBooking

