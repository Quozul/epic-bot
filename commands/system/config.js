const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'config',
    description: 'Edit bot config for your guild.',
    usage: '<parameter> [value]',
    arg_type: 'args',
    execute(msg, args) {
        const client = msg.client;

        if (!msg.member.permissions.has('ADMINISTRATOR')) throw utils.getTranslation(client, msg.guild, 'system.no_permission_command');

        if (args[1] == undefined)
            msg.reply(utils.getTranslation(client, msg.guild, 'system.config_value_is', args[0], utils.getOption(client, msg.guild, args[0])));
        else {
            // client.connection.query(`select value from \`guild_options\` where guild = ${guild.id} and name = '${option}'`);
            const result = client.connection.query(`INSERT INTO \`guild_options\` (guild, name, value) VALUES('${msg.guild.id}', '${args[0]}', '${args[1]}') ON DUPLICATE KEY UPDATE value='${args[1]}'`);
            console.log(result);
            msg.reply(utils.getTranslation(client, msg.guild, 'system.config_changed', args[0], utils.getOption(client, msg.guild, args[0])));
        }
    }
}