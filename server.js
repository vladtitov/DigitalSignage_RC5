"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookie = require('cookie-parser');
var fs = require('fs-extra');
var request = require('request');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    port: 80
});
var path = require('path');
GLOBAL.ROOT = __dirname;
GLOBAL.WWW = path.resolve(ROOT + '/client/');
GLOBAL.SERVER = path.resolve(ROOT + '/server/');
GLOBAL.DBALL = ROOT + '/server/db/';
GLOBAL.onError = function (err, res) {
    console.log('onError error\n', err);
    res.json({ error: 'error', reason: err });
    var str = "\r\n" + new Date().toLocaleString() + "\r\n";
    str += JSON.stringify(err);
    fs.appendFile(SERVER + '/error.log', str);
};
var dbDriver_1 = require("./server/db/dbDriver");
var app = express();
app.use(cookie());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'somesecrettokenherehello'
}));
app.use(express.static(WWW));
app.get('/', function (req, res) {
    res.sendFile('indexts.html', { 'root': WWW });
});
app.get('/loginHello', function (req, res) {
    res.sendFile('mylogin.html', { 'root': path.resolve(WWW + '/mylogin/') });
});
app.get('/loginHello/*', function (req, res) {
    res.sendFile('mylogin.html', { 'root': path.resolve(WWW + '/mylogin/') });
});
app.get('/dashboard', function (req, res) {
    res.sendFile('indexts.html', { 'root': WWW });
});
app.get('/screen/*', function (req, res) {
    res.sendFile('screen.html', { 'root': WWW });
});
app.get('/dashboard/*', function (req, res) {
    res.sendFile('indexts.html', { 'root': WWW });
});
app.get('/apidocs', function (req, res) {
    res.sendFile('index.html', { 'root': path.resolve(WWW + '/apidocs/') });
});
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/myversion/*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.all('/proxy/*', function (req, res) {
    var proxyURL = "http://digitalsignage.front-desk.ca/";
    req.url = req.url.substr(6);
    var options = { target: proxyURL };
    proxy.web(req, res, options);
});
app.use('/account', bodyParser.urlencoded({ extended: true }));
app.use('/account', bodyParser.json());
app.use('/account', require('./server/account/manager'));
app.use('/player/:token/', function (req, res, next) {
    var folder = req.session['user_folder'];
    if (folder)
        next();
    else {
        var token = req.params.token;
        if (!token) {
            res.json({ error: 'token' });
            return;
        }
        var db = new dbDriver_1.DBDriver(null);
        db.selectOne('SELECT folder FROM users WHERE token = ?', [token]).done(function (folder) {
            if (folder) {
                req.session['user_folder'] = folder.folder;
                next();
            }
            else
                res.json({ error: 'notoken' });
        }, function (err) { return res.json({ error: err }); });
    }
});
app.use('/api', bodyParser.urlencoded({ extended: true }));
app.use('/api', bodyParser.json());
app.use('/api', function (req, res, next) {
    var folder = req.session['user_folder'];
    if (!folder) {
        console.log(' user not loged in go to /clientAssets/folder_template_dev');
        req.session['user_folder'] = '/clientAssets/folder_template_dev/';
    }
    next();
});
var port = process.env.PORT || 56777;
app.use('/player/:token', require('./server/player/manager'));
app.use('/api/preview', require('./server/player/preview'));
app.use('/api/content', require('./server/content/manager'));
app.use('/api/assets', require('./server/assets/manager'));
app.use('/api/playlists', require('./server/playlists/manager'));
app.use('/api/layouts', require('./server/layouts/manager'));
var rss = require('./server/libs/rss');
app.get('/api/rss/:id', function (req, res) {
    rss.read(req.params.id, function (result) {
        res.json({ data: result });
    });
});
var phantom = require('node-phantom');
var webshot = require('webshot');
app.get('/api/web2/:id', function (req, res) {
    var phantom = require('node-phantom');
    phantom.create(function (err, ph) {
        res.json(err);
        console.log(ph);
    });
});
app.get('/api/webpage/:id', function (req, res) {
    webshot('uplight.ca', 'uplight.png', function (err) {
        res.json(err);
    });
});
app.listen(port, function () {
    console.log('http://127.0.0.1:' + port);
    console.log('http://127.0.0.1:' + port + '/api');
});
//# sourceMappingURL=server.js.map