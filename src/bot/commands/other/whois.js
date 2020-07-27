const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'whois',
    description: 'Displays information about a given user.',
    usage: '[user mention]',
    arg_type: 'none',
    execute(msg) {
        msg.channel.startTyping();

        let user;

        if (msg.mentions.users.size == 1) user = msg.mentions.users.first();
        else if (!msg.mentions.users.size) user = msg.author;
        else throw null;

        const member = msg.guild.member(user);
        const result = msg.client.connection.query(`select sum(amount) as sum, count(date) as active_days from messages_sent where user = '${member.user.id}' and guild = '${msg.guild.id}';`);

        const embed = new Discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`${user.username}#${user.discriminator}`)
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription(utils.getTranslation(msg.client, msg.guild, 'whois.description'))
            .setThumbnail(user.displayAvatarURL())

            .addFields(
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.id'), value: user.id },
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.roles'), value: member.roles.cache.array().join(' ') },
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.account_creation'), value: user.createdAt.toDateString() },
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.server_joined'), value: member.joinedAt.toDateString() },
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.messages_sent'), value: result[0].sum, inline: true },
                { name: utils.getTranslation(msg.client, msg.guild, 'whois.active_days'), value: result[0].active_days, inline: true },
            );

        msg.channel.send(embed)
            .then(() => {
                msg.channel.stopTyping();
            })
            .catch(err => console.log(err));
    }
}