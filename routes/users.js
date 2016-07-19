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
  //res.  send('user ' + req.params.id);
  pool.getConnection(function(err, connection){
    connection.query('SELECT * FROM member', function(err, rows){
      if(err) console.error("err : " + err);
      console.log("rows: " + JSON.stringify(rows));
      res.send(rows);
      //res.render('user', {title: 'test', rows:rows});
      connection.release();
    });
  });
});

/* POST users listing */
router.post('/', function(req, res){

  var email = req.body.email;
  var name = req.body.name;
  var password = req.body.password;
  var createTime = new Date();

  var json = {
    isSucceeded: true
  }

  var data = {
    email: email,
    name:name,
    password:password,
    createTime: createTime};

  console.log("email: "+ email + ", name: "+ name +", password: "+ password);

  pool.getConnection(function(err, connection){
    connection.query("INSERT INTO member SET ?", data, function(err, result){
      if(err){
        json.isSucceeded = false;
        res.send(json);
        console.log("err : " + err);
      }else{
        console.log(email + name + password);
        res.send(json);
      }
      connection.release();
    });
  });
});

//login 기능
router.post('/login', function(req, res){
  var email = req.body.email;
  var password = req.body.password;

  var data = {
    email: email,
    password: password
  };


  var json = {
    isSucceeded: false,
    rowCount: 0
  };

  console.log("email: "+ email + ", password: "+ password);

  pool.getConnection(function(err, connection){
    connection.query("SELECT * FROM MEMBER WHERE email ='"+email+"' and password = '"+password+"'", function(err, rows){
      if(err){
        console.error("err : " + err);
        res.send(json);
      }else{
        console.log("rowsCnt: " + rows.length);
        json.isSucceeded = true;
        json.rowCount = rows.length;
        res.send(json);
      }
      connection.release();
    });
  });
});

module.exports = router;
