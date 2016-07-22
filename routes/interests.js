var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 3,
    host:'localhost',
    user: 'dev',
    database: 'junkyu',
    password: '0000'
});

var iconv = require('iconv-lite');

router.get('/:postId', function(req, res){
    var postId = req.params.postId;
    pool.getConnection(function(err, connection){

        var query = "SELECT Interest.email AS email," +
            " (SELECT phoneNumber FROM User WHERE User.email = Interest.email) AS phoneNumber," +
            " Interest.description AS description " +
            " FROM Interest WHERE postId ="+ postId;

        connection.query(query, function(err, rows){
            if(err){
                console.log("err : " + err);
            }else{
                console.log("success");
                res.send(rows);
            }
        });
        connection.release();
    });
});


/* POST */
router.post('/', function(req, res){

    var postId = req.body.postId;
    var email = req.body.email;
    var description = req.body.description;

    var json = {
        isSucceeded: true
    }

    var data = {
        postId: postId,
        email: email,
        description: description,
    };

    console.log("email: "+ email + ", description: " + description);

    pool.getConnection(function(err, connection){
        connection.query("INSERT INTO Interest SET ?", data, function(err, result){
            if(err){
                console.log("err : " + err);
                json.isSucceeded = false;
                res.send(json);
            }else{
                res.send(json);
            }
            connection.release();
        });
    });
});

module.exports = router;

