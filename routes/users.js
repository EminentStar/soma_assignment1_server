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

//총 회원수 조회 기능
router.get('/', function(req, res, next) {
  var json = {
    userCount:0,
  }

  pool.getConnection(function(err, connection){
    connection.query('SELECT COUNT(*) FROM User', function(err, rows){
      if(err) console.error("err : " + err);
      console.log("rows: " + JSON.stringify(rows));
      json.userCount = rows.length;
      res.send(json);
      connection.release();
    });
  });
});

//사용자 정보 수정 기능
router.put('/common', function(req, res){


  var data = {
    name : req.body.name,
    introduction : req.body.introduction,
    phoneNumber: req.body.phoneNumber
  };
  pool.getConnection(function(err, connection){
    connection.query("UPDATE User SET ? WHERE email = '" + req.body.email + "'", data, function(err, result){
      if(err){
        //json.isSucceeded = false;
        res.send(result);
        console.log("err : " + err);
      }else{
        res.send(result);
        console.log("success");
      }
      connection.release();
    });
  });
});

//일반 사용자 회원가입 기능
router.post('/common', function(req, res){

  var email = req.body.email;
  var name = req.body.name;
  var pwd = req.body.pwd;
  var createTime = new Date();
  var phoneNumber = req.body.phoneNumber;
  var fcmToken = req.body.fcmToken;

  var json = {
    isSucceeded: true
  }

  var data = {
    email: email,
    name:name,
    pwd: pwd,
    createTime: createTime,
    isFacebook: 0,
    phoneNumber: phoneNumber,
    fcmToken: fcmToken
  };

  console.log("email: "+ email + ", name: "+ name +", pwd: "+ pwd);

  pool.getConnection(function(err, connection){
    connection.query("INSERT INTO User SET ?", data, function(err, result){
      if(err){
        json.isSucceeded = false;
        res.send(json);
        console.log("err : " + err);
      }else{
        res.send(json);
        console.log("success");
      }
      connection.release();
    });
  });
});

//일반 사용자 login 기능
router.post('/common/login', function(req, res){
  var email = req.body.email;
  var pwd = req.body.pwd;

  var data = {
    email: email,
    pwd: pwd
  };

  var json = {
    isSucceeded: false,
    name: "",
    email:"",
    phoneNnumber:"",
    fcmToken:"",
    rowCount: 0
  };

  console.log("email: "+ email + ", pwd: "+ pwd);

  pool.getConnection(function(err, connection){
    connection.query("SELECT * FROM User WHERE email ='"+email+"' and pwd = '"+pwd+"'", function(err, rows){
      if(err){
        console.error("err : " + err);
        //res.send(json);
      }else{
        console.log("rowsCnt: " + rows.length);
        json.isSucceeded = true;
        json.rowCount = rows.length;
        if(rows.length != 0){
          json.name = rows[0].name;
          json.email = rows[0].email;
          json.phoneNnumber = rows[0].phoneNnumber,
          json.fcmToken = rows[0].fcmToken;
          res.send(json);
        }
      }
      connection.release();
    });
  });
});

module.exports = router;

