const utils = require('../utils');

module.exports = {
    name: 'delete_message',
    event: 'messageDelete',
    description: "Update score when message is deleted.",
    execute(client, msg) {

        if (msg.author == client.user) return;

        const isCommand = msg.content.startsWith(client.config.prefix) && msg.content.match(/[a-z]/);

        if (!isCommand) {
            // Log deletion to 'epic-logging' channel
            // msg.guild.channels.cache.find(channel => channel.name == 'epic-logging').send(`Un message de <@${msg.author.id}> à été supprimé du salon <#${msg.channel.id}>\n> ${msg.content}`);
            msg.guild.channels.cache.find(channel => channel.name == 'epic-logging').send(utils.getTranslation(client, msg.guild, 'system.message_deleted', msg.author.id, msg.channel.id, msg.content));

            // Removes 1 participation from the user
            utils.updateOrInsert(client, 'messages_sent', msg, -1);
        }

    }
}