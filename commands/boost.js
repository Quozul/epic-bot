const Discord = require('discord.js');

module.exports = {
    name: 'boost',
    description: 'Affiche la progression du boost nitro sur le serveur.',
    usage: '',
    arg_type: 'none',
    execute(msg, content, client) {
        const tiers = ['1️⃣', '2️⃣', '3️⃣'];
        let j = 0;

        const count = Math.min(msg.guild.premiumSubscriptionCount, 31);

        let str = '';
        for (let i = 0; i < 32; i++) {
            switch (i) {
                case 2:
                case 15:
                case 30:
                    str += tiers[j++];
                    break;

                default:
                    if (i > count) str += '-';
                    else if (i == count) str += '>';
                    else str += '=';
                    break;
            }
        }

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Progression du boost nitro')
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('`[' + str + ']`');

        msg.channel.send(embed);
    }
}