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

module.exports = router;
