const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const mysql = require('sync-mysql');
const utils = require('./utils');
const client = new Discord.Client();

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
var connection = new mysql({
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

function executeCommand(msg) {
    return new Promise((resolve, reject) => {
        const content = msg.content.substr(config.prefix.length, msg.content.length);
        const args = content.split(/ +/);
        const cmd = args.shift().toLowerCase();


        if (client.commands.has(cmd)) {

            const command = client.commands.get(cmd);

            try {
                if (command.arg_type == 'quotes')
                    command.execute(msg, utils.textInQuotes(content.substr(cmd.length, content.length)), connection);
                else if (command.arg_type == 'content')
                    command.execute(msg, content.substr(cmd.length, content.length), connection);
                else if (command.arg_type == 'none')
                    command.execute(msg, '', connection);
                else
                    command.execute(msg, args, connection);

                resolve();
            } catch (error) {
                let c;

                if (error == null) c = `Utilisation de la commande :\n> ${config.prefix}${cmd} ${command.usage}`;
                else c = `Il y a eu une erreur dans l\'exécution de la commande !\n> ${error}`;

                reject(c);
            }

        } else if (cmd == 'help') {
            helpCommand(msg);
            resolve();
        } else
            reject(`Command inconnue, \`${config.prefix}help\` pour obtenir la liste des commands.`);
    });
}

function spamVerification(msg) {
    return new Promise((resolve, reject) => {
        const after_date = msg.createdAt.setSeconds(msg.createdAt.getSeconds() - config.command_cooldown);

        msg.channel.messages.fetch({ before: msg.id }).then((messages) => {
            for (const message of messages.values())
                if (message.createdAt > after_date && message.author == msg.author && msg.content.startsWith(config.prefix) && msg.content.match(/[a-z]/))
                    reject(new Date(message.createdAt.getTime() - after_date).getTime());

            resolve();
        });
    });
}

client.on('message', msg => {
    if (msg.author == client.user || msg.channel.type == 'dm') return;


    // Commands

    const isCommand = msg.content.startsWith(config.prefix) && msg.content.match(/[a-z]/);
    if (isCommand)
        spamVerification(msg)
            .then(() => executeCommand(msg).catch((error) => { msg.reply(error) }))
            .catch((x) => {
                msg.reply(`vous utilisez trop de commandes rapidement ! ${Math.floor(x / 1000)}s`).then((rep) => {
                    const i = setInterval(() => {
                        x -= 1000;
                        rep.edit(`<@${msg.author.id}>, vous utilisez trop de commandes rapidement ! ${Math.floor(x / 1000)}s`)
                    }, 1000);

                    setTimeout(() => {
                        rep.delete();
                        clearInterval(i);
                    }, x);
                });

                msg.delete();
            });
    else if (msg.mentions.has(client.user))
        msg.channel.send(utils.array_random(mention_messages));


    // Score calculation


    if (!isCommand) utils.updateOrInsert(connection, 'messages_sent', msg.author.id, msg.guild.id, 1);


    // Moderation stuff


    if (config.bodyguard.enabled) {
        const options = {
            hostname: 'api.bodyguard.ai',
            port: 443,
            path: '/1.0/moderation',
            method: 'POST',
            headers: {
                'Authorization': config.bodyguard.token,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, function (res) {
            let body = '';

            res.on('data', function (chunk) {
                body = body + chunk;
            });

            res.on('end', function () {
                if (JSON.parse(body).haineux) {
                    msg.reply('ton message à été détecté comme innaproprié, il a été supprimé.');
                    msg.delete();
                }
            });
        });

        req.write(`{"text":"${msg.content}"}`);
        req.end();

        req.on('error', function (e) {
            console.error(e);
        });
    }
});

function getBotResponse(msg) {
    return new Promise((resolve, reject) => {
        msg.channel.messages.fetch({ after: msg.id }).then((messages) => {
            Array.from(messages.values()).reverse().forEach(message => {
                console.log(message.content);
                if (message.author == client.user && message.mentions.has(msg.author))
                    resolve(message);
            });

            reject();
        });
    });
}

client.on('messageUpdate', (old_message, msg) => {
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
        if (msg.author != client.user)
            msg.guild.channels.cache.find(channel => channel.name == 'epic-logging').send(`Un message de <@${msg.author.id}> à été supprimé du salon <#${msg.channel.id}>\n> ${msg.content}`);
        utils.updateOrInsert(connection, 'messages_sent', msg.author.id, msg.guild.id, -1);
    }
});

client.on('guildMemberAdd', (member) => {
    member.guild.systemChannel.send(`Bienvenue <@${member.id}> sur le serveur !`);
});

client.on('guildMemberRemove', (member) => {
    member.guild.systemChannel.send(`<@${member.id}> nous a quitté :sob:`);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    for (const event of client.events.filter(e => e.event === 'voiceStateUpdate').values())
        event.execute(oldMember, newMember, connection);
})

client.login(config.token);