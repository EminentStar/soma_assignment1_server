var express = require('express');
var app = express();
var server = app.listen(9000, function(){
        console.log("Express server has stasrted on port 9000");
});

app.get('/', function(req, res){
	res.send('Hello World');
});
app.get('/wines', function(req, res){
	res.send([{name:'wine1'}, {name: 'wine2'}]);
});
app.get('/wines:id', function(req, res){
	res.send([{id:req.params.id, name: "The Name", description: "description"}]);
});

