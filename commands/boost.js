const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {
    name: 'boost',
    description: 'Displays a progress bar of the server\'s nitro boost.',
    usage: '',
    arg_type: 'none',
    execute(msg) {
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
            .setTitle(utils.getTranslation(msg, 'nitro.title'))
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('```\n[' + str + ']\n```');

        const boosters = msg.guild.members.cache.filter((mbr) => mbr.premiumSinceTimestamp != null).sort((a, b) => a.premiumSinceTimestamp - b.premiumSinceTimestamp);

        if (boosters.array().length > 0) {
            str = '';
            boosters.forEach(booster => {
                str += utils.getTranslation(msg, 'nitro.booster_since', booster.id, new Date(booster.premiumSinceTimestamp).toDateString());
            });

            embed.addField(utils.getTranslation(msg, 'nitro.boosters'), str);
        } else
            embed.addField(utils.getTranslation(msg, 'nitro.boosters'), utils.getTranslation(msg, 'nitro.no_one'));

        msg.channel.send(embed);
    }
}