const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const express = require('express');
const mysql = require('sync-mysql');
const utils = require('./utils');
const client = new Discord.Client();
const app = express();

const config = JSON.parse(fs.readFileSync('config.json'));
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

const mention_messages = JSON.parse(fs.readFileSync('react_on_mentions.json'));

// Load commands
const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commands) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Load events
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of events) {
    const event = require(`./events/${file}`);
    client.events.set(event.name, event);
}

// MySQL stuff
client.connection = new mysql({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setActivity(config.activity.value, { type: config.activity.type, url: config.activity.url }).then(presence => {
        console.log('Bot activity updated.');
    });
});

/**
 * Creates and send an help message to the member's dms
 * @param {*} msg 
 */
function helpCommand(msg) {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Liste des commandes')
        .setFooter(msg.author.username, msg.author.avatarURL())
        .setTimestamp()
        .setDescription('Liste des commandes disponibles.');

    for (const cmd of client.commands.values())
        embed.addField(config.prefix + cmd.name + ' ' + cmd.usage, cmd.description);

    embed.addField('Lire les instructions des commandes', '[] : facultatif\n<> : obligatoire');

    if (msg.channel.type == 'text')
        msg.reply('va voir tes messages privés 😉');

    msg.author.send(embed);
}

/**
 * Execute a command from the given message
 * @param {*} msg 
 */
function executeCommand(msg) {
    return new Promise((resolve, reject) => {
        const content = msg.content.substr(config.prefix.length, msg.content.length);
        const args = content.split(/ +/);
        const cmd = args.shift().toLowerCase();


        if (client.commands.has(cmd)) {

            const command = client.commands.get(cmd);

            try {
                if (command.arg_type == 'quotes')
                    command.execute(msg, utils.textInQuotes(content.substr(cmd.length, content.length)), client);
                else if (command.arg_type == 'content')
                    command.execute(msg, content.substr(cmd.length, content.length), client);
                else if (command.arg_type == 'none')
                    command.execute(msg, '', client);
                else
                    command.execute(msg, args, client);

                resolve();
            } catch (error) {
                if (error == null) reject(`Utilisation de la commande :\n> ${config.prefix}${cmd} ${command.usage}`);
                else reject(`Il y a eu une erreur dans l\'exécution de la commande !\n> ${error}`);
            }

        } else if (cmd == 'help') {
            helpCommand(msg);
            resolve();
        } else
            reject(`Command inconnue, \`${config.prefix}help\` pour obtenir la liste des commands.`);
    });
}

/**
 * Verify that the user didn't sent a command x seconds before
 * @param {*} msg 
 */
function spamVerification(msg, c, config) {
    return new Promise((resolve, reject) => {
        if (config.spam_protection) {
            const after_date = new Date(msg.createdAt.getTime() - config.command_cooldown * 1000);
            const before = msg.createdAt;

            const messages = msg.channel.messages.cache.filter((m) => after_date < m.createdAt && m.createdAt < before && m.author == msg.author && m.content == msg.content);
            const spam = messages.array().length > 0;

            if (spam) {

                const x = config.command_cooldown * 1000 - (before.getTime() - messages.last().createdAt.getTime());

                const a = msg.channel.messages.cache.filter((m) => after_date < m.createdAt && m.createdAt < before && m.author == client.user && m.content.match(c)).array().length > 0;

                reject([x, a]);

            }
            else resolve();
        }
        else resolve();
    });
}

function spamMessage(msg, d, content) {
    let x = d[0];

    if (!d[1]) {
        // Send a message with cooldown before next command and edits it
        msg.channel.send(`${content} ${Math.floor(x / 1000)}s`).then((rep) => {
            const i = setInterval(() => {
                x -= 1000;
                rep.edit(`${content} ${Math.floor(x / 1000)}s`);
            }, 1000);

            setTimeout(() => {
                rep.delete();
                clearInterval(i);
            }, x);
        });
    }

    msg.delete();
}

client.on('message', msg => {
    // If message is in dm or is not from a human, abort mission
    if (msg.author == client.user || msg.channel.type == 'dm') return;

    // Commands

    const isCommand = msg.content.startsWith(config.prefix) && msg.content.match(/[a-z]/);

    if (isCommand) {

        const content = `<@${msg.author.id}>, tu utilises trop de commandes rapidement, laisse-moi boire mon café :coffee: !`;
        spamVerification(msg, content, config)
            .then(() => {

                // Count executed commands then execute command
                utils.updateOrInsertBotInteractions(client, 'bot_interaction', msg, 1);
                executeCommand(msg).catch((error) => { msg.reply(error) });

            })
            .catch(d => spamMessage(msg, d, content));

    } else {

        const content = `<@${msg.author.id}>, tu envoies trop de messages rapidement !`;
        spamVerification(msg, content, config)
            .then(() => {

                // Random message when bot is mentionned
                if (msg.mentions.has(client.user))
                    msg.channel.send(mention_messages.random());

            })
            .catch(d => spamMessage(msg, d, content));

    }


    // Score calculation


    if (!isCommand) utils.updateOrInsert(client, 'messages_sent', msg, 1);


    // Moderation stuff


    // Remove innapropriate messages using bodyguard's api
    if (config.bodyguard.enabled && msg.content.match(/[a-zA-Z]/) && !utils.is_url(msg.content)) {
        utils.request('POST', { hostname: 'api.bodyguard.ai', path: '/1.0/moderation' }, `{"text":"${msg.content}"}`, {
            'Authorization': config.bodyguard.token,
            'Content-Type': 'application/json'
        }).then((body) => {
            if (JSON.parse(body).haineux) {
                msg.reply('ton message à été détecté comme innaproprié, il a été supprimé.');
                msg.delete();
            }
        });
    }


    // Execute custom events
    for (const event of client.events.filter(e => e.event === 'message').values())
        event.execute(message, client);
});

/**
 * Get response message to a command (basically finds the next message from the bot following a specified message)
 * @param {*} msg 
 */
function getBotResponse(msg) {
    return new Promise((resolve, reject) => {
        msg.channel.messages.fetch({ after: msg.id }).then((messages) => {
            Array.from(messages.values()).reverse().forEach(message => {
                if (message.author == client.user)
                    resolve(message);
            });

            reject();
        });
    });
}

client.on('messageUpdate', (old_message, msg) => {
    // Handles command modification
    if (msg.content.startsWith(config.prefix)) {

        executeCommand(msg)
            .then(() => {
                getBotResponse(msg).then(message => message.delete());
            })
            .catch((error) => {
                getBotResponse(msg).then(message => message.edit(`<@${msg.author.id}> ${error}`));
            });

    }
});

client.on('messageDelete', (msg) => {
    if (msg.author == client.user) return;

    const isCommand = msg.content.startsWith(config.prefix) && msg.content.match(/[a-z]/);

    if (!isCommand) {
        if (msg.author != client.user) {
            // Log deletion to 'epic-logging' channel
            msg.guild.channels.cache.find(channel => channel.name == 'epic-logging').send(`Un message de <@${msg.author.id}> à été supprimé du salon <#${msg.channel.id}>\n> ${msg.content}`);

            // Removes 1 participation from the user
            utils.updateOrInsert(client, 'messages_sent', msg, -1);
        }
    }
});

client.on('guildMemberAdd', (member) => {
    // Greets new members
    member.guild.systemChannel.send(`Bienvenue <@${member.id}> sur le serveur !`);
});

client.on('guildMemberRemove', (member) => {
    member.guild.systemChannel.send(`${member.user.username}#${member.user.discriminator} nous a quitté :sob:`);
});

client.on('voiceStateUpdate', (o, n) => {
    // Execute custom events
    for (const event of client.events.filter(e => e.event === 'voiceStateUpdate').values())
        event.execute(o, n, client);
});

client.on('guildUpdate', (o, n) => {
    // Execute custom events
    for (const event of client.events.filter(e => e.event === 'guildUpdate').values())
        event.execute(o, n, client);
});

client.login(config.token);




// Express stuff




/*app.set('view engine', 'ejs');

app.get('/', function (req, res, next) {
    res.render('index', { query: req.query });
});

app.listen(8082, function () {
    console.log('Running server on port 8082!');
});
*/