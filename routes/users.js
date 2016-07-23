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
    });
    connection.release();
  });
});

router.get('/:email', function(req,res){
  var email = req.params.email;
  pool.getConnection(function(err, connection){
    connection.query("SELECT * FROM User WHERE email= '" + email + "'", function(err, result){
      if(err) console.error("err : " + err);
      if(result.length == 1) res.send(result[0]);
    });
    connection.release();
  });
});

//사용자 정보 수정 기능
router.put('/common', function(req, res){
  var data = {
    email:req.body.email,
    name : req.body.name,
    introduction : req.body.introduction,
    phoneNumber: req.body.phoneNumber,
    gcmToken: req.body.gcmToken
  };
  pool.getConnection(function(err, connection){
    connection.query("UPDATE User SET ? WHERE email = '" + data.email + "'", data, function(err, result){
      if(err){console.log("err : " + err);
      }else{
        console.log("success");
        connection.query("SELECT * FROM User WHERE email = '" + data.email + "'", function(req, result){
          if(err) console.log("err: "+ err);
          else{
            res.send(result[0]);
          }
        });
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
  var gcmToken = req.body.gcmToken;

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
    gcmToken: gcmToken
  };

  console.log("email: "+ email + ", name: "+ name +", pwd: "+ pwd);

  pool.getConnection(function(err, connection){
    connection.query("INSERT INTO User SET ?", data, function(err, result){
      if(err){
        console.log(err);
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
    phoneNumber:"",
    gcmToken:"",
    rowCount: 0
  };

  console.log("email: "+ email + ", pwd: "+ pwd);

  pool.getConnection(function(err, connection){
    connection.query("SELECT * FROM User WHERE email ='"+email+"' and pwd = '"+pwd+"'", function(err, rows){
      if(err){
        console.error("err : " + err);
      }else{
        console.log("rowsCnt: " + rows.length);
        json.rowCount = rows.length;
        if(rows.length != 0){
          json.isSucceeded = true;
          json.name = rows[0].name;
          json.email = rows[0].email;
          json.phoneNumber = rows[0].phoneNumber,
              json.gcmToken = rows[0].gcmToken;
          res.send(json);
        }else{
          console.log("로그인 실패");
          res.send(json);
        }
      }
      connection.release();
    });
  });
});

//페이스북 회원가입 여부 및 로그인
router.post("/fb", function(req, res){
  var email = req.body.email;
  var name = req.body.name;
  var gcmToken = req.body.gcmToken;
  var createTime = new Date();

  var json = {
    email: email,
    pwd: "",
    name: name,
    introduction: "",
    createTime: createTime,
    isFacebook: 1,
    phoneNumber: "",
    gcmToken: gcmToken
  }
  pool.getConnection(function(err, connection){
    connection.query("SELECT * FROM User WHERE email ='" + email + "'", function(err, rows){
      if(err){
        console.error("err : " + err);
      }else{
        if(rows.length == 1) { //이미 페이스북으로 회원가입 하였을 때
          connection.query("UPDATE User SET gcmToken = '" + gcmToken + "' WHERE email = '" + email + "' ", function(err, result){
            if(err) console.error("err: "+ err);
            json.introduction = rows.introduction;
            json.phoneNumber  =rows.phoneNumber;
            res.send(json);
          });
        }else{//테이블에 없으므로 페이스북 회원가입을 시도
          connection.query("INSERT INTO User SET ?", json, function(err, result){
            if(err) console.log("err : " + err);
            res.send(json);
          });
        }
      }
      connection.release();
    });
  });
});


module.exports = router;

