const express = require('express');
const mysql = require('sync-mysql');
const fs = require('fs');
const app = express();
const session = require('express-session');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

// Load bot's config
const config = JSON.parse(fs.readFileSync('../config.json'));

// Connect to database
const connection = new mysql({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

app.set('view engine', 'ejs');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
    res.render('index');
});


// Button to connect to Discord oauth
app.get('/connect', function (req, res, next) {
    res.render('connect', { oauth_url: config.website.oauth_url });
});

// Discord oauth
app.get('/auth', function (req, res, next) {
    console.log(config.website.redirect_uri);
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
    res.render('select', { session: req.session.discord, fetch: fetch });
});

// Change settings of selected guild
app.get('/guild/:guild', function (req, res, next) {
    res.render('guild');
});

// Send token
app.get('/token', function (req, res, next) {
    console.log(req.session);
    if (req.session.discord != undefined)
        res.send(req.session.discord.access_token);
    else
        res.send('null');
});


function stringToValue(v) {
    if (v === 'false' || v === 'true')
        return v === 'true';
    else if (/^\d+$/.test(v))
        return parseInt(v);
    else
        return v;
}

/**
 * Check if the bot is in the specified guild
 * @param {*} guild Guild id
 */
function isInGuild(guild) {
    const result = connection.query(`select guild from messages_sent where guild = '${guild}'`);
    return result.length == 0 ? false : true;
}

/**
 * Check if the user is admin in the guild and if the bot is in the guild
 * @param {*} guild Guild id
 * @param {*} token Discord OAuth access token
 */
function checkGuildAccess(guild, token) {
    return new Promise((resolve, reject) => {
        if (token == 'null' || token == undefined || token == null)
            reject();
        else
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            })
                .then(response => {
                    if (response.status != 200)
                        reject(response);
                    else
                        response.json().then((response) => {
                            response = response.filter((g) => g.id == guild && (g.permissions & 0x8) == 8);
                            if (response.length > 0)
                                // Verify if the bot is in the guild
                                if (isInGuild(guild))
                                    resolve();
                                else
                                    reject();
                            else
                                reject();
                        });
                });
    });
}


// Bot's api
app.get('/api', function (req, res, next) {
    res.render('api');
});

app.get('/api/in/:guild', function (req, res, next) {
    res.send(isInGuild(req.params.guild));
});

app.get('/api/setting/:guild/:setting', function (req, res, next) {
    const result = connection.query(`select value from \`guild_options\` where guild = ${req.params.guild} and name = '${req.params.setting}'`)[0];

    if (result != undefined)
        res.send(JSON.stringify(stringToValue(result.value)));
    else if (result == undefined && config[req.params.setting] != undefined)
        res.send(JSON.stringify(config[req.params.setting]));
    else
        res.send(JSON.stringify(null));
});

app.post('/api/setting/:guild/:setting', function (req, res, next) {
    const token = req.body.token;
    checkGuildAccess(req.params.guild, req.body.token)
        .then(() => {
            // Update database
            const value = req.body.value;
            const result = connection.query(`INSERT INTO \`guild_options\` (guild, name, value) VALUES('${req.params.guild}', '${req.params.setting}', '${value}') ON DUPLICATE KEY UPDATE value='${value}'`);
            res.status(200);
            res.send('OK');
        })
        .catch((err) => {
            res.status(401);
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
