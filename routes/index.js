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

var passwordHash = require('password-hash');

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

  pool.getConnection(function(err, connection){
    connection.query("SELECT pwd FROM User WHERE email = '" + email + "'", function(err, row){
      if(err) console.log("err: " + err);
      else{
        if(passwordHash.verify(pwd, row[0].pwd)){
          connection.query("SELECT email, name, introduction, createTime, isFacebook, phoneNumber, gcmToken FROM User", function(err, rows){
            if(err) {
              console.error("err : " + err);
              res.render('error', {});
            }
            connection.release();
            res.render('cmsUserList', {userList: rows});
          });
        }else{
          res.render('error', {});
        }
      }
    });
  });
});


module.exports = router;
