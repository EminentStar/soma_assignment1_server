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


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/cmsUserList', function(req, res){
  pool.getConnection(function(err, connection){
    connection.query("SELECT email, name, introduction, createTime, isFacebook, phoneNumber, gcmToken FROM User", function(err, rows){
      if(err) console.error("err : " + err);

      connection.release();
      res.render('cmsUserList', {userList: rows});
    });
  });
});

router.get('/cmsUserDelete', function(req, res){
  pool.getConnection(function(err, connection){
    connection.query("SELECT email, name, introduction, createTime, isFacebook, phoneNumber, gcmToken FROM User", function(err, rows){
      if(err) console.error("err : " + err);

      connection.release();
      res.render('cmsUserDelete', {userList: rows});
    });
  });
});

router.post('/deleteUser', function(req,res){
  var email = req.body.email;
  pool.getConnection(function(err, connection){
    connection.query("DELETE FROM User WHERE email = '"+ email+"'", function(err, rows){
      if(err) console.error("err : " + err);
          //alert("삭제 실패")
      else{//회원삭제 성공 및 갱신
        pool.getConnection(function(err, connection){
          connection.query("SELECT email, name, introduction, createTime, isFacebook, phoneNumber, gcmToken FROM User", function(err, rows){
            if(err) console.error("err : " + err);
            connection.release();
            res.render('cmsUserDelete', {userList: rows});
          });
        });
      }
      connection.release();
    });
  });
});

router.post('/login', function(req, res){
  var email = req.body.email;
  var pwd = req.body.pwd;

  console.log(req.body);

  console.log(email+ ",," + pwd);

  if(email == "admin@hweach.com" && pwd == "0000"){ //관리자 로그인 성공
    pool.getConnection(function(err, connection){
      connection.query("SELECT email, name, introduction, createTime, isFacebook, phoneNumber, gcmToken FROM User", function(err, rows){
        if(err) console.error("err : " + err);
        //console.log("rows: " + JSON.stringify(rows));
        //json.userCount = rows.length;
        //res.send(json);
        connection.release();
        res.render('cmsUserList', {userList: rows});
      });
    });
  }else{
    console.log("로그인 실패");
  }
});

module.exports = router;
