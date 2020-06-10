const Discord = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'Quitte le salon vocal rejoint.',
    usage: '',
    arg_type: 'none',
    execute(msg, content, client) {
        const connections = client.voice.connections.filter((c) => c.channel.guild == msg.channel.guild);

        if (connections.array().length == 0) throw "Je ne suis dans aucun salon vocal";

        connections.forEach((connection) => {
            connection.disconnect();
        });
    }
}