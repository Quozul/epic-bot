const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'podium',
    description: "Displays active members.",
    usage: '[days] [member amount]',
    arg_type: 'args',
    execute(msg, args) {
        msg.channel.startTyping();
        const client = msg.client;

        if (args[0] != undefined && isNaN(args[0]) || args[1] != undefined && isNaN(args[1])) throw utils.getTranslation(client, msg.guild, 'podium.value_not_numeric');

        if (args[0] == undefined) args[0] = 7;

        const limit = args[1] != undefined ? args[1] : 5;
        const after = new Date(new Date().getTime() - args[0] * 86400000).format('%yyyy-%mm-%dd');

        const result = msg.client.connection.query(`select user, sum(amount) as sum, count(date) as active_days from messages_sent where date in (select * from (select date from messages_sent where date > '${after}' group by date order by date desc) as t) and guild = '${msg.guild.id}' group by user order by sum desc limit ${limit};`);

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(utils.getTranslation(client, msg.guild, 'podium.title'))
            .setDescription(utils.getTranslation(client, msg.guild, 'podium.description', limit, args[0]))
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp();

        const members = msg.guild.members.cache;
        result.forEach(row => {
            const member = msg.guild.members.cache.get(row.user);
            embed.addField(
                member != undefined ? `${member.user.username}#${member.user.discriminator}` : 'Unknown',
                utils.getTranslation(
                    client, msg.guild, 'podium.field',
                    row.sum, row.active_days, (row.active_days / args[0] * 100).toFixed(0), (row.sum / args[0]).toFixed(2)
                )
            );
        });

        msg.channel.send(embed)
            .then(() => {
                msg.channel.stopTyping();
            })
            .catch(err => console.log(err));
    }
}