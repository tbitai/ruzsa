var express = require('express');
var helmet = require('helmet');

var app = express();

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var host = process.env.OPENSHIFT_NODEJS_IP || 'localhost';

// Middlewares, in order of execution
app.use(helmet());
app.use(function forceHTTPS(req, res, next) {
    if (req.headers['x-forwarded-proto'] == 'http') {
        res.redirect('https://' + req.headers.host + req.path);
    } else {
        return next();
    }
});
app.use(express.static(__dirname));

app.listen(port, host, function() {
    console.log('ruzsa listening on ' + host + ':' + port);
});
