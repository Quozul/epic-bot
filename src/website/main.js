const express = require('express');
const mysql = require('sync-mysql');
const fs = require('fs');
const app = express();
const session = require('express-session');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const utils = require(__dirname + '/utils');

// Load bot's config
const config = JSON.parse(fs.readFileSync('config.json'));

// Connect to database
const connection = new mysql({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.session = req.session;
    res.locals.connection = connection;
    res.locals.params = req.params;
    res.locals.fs = fs;
    next();
});

app.get('/', function (req, res, next) {
    res.render('index');
});


// Button to connect to Discord oauth
app.get('/connect', function (req, res, next) {
    if (!utils.isConnected(req.session.discord))
        res.render('connect', { oauth_url: config.website.oauth_url });
    else
        res.redirect('/select');
});

// Revoke token
app.get('/disconnect', function (req, res, next) {
    const sd = req.session.discord;

    if (!utils.isConnected(sd))
        res.redirect('/connect');
    else
        fetch('https://discord.com/api/oauth2/token/revoke', {
            method: 'post',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `token=${sd.access_token}&client_id=${config.website.client_id}&client_secret=${config.website.client_secret}`
        })
            .then(response => {
                sd = undefined;
                res.redirect('/');
            });
});

// Discord oauth
app.get('/auth', function (req, res, next) {
    const data = {
        client_id: config.website.client_id,
        client_secret: config.website.client_secret,
        grant_type: 'authorization_code',
        redirect_uri: unescape(config.website.redirect_uri),
        code: req.query.code,
        scope: 'guilds',
    };

    fetch('https://discordapp.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .then(res => res.json())
        .then(response => {
            req.session.discord = response;
            req.session.discord.expires_at = Date.now() + response.expires_in;
            res.redirect('/select');
        });
});

// Select a guild
app.get('/select', function (req, res, next) {
    if (!utils.isConnected(req.session.discord))
        res.redirect('/connect');
    else
        res.render('select');
});

// Change settings of selected guild
app.get('/guild/:guild', function (req, res, next) {
    if (!utils.isConnected(req.session.discord))
        res.redirect('/connect');
    else
        res.render('guild');
});

app.get('/guild', function (req, res, next) {
    if (utils.isConnected(req.session.discord))
        res.redirect('/select');
    else
        res.redirect('/connect');
});

// Send token
app.get('/token', function (req, res, next) {
    if (utils.isConnected(req.session.discord))
        res.send(req.session.discord.access_token);
    else
        res.send('null');
});


// Bot's api
app.get('/api', function (req, res, next) {
    res.render('api');
});

app.get('/api/in/:guild', function (req, res, next) {
    res.send(utils.isInGuild(connection, req.params.guild));
});

app.get('/api/setting/:guild/:setting', function (req, res, next) {
    res.send(utils.getOption(config, connection, req.params.guild, req.params.setting).toString());
});

app.post('/api/setting/:guild/:setting', function (req, res, next) {
    const value = req.body.value;

    // If value haven't changed
    if (utils.getOption(config, connection, req.params.guild, req.params.setting) == value) {

        res.status(200);
        res.send('Skipped');
        console.log('Old value: ' + utils.getOption(config, connection, req.params.guild, req.params.setting), 'New value: ' + value);
        console.log('Skipped ' + req.params.setting)
        return;

    } else {

        console.log('Old value: ' + utils.getOption(config, connection, req.params.guild, req.params.setting), 'New value: ' + value);
        console.log('Changing ' + req.params.setting)

        utils.checkGuildAccess(connection, req.params.guild, req.body.token)
            .then(() => {
                // Update database
                const result = connection.query(`INSERT INTO \`guild_options\` (guild, name, value) VALUES('${req.params.guild}', '${req.params.setting}', '${value}') ON DUPLICATE KEY UPDATE value='${value}'`);
                res.status(200);
                res.send('OK');
            })
            .catch((err) => {
                if (err != undefined && err.status != undefined)
                    res.status(err.status);
                res.send(err);
            });

    }
});

app.get('/api/alias/:guild', function (req, res, next) {
    const result = connection.query(`select command, alias from aliases where guild = '${req.params.guild}'`);
    res.send(JSON.stringify(result));
});

app.post('/api/alias/:guild', function (req, res, next) {
    const alias = req.body.alias;
    const command = req.body.command;
    console.log(req.body);

    utils.checkGuildAccess(connection, req.params.guild, req.body.token)
        .then(() => {
            // Update database
            const result = connection.query(`INSERT INTO \`aliases\` (guild, alias, command) VALUES('${req.params.guild}', '${alias}', '${command}') ON DUPLICATE KEY UPDATE command='${command}'`);
            res.status(200);
            res.send('OK');
        })
        .catch((err) => {
            if (err != undefined && err.status != undefined)
                res.status(err.status);
            res.send(err);
        });
});


// Public resources
app.get('/public/*', function (req, res, next) {
    res.sendFile(__dirname + '/public/' + req.params[0]);
});

app.listen(8082, function () {
    console.log('Running server on port 8082!');
});
