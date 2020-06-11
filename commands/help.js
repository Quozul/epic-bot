const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes ainsi que leur utilisation.',
    usage: '',
    arg_type: 'none',
    execute(msg, args, client) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Liste des commandes')
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('Liste des commandes disponibles.');

        for (const cmd of client.commands.values())
            embed.addField(client.config.prefix + cmd.name + ' ' + cmd.usage, cmd.description);

        embed.addField('Lire les instructions des commandes', '[] : facultatif\n<> : obligatoire');

        if (msg.channel.type == 'text')
            msg.reply('va voir tes messages privés 😉');

        msg.author.send(embed);
    }
}