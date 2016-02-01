var express = require('express');
var helmet = require('helmet');

var app = express();

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

// Middlewares, in order of execution
app.use(helmet());
app.use(express.static(__dirname));

app.listen(port, function() {
    console.log('ruzsa listening on port ' + port);
});
