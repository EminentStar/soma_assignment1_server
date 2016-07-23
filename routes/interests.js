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

var gcm = require('node-gcm');
var fs = require('fs');

var messageToStudent = new gcm.Message({
    collapseKey: 'matching',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        title: 'OOO님과 매칭',
        message: '연락하세요: 010-XXXX-XXXX',
        custom_key1: 'custom data1',
        custom_key2: 'custom data2'
    }
});

var messageToTutor = new gcm.Message({
    collapseKey: 'matching',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        title: 'OOO님과 매칭',
        message: '연락하세요: 010-XXXX-XXXX',
        custom_key1: 'custom data1',
        custom_key2: 'custom data2'
    }
});

var server_api_key = 'AIzaSyCtUrgS0kcQM44lNQ4U3S8jxrIYWHukDoE';
var sender = new gcm.Sender(server_api_key);
var registrationIds = [];

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
router.post('/suggest', function(req, res){

    var postId = req.body.postId;
    var studentEmail = req.body.studentEmail;
    var tutorEmail = req.body.tutorEmail;
    var description = req.body.description;

    var json = {
        isSucceeded: true
    };

    var data = {
        postId: postId,
        email: tutorEmail,
        description: description
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
                connection.query("SELECT gcmToken FROM User WHERE email = '" + studentEmail + "'", function(err, row){
                    if(err){
                        console.log("err: " + err);
                        json.isSucceeded = false;
                        res.send(json);
                    }
                    else{
                        if(row.length == 1){
                            registrationIds.push(row[0].gcmToken);
                            messageToStudent.params.data.title = "튜터링 신청이 왔습니다.";
                            messageToStudent.params.data.message = "신청자: " + tutorEmail;
                            sender.send(messageToStudent, registrationIds, 4, function(err, result){
                                if(err) console.log("err: " + err);
                                else console.log("result: " + result);
                                registrationIds = [];
                            });
                            res.send(json);
                        }
                    }
                });
            }
            connection.release();
        });
    });
});

router.post('/gcm', function(req, res){
    var studentEmail = req.body.studentEmail;
    var postId = req.body.postId;
    var tutorEmail = req.body.tutorEmail;

    var studentInfo = {
        email: studentEmail,
        name: "",
        phoneNumber: "",
        gcmToken: ""
    };
    var tutorInfo = {
        email: tutorEmail,
        name: "",
        phoneNumber: "",
        gcmToken: ""
    };

    var json = {
        isSucceeded: false
    };

    var success = true;

    console.log("delete test: " + studentEmail + ", " + postId + ", " + tutorEmail);

    //studentEmail과 tutorEmail을 이용하여 User Table에서 각각 student와 tutor의 name, phoneNumber, gcmToken을 얻는다.
    pool.getConnection(function(err, connection){
        connection.query("SELECT name, phoneNumber, gcmToken FROM User WHERE email = '"
                                            + studentInfo.email + "'",function(err,rowStudent){
            if(err){
                console.log("err: " + err );
                success = false;
            }
            if(rowStudent.length == 1){
                studentInfo.name = rowStudent[0].name;
                studentInfo.phoneNumber = rowStudent[0].phoneNumber;
                studentInfo.gcmToken = rowStudent[0].gcmToken;
                connection.query("SELECT name, phoneNumber, gcmToken FROM User WHERE email = '"
                                    + tutorInfo.email + "'",function(err,rowTutor){
                    if(err) console.log("err: " + err);
                    if(rowTutor.length == 1){
                        tutorInfo.name = rowTutor[0].name;
                        tutorInfo.phoneNumber = rowTutor[0].phoneNumber;
                        tutorInfo.gcmToken = rowTutor[0].gcmToken;
                        //student와 tutor에 보낼 메시지에 이름과 전화번호를 각자 셋팅한다.
                        messageToStudent.params.data.title = tutorInfo.name + "님과 매칭";
                        messageToStudent.params.data.message = "연락하세요: " + tutorInfo.phoneNumber ;

                        messageToTutor.params.data.title = studentInfo.name + "님과 매칭";
                        messageToTutor.params.data.message = "연락하세요: " + studentInfo.phoneNumber ;

                        //registraionIds에 하나의 토큰을 집어넣고 send한다.
                        registrationIds.push(studentInfo.gcmToken);
                        sender.send(messageToStudent, registrationIds, 4, function(err, result){
                            if(err){
                                console.log("err: " + err);
                                success = false;
                            } else{
                                registrationIds = [];
                                registrationIds.push(tutorInfo.gcmToken);
                                sender.send(messageToTutor, registrationIds, 4, function(err, result){
                                    if(err){
                                        console.log(err);
                                        success = false;
                                    }else{
                                        console.log(result);
                                        //2번의 gcm 전송에 성공하면
                                        pool.getConnection(function(err, result){
                                            //postId와 연관된 모든 Interest rows를 delete한다.
                                            connection.query("DELETE FROM Interest WHERE postId = " + postId , function(err, result){
                                                if(err){
                                                    console.log("err: " + err);
                                                    success = false;
                                                } else{
                                                    //postId의 Post row의 isComplete를 1로 바꾼다. (완성됨)
                                                    connection.query("UPDATE Post SET isComplete = 1 WHERE postId = "+ postId, function(err, result){

                                                    });

                                                }
                                            });
                                            connection.release();
                                        });
                                    }
                                });
                            }
                        });
                    }else{
                        success = false;
                    }
                });
            }else{
                success = false;
            }
        });
        connection.release();
    });
});

module.exports = router;
