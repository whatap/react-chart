var http = require('http');
var path = require('path');
var fs = require('fs');


var router = require('http-router');
routes = router.createRouter();

routes
    .get('/', function (req, res, next) {
        var contents = fs.readFileSync(path.join(__dirname, '..', 'index.html'));
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(contents);
        res.end();
        return next();
    })
    .get('/favicon.ico', function (req, res, next) {
        var contents = fs.readFileSync(path.join(__dirname, '..', 'favicon.ico'));
        res.writeHead(200, {'Content-Type': 'image/ico'});
        res.write(contents);
        res.end();
        return next();
    })
    .get('/whatap.bundle.js', function (req, res, next) {
        var contents = fs.readFileSync(path.join(__dirname, '..', 'whatap.bundle.js'));
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(contents);
        res.end();
        return next();
    });

http.createServer(function (req, res) {
    if (!routes.route(req, res)) {
        res.writeHead(501);
        res.end(http.STATUS_CODES[501] + '\n');
    }
}).listen(process.env.PORT || 3000);