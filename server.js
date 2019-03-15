const http = require('http');
const port = 3000;
const express = require('express');
const app = express();

/* 
This code is to allow localhost testing from file:// pages
*/
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
//TODO: Check if above is necessary in a hosted env 

const bp = require('body-parser');
app.use(bp());

// Database connection to created database
const sql = require('sqlite3')
const db = new sql.Database('ratings.db');

/* Fake db code
const fdb = {
    'ravi':{age:42, rating:1500},
    'praney':{age:15, rating:1600},
    'saanvi':{age:12, rating:1400},
};
*/

app.listen(port, () => {
})

app.get('/', (req, res) => {
        db.all("select * from ratings", (err, rows) => {
            if(err){
                res.send(err.message);
            }else{
                res.json(rows);
            }
        });
});

app.get('/players', (req, res, next) => {
    if (req.query.rating){
        db.all('select * from ratings WHERE rating > ?', [req.query.rating], (err, rows)=>{
            if(err){
                res.send(err.message);
            }else{
                const allPlayers = rows.map(e => e.name);
                res.json(allPlayers);
            }
        });
    }else{
        db.all("select * from ratings", (err, rows) => {
            if(err){
                res.send(err.message);
            }else{
                const allPlayers = rows.map(e => e.name);
                //console.log(allPlayers);
                res.json(allPlayers);
            }
        });
    }
  });

app.get('/players/:name', (req, res) => {
    db.get('select * from ratings where name = ?', [req.params.name], (err, row) =>{
        if(err){
                res.send(err.message);
        }else{
                //console.log(row);
                res.json(row);
            }
    });
});

/* Add a new player into the DB */
app.post('/players', (req, res) => {
    
    const age = req.body.age;
    let init_rating = age < 15? age * 100 : 1500;   //strange heuristic but seems to be ok most times

    db.run('insert into ratings VALUES ($name, $init_rating)', 
        {
            $name: req.body.name,
            $init_rating: init_rating
        },
        (err)=>{
            if(err){
                console.log(err.message);
                res.send(err.message);
            }else{
                //console.log('Added new player ' + req.body.name + ' with rating ' + init_rating);
                res.send('Added new player ' + req.body.name + ' with rating ' + init_rating);
            }
        }); //end db.run
});

/* implements the Elo formula to calculate the new ratings */
function updateRatings(rating1, rating2, result){

    const p2 = 1.0/(1.0 + Math.pow(10, ((rating1 - rating2)/400)));
    const p1 = 1.0/(1.0 + Math.pow(10, ((rating2 - rating1)/400)));

    const k = 32;   // it seems ICC uses this for calculating...

    let newRating1 = rating1;
    let newRating2 = rating2;

    if (result === 'WW'){   // actual score is 1, 0
        newRating1 += k * (1.0 - p1); 
        newRating2 += k * (0.0 - p2); 
    }else if (result === 'BW'){  // actual score is 0, 1
        newRating1 += k * (0.0 - p1); 
        newRating2 += k * (1.0 - p2); 
    }
    else{ // actual score is 0.5, 0.5
        newRating1 += k * (0.5 - p1); 
        newRating2 += k * (0.5 - p2); 
    }
    return [Math.round(newRating1), Math.round(newRating2)];
}


function getPlayerRating(player){
    return new Promise( (resolve, reject) => {
    var player_rating = 0;
    db.get('select (rating) from ratings where name = ?', [player], (err, rows) =>{
        if(err){
                console.log(err.message);
                reject(err.message);
        }else{
                player_rating = rows.rating;
                resolve(player_rating);
            }
    });
    });
}
function putPlayerRating(player, new_rating){
    return new Promise( (resolve, reject) => {
    db.run('update ratings set rating = ? where name = ?', [new_rating, player], (err, rows) =>{
        if(err){
                console.log(err.message);
                reject(err.message);
        }else{
                resolve();
            }
    });
    }); //end Promise
}

app.post('/gameInfo', async (req, res) => {

        const playerw = req.body.playerw;
        const playerb = req.body.playerb;

        // get current rating from the DB...
        let rpw =  await getPlayerRating(playerw);
        let rpb =  await getPlayerRating(playerb);

        /*
        console.log("Rating player w: " + rpw);
        console.log("Rating player b: " + rpb);
        console.log("result: " + req.body.result);
        */

        let [newPlayerwRating, newPlayerbRating] = updateRatings(rpw, rpb, req.body.result);
        //console.log(" new player w rating: " + newPlayerwRating);
        //console.log(" new player b rating: " + newPlayerbRating);
        
        // Update new ratings in the DB...
        await putPlayerRating(playerw, newPlayerwRating);
        await putPlayerRating(playerb, newPlayerbRating);

        const respObj = 'new ratings are ' + newPlayerwRating + "  " + newPlayerbRating;
        res.send(respObj);
 });