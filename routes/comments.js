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
    var content = req.body.content;

    var json = {
        isSucceeded: true
    }

    var data = {
        postId: postId,
        email: email,
        content: content,
    };

    console.log("postId: " + postId + "email: "+ email + ", content: " + content);

    pool.getConnection(function(err, connection){
        connection.query("INSERT INTO Comment SET ?", data, function(err, result){
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

router.get('/:postId', function(req, res){
    var postId = req.params.postId;
    pool.getConnection(function(err, connection){
       connection.query("SELECT * FROM Comment WHERE postId = " + postId, function(err, rows){
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

module.exports = router;

