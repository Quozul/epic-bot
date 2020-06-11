const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {
    name: 'boost',
    event: 'guildUpdate',
    description: "Displays a progress bar when the server gets boosted.",
    execute(client, oldGuild, newGuild) {
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
            .setTitle(utils.getTranslation(client, msg.guild, 'nitro.title'))
            // .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription('```[' + str + ']```');

        const boosters = newGuild.members.cache.filter((mbr) => mbr.premiumSinceTimestamp != null).sort((a, b) => a.premiumSinceTimestamp - b.premiumSinceTimestamp);

        if (boosters.array().length > 0) {
            str = '';
            boosters.forEach(booster => {
                str += utils.getTranslation(client, msg.guild, 'nitro.booster_since', booster.id, new Date(booster.premiumSinceTimestamp).toDateString());
            });

            embed.addField(utils.getTranslation(client, msg.guild, 'nitro.boosters'), str);
        } else
            embed.addField(utils.getTranslation(client, msg.guild, 'nitro.boosters'), utils.getTranslation(client, msg.guild, 'nitro.no_one'));

        newGuild.systemChannel.send(embed);
    }
}