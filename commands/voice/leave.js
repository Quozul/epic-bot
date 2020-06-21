const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'leave',
    description: 'Leave the current voice channel.',
    usage: '',
    arg_type: 'none',
    execute(msg) {
        const connections = msg.client.voice.connections.filter((c) => c.channel.guild == msg.channel.guild);

        if (connections.array().length == 0) throw utils.getTranslation(msg.client, msg.guild, 'leave.no_voice');

        connections.forEach((connection) => {
            connection.disconnect();
        });
    }
}