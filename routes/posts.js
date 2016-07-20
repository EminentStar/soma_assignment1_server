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

/*GET */
router.get('/article', function(req, res){
    console.log("GET method /article ");

    pool.getConnection(function(err, connection){
        connection.query("SELECT * FROM Post ORDER BY postId DESC", function(err, rows){
            if(err){
                console.log("err : " + err);
            }else{
                console.log("success");
                res.send(rows);
            }
            connection.release();
        });
    });
});


/* POST */
router.post('/article', function(req, res){

    var email = req.body.email;
    var title = req.body.title;
    var content = req.body.content;

    var json = {
        isSucceeded: true
    }

    var data = {
        email: email,
        title: title,
        content: content
    };

    console.log("email: "+ email + ", title: "+ title +", content: "+ content );

    pool.getConnection(function(err, connection){
        connection.query("INSERT INTO Post SET ?", data, function(err, result){
            if(err){
                json.isSucceeded = false;
                res.send(json);
                console.log("err : " + err);
            }else{
                console.log("success");
                res.send(json);
            }
            connection.release();
        });
    });
});

module.exports = router;

