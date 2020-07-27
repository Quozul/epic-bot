const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'announcement',
    description: 'Create an embed.',
    usage: '<"title"> <"content">',
    arg_type: 'quotes',
    execute(msg, args) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw utils.getTranslation(client, msg.guild, 'system.no_permission_command');
        if (args.length < 2) throw null;
        msg.delete();

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(args[0])
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription(args[1]);

        msg.channel.send(embed).catch(err => console.log(err));
    }
}