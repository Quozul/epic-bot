const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'help',
    description: 'Displays command usage.',
    usage: '',
    arg_type: 'none',
    execute(msg) {
        const client = msg.client;

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(utils.getTranslation(client, msg.guild, 'help.title'))
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription(utils.getTranslation(client, msg.guild, 'help.description'));

        for (const cmd of msg.client.commands.values())
            embed.addField(utils.getOption(msg.client, msg.guild, 'prefix') + cmd.name + ' ' + cmd.usage, cmd.description);

        embed.addField(utils.getTranslation(client, msg.guild, 'help.end_field_title'), utils.getTranslation(client, msg.guild, 'help.end_field_content'));

        if (msg.channel.type == 'text')
            msg.reply(utils.getTranslation(client, msg.guild, 'help.reply'));

        msg.author.send(embed);
    }
}