const Discord = require('discord.js');

module.exports = {
    name: 'whois',
    description: 'Affiche des informations sur un utilisateur donné.',
    usage: '[mention d\'utilisateur]',
    arg_type: 'none',
    execute(msg, content, client) {
        msg.channel.startTyping();

        let user;

        if (msg.mentions.users.size == 1) user = msg.mentions.users.first();
        else if (!msg.mentions.users.size) user = msg.author;
        else throw null;

        const member = msg.guild.member(user);
        const result = client.connection.query(`select sum(amount) as sum, count(date) as active_days from messages_sent where user = '${member.user.id}' and guild = '${msg.guild.id}';`);

        const embed = new Discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(`${user.username}#${user.discriminator}`)
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('Informations sur l\'utilisateur.')
            .setThumbnail(user.displayAvatarURL())

            .addFields(
                { name: 'ID', value: user.id },
                { name: 'Roles', value: member.roles.cache.array().join(' ') },
                { name: 'Création du compte', value: user.createdAt.toDateString() },
                { name: 'A rejoint le serveur', value: member.joinedAt.toDateString() },
                { name: 'Messages envoyés', value: result[0].sum, inline: true },
                { name: 'Jours d\'activité', value: result[0].active_days, inline: true },
            );

        msg.channel.send(embed)
            .then(() => {
                msg.channel.stopTyping();
            })
            .catch(err => console.log(err));
    }
}