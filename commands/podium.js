const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {
    name: 'podium',
    description: "Affiche un podium des membres actifs.",
    usage: '[jours] [membres]',
    arg_type: 'args',
    execute(msg, args, client) {
        msg.channel.startTyping();

        if (args[0] == undefined) args[0] = 7;

        const limit = args[1] != undefined ? args[1] : 5;
        const after = new Date(new Date().getTime() - args[0] * 86400000).format('%yyyy-%mm-%dd');

        const result = client.connection.query(`select user, sum(amount) as sum, count(date) as active_days from messages_sent where date in (select * from (select date from messages_sent where date > '${after}' group by date order by date desc) as t) and guild = '${msg.guild.id}' group by user order by sum desc limit ${limit};`);

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Podium d\'activité du serveur')
            .setDescription(`Podium des ${limit} utilisateurs les plus actifs sur les ${args[0]} derniers jours`)
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp();

        const members = msg.guild.members.cache;
        result.forEach(row => {
            const member = msg.guild.members.cache.get(row.user);
            embed.addField(member != undefined ? `${member.user.username}#${member.user.discriminator}` : 'Unknown', `${row.sum} messages envoyés sur ${row.active_days} jours actifs (${(row.active_days / args[0] * 100).toFixed(0)}%).\nMoyenne de ${(row.sum / args[0]).toFixed(2)} messages par jours.`);
        });

        msg.channel.send(embed)
            .then(() => {
                msg.channel.stopTyping();
            })
            .catch(err => console.log(err));
    }
}