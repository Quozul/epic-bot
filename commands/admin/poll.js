const Discord = require('discord.js');
const utils = require('../../utils');
const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    name: 'poll',
    description: 'Create a poll.',
    usage: '["question"] <"answer 1">...',
    arg_type: 'quotes',
    execute(msg, args) {
        const client = msg.client;

        if (!msg.member.permissions.has('ADMINISTRATOR')) throw utils.getTranslation(client, msg.guild, 'system.no_permission_command');
        if (args.length < 1 || args[0] == '') throw null;
        else if (args.length == 2) throw utils.getTranslation(client, msg.guild, 'poll.invalid_responses');

        const e = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(utils.getTranslation(client, msg.guild, 'poll.title', msg.author.username))
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription(args[0])

        if (args.length > 1) {
            for (let i = 1; i < args.length; i++)
                e.addField(
                    emojis[i - 1],
                    args[i], true
                );

            msg.channel.send(e).then(async m => {
                for (let i = 1; i < args.length; i++)
                    await m.react(
                        emojis[i - 1]
                    );
            });
        } else {
            e.addField('✔', utils.getTranslation(client, msg.guild, 'poll.default_yes'), true);
            e.addField('❌', utils.getTranslation(client, msg.guild, 'poll.default_no'), true);

            msg.channel.send(e).then(async m => {
                await m.react('✔');
                await m.react('❌');
            });
        }
    }
}