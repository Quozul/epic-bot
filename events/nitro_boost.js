const Discord = require('discord.js');

module.exports = {
    name: 'boost',
    event: 'guildUpdate',
    description: "Affiche une barre de progression lorsque le serveur vient d'être boosté.",
    execute(oldGuild, newGuild, client) {
        if (oldGuild.premiumSubscriptionCount != newGuild.premiumSubscriptionCount) return;

        const tiers = ['1️⃣', '2️⃣', '3️⃣'];
        let j = 0;

        const count = Math.min(newGuild.premiumSubscriptionCount, 31);

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
            // .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('```[' + str + ']```');

        const boosters = newGuild.members.cache.filter((mbr) => mbr.premiumSinceTimestamp != null).sort((a, b) => a.premiumSinceTimestamp - b.premiumSinceTimestamp);

        if (boosters.array().length > 0) {
            str = '';
            boosters.forEach(booster => {
                str += `<@${booster.id}> depuis ${new Date(booster.premiumSinceTimestamp).toDateString()}\n`;
            });

            embed.addField('Boosteurs', str);
        } else
            embed.addField('Boosteurs', 'Personne n\'a boosté le serveur :cry:');

        newGuild.systemChannel.send(embed);
    }
}