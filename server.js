var express = require('express');

var request = require('request'),  
    jsdom = require('jsdom');

var app = express();



app.use(express.static(__dirname + '/public'));

app.all('/*', function(req, res) {
	res.sendfile('public/index.html');
});

var server = app.listen(process.env.PORT || 3000, function() {
	console.log('Listening on port %d', server.address().port);
});