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

    var query = "SELECT Post.postId AS postId,"+
        " Post.email AS email, Post.title AS title,"+
        " Post.content AS content, isComplete,"+
        "(SELECT COUNT(*) FROM Interest WHERE Post.postId = Interest.postId ) AS interestCount, "+
        "(SELECT COUNT(*) FROM Comment WHERE Post.postId = Comment.postId ) AS commentCount"+
        " FROM Post WHERE Post.isComplete = 0 ORDER BY postId DESC;"

    pool.getConnection(function(err, connection){
        connection.query(query, function(err, rows){
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


//특정 사용자의 튜터링 요청글 리스트를 조회
router.get('/article/:email', function(req, res){
    console.log("GET method /article ");

    var email = req.params.email;

    var query = "SELECT Post.postId AS postId,"+
        " Post.email AS email, Post.title AS title,"+
        " Post.content AS content, isComplete,"+
        "(SELECT COUNT(*) FROM Interest WHERE Post.postId = Interest.postId ) AS interestCount, "+
        "(SELECT COUNT(*) FROM Comment WHERE Post.postId = Comment.postId ) AS commentCount"+
        " FROM Post WHERE Post.email = '" + email + "' AND Post.isComplete = 0 ORDER BY postId DESC;"

    pool.getConnection(function(err, connection){
        connection.query(query, function(err, rows){
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

