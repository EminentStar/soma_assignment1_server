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

  var data = {email: email, name:name, password:password};

  console.log("email: "+ email + ", name: "+ name +", password: "+ password);

  pool.getConnection(function(err, connection){
    var query = connection.query("INSERT INTO member SET ?", data, function(err, result){
      if(err){
        res.send("{'isSucceeded' : false }");
        console.log("err : " + err);
      }else{
        console.log(email + name + password);
        res.send("{'isSucceeded' : true}");
      }
    });
    console.log(query.sql);
  });

});

module.exports = router;
