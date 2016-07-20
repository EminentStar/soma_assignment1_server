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

/* GET users listing. */
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

/* POST users listing */
router.post('/common', function(req, res){

  var email = req.body.email;
  var name = req.body.name;
  var pwd = req.body.pwd;
  var createTime = new Date();

  var json = {
    isSucceeded: true
  }

  var data = {
    email: email,
    name:name,
    pwd: pwd,
    createTime: createTime,
    isFacebook: 0
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

//login 기능
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
          res.send(json);
        }
      }
      connection.release();
    });
  });
});

module.exports = router;

