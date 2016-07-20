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
                res.send(err);
            }else{
                res.send("success");
            }
            connection.release();
        });
    });
});

module.exports = router;

