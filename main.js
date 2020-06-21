const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const express = require('express');
const mysql = require('sync-mysql');
const utils = require('./utils');
const client = new Discord.Client();
const app = express();

client.config = JSON.parse(fs.readFileSync('config.json'));
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.langs = new Discord.Collection();

// Load commands
const commands = utils.rreadDirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commands) {
    const command = require(file);
    client.commands.set(command.name, command);
}

// Load events
const events = utils.rreadDirSync('./events').filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(file);
    client.events.set(file, event);
}

// Load languages
const langs = fs.readdirSync('./langs').filter(file => file.endsWith('.json'));
for (const file of langs) {
    client.langs.set(file.replace('.json', ''), JSON.parse(fs.readFileSync(`./langs/${file}`)));
}

// MySQL stuff
client.connection = new mysql({
    host: client.config.mysql.host,
    user: client.config.mysql.user,
    password: client.config.mysql.password,
    database: client.config.mysql.database
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setActivity(client.config.activity.value, { type: client.config.activity.type, url: client.config.activity.url }).then(presence => {
        console.log('Bot activity updated.');
    });
});

// const events = ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate', 'debug', 'emojiCreate', 'emojiDelete', 'emojiUpdate', 'error', 'guildBanAdd', 'guildBanRemove', 'guildCreate', 'guildDelete', 'guildIntegrationsUpdate', 'guildMemberAdd', 'guildMemberRemove', 'guildMembersChunk', 'guildMemberSpeaking', 'guildMemberUpdate', 'guildUnavailable', 'guildUpdate', 'invalidated', 'inviteCreate', 'inviteDelete', 'message', 'messageDelete', 'messageDeleteBulk', 'messageReactionAdd', 'messageReactionRemove', 'messageReactionRemoveAll', 'messageReactionRemoveEmoji', 'messageUpdate', 'presenceUpdate', 'rateLimit', 'ready', 'roleCreate', 'roleDelete', 'roleUpdate', 'shardDisconnect', 'shardError', 'shardReady', 'shardReconnecting', 'shardResume', 'typingStart', 'userUpdate', 'voiceStateUpdate', 'warn', 'webhookUpdate'];
const clientEvents = ['message', 'guildUpdate', 'voiceStateUpdate', 'guildMemberAdd', 'guildMemberRemove', 'messageDelete', 'messageUpdate'];

for (const ev of clientEvents) {
    client.on(ev, (...v) => {
        // Execute custom events
        for (const event of client.events.filter(e => e.event === ev).values())
            try {
                event.execute(client, ...v);
            } catch (error) {
                console.log(`Il y a eu une erreur dans l\'exécution de l'événement \`${event.name}\` !\n> ${error}`)
            }
    });
}

client.login(client.config.token);




// Express stuff




/*app.set('view engine', 'ejs');

app.get('/', function (req, res, next) {
    res.render('index', { query: req.query });
});

app.listen(8082, function () {
    console.log('Running server on port 8082!');
});
*/