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

var FCM = require('fcm-node');

var serverKey = 'AIzaSyAfjEzelxilfXZ1xZSWBfRF-YNVx5WZIns';
var fcm = new FCM(serverKey);

var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: 'registration_token',
    collapse_key: 'matching',
    data: {
        title: '타이틀!!!',
        message : 'your_custom_data_value'
    },
    notification: {
        title: '튜터 매칭',
        body: 'Body of your push notification',
        icon: 'ic_launcher' //now required
    }
};

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

router.get('/push/:email', function(req, res){
    var email = req.params.email;

    console.log("email: " + email);

    pool.getConnection(function(err, connection){
        var query = "SELECT fcmToken FROM User WHERE email = '" + email + "';";
        connection.query(query, function(err, rows){
            if(err){
                console.log("err : " + err);
            }else{
                console.log("Query Success");
                message.to = rows[0].fcmToken;
                fcm.send(message, function(err, response){
                   if(err){
                       console.log(err);
                   }else{
                       console.log("Successfully sent with response: ", response);
                   }
                });
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
                //res.send(err);
            }else{
                res.send("success");
            }
            connection.release();
        });
    });
});

module.exports = router;

