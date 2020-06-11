const utils = require('../utils');

/**
 * Verify that the user didn't sent a command x seconds before
 * @param {Message} msg 
 */
function spamVerification(msg, c, client) {
    return new Promise((resolve, reject) => {
        if (client.config.spam_protection) {
            const after_date = new Date(msg.createdAt.getTime() - client.config.command_cooldown * 1000);
            const before = msg.createdAt;

            const messages = msg.channel.messages.cache.filter((m) => after_date < m.createdAt && m.createdAt < before && m.author == msg.author && m.content == msg.content);
            const spam = messages.array().length > 0;

            if (spam) {

                const x = client.config.command_cooldown * 1000 - (before.getTime() - messages.last().createdAt.getTime());
                const a = msg.channel.messages.cache.filter((m) => after_date < m.createdAt && m.createdAt < before && m.author == client.user && m.content.match(c)).array().length > 0;
                reject([x, a]);

            }
            else resolve();
        }
        else resolve();
    });
}

/**
 * Send anti-spam message
 * @param {Message} msg 
 * @param {Array} d i = 0: {Number} time remaining, i = 1: {Boolean} warning already sent
 * @param {String} content 
 */
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

module.exports = {
    name: 'commands',
    event: 'message',
    description: "Executes commands.",
    execute(client, msg) {


        // If message is in dm or is not from a human, abort mission
        if (msg.author == client.user || msg.channel.type == 'dm') return;

        // Commands

        const isCommand = msg.content.startsWith(client.config.prefix) && msg.content.match(/[a-z]/);

        if (isCommand) {

            const content = utils.getTranslation(client, msg.guild, 'system.fast_commands', msg.author.id);
            spamVerification(msg, content, client)
                .then(() => {

                    // Count executed commands then execute command
                    utils.updateOrInsertBotInteractions(client, 'bot_interaction', msg, 1);
                    utils.executeCommand(client, msg).catch((error) => {
                        msg.reply(error)
                    });

                })
                .catch(d => spamMessage(msg, d, content));

        } else {

            const content = utils.getTranslation(client, msg.guild, 'system.fast_messages', msg.author.id);
            spamVerification(msg, content, client)
                .then(() => {

                    // Random message when bot is mentionned
                    if (msg.mentions.has(client.user))
                        msg.channel.send(client.mentionReplies.random());

                })
                .catch(d => spamMessage(msg, d, content));

        }

    }
}