var express = require('express');
var helmet = require('helmet');
var forceSSL = require('express-force-ssl');

var app = express();

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var host = process.env.OPENSHIFT_NODEJS_IP || 'localhost';

// Middlewares, in order of execution
app.use(helmet());
app.use(forceSSL);
app.use(express.static(__dirname));

app.listen(port, host, function() {
    console.log('ruzsa listening on ' + host + ':' + port);
});
