const utils = require('../../utils');

module.exports = {
    name: 'clear',
    description: 'Delete x messages from a channel.',
    usage: '<amount>',
    arg_type: 'content',
    execute(msg, content) {
        const client = msg.client;

        if (!msg.member.permissions.has('ADMINISTRATOR')) throw utils.getTranslation(client, msg.guild, 'system.no_permission_command');

        const i = parseInt(content);

        if (content == undefined)
            throw utils.getTranslation(client, msg.guild, 'clear.quantity');
        else if (isNaN(i))
            throw utils.getTranslation(client, msg.guild, 'clear.numeric');
        else if (1 > i || i > 100)
            throw utils.getTranslation(client, msg.guild, 'clear.range');
        else {
            msg.channel.bulkDelete(Math.min(i + 1, 100)).then(() => {
                msg.reply(utils.getTranslation(client, msg.guild, 'clear.deleted', i));
            });
        }
    }
}