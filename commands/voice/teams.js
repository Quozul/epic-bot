const utils = require('../../utils');
const Discord = require('discord.js');

module.exports = {
    name: 'teams',
    description: "Make teams.",
    usage: '<team count> (everyone | voice [move users? (yes | no), default: no] | users <user mentions>... | roles <role mentions>...) ',
    arg_type: 'args',
    execute(msg, args) {
        let members;

        switch (args[1]) {
            case 'everyone':
                members = msg.guild.members.cache;

                break;

            case 'voice':
                const vc = msg.member.voice.channel;
                if (!vc) throw utils.getTranslation(msg.client, msg.guild, 'system.no_voice');

                members = vc.members;

                break;

            case 'users':
                members = msg.mentions.members;

                if (msg.mentions.members.array().length < 1) throw utils.getTranslation(msg.client, msg.guild, 'teams.no_user_mentions');

                break;

            case 'roles':
                const roles = msg.mentions.roles;

                if (roles.array().length == 0) throw utils.getTranslation(msg.client, msg.guild, 'teams.no_role_mentions');

                roles.array().forEach(role => {
                    if (members == undefined)
                        members = role.members;
                    else
                        members = members.concat(role.members);
                });

                break;

            default:
                throw null;
                break;
        }

        let teams = [];
        members = members.array().shuffle();
        const teamSize = members.length / args[0];

        members.forEach((member, index) => {
            const i = Math.floor(index / teamSize);
            if (teams[i] == undefined) teams[i] = [];

            teams[i].push(member);
        });

        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(utils.getTranslation(msg.client, msg.guild, 'teams.embed_title'))
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp();

        teams.forEach((team, key) => {
            let str = '';

            team.forEach(member => {
                str += `<@${member.id}> `;
            });

            embed.addField(
                utils.getTranslation(msg.client, msg.guild, 'teams.field_title', key + 1), str
            )
        });

        msg.channel.send(embed);
    }
}