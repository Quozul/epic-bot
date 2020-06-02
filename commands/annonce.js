const Discord = require('discord.js');

module.exports = {
    name: 'annonce',
    description: 'Fait parler le bot.',
    usage: '<"titre"> <"contenu">',
    arg_type: 'quotes',
    execute(msg, args) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";
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