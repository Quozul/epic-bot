const Discord = require('discord.js');
const utils = require('../../utils');

const settings = [
    { name: 'prefix', value: 'string' },
    { name: 'lang', value: 'string' },
    { name: 'command_cooldown', value: 'number' },
    { name: 'bodyguard', value: 'boolean' },
    { name: 'spam_protection', value: 'boolean' },
    { name: 'replies', value: 'boolean' },
]

module.exports = {
    name: 'config',
    description: 'Edit bot config for your guild.',
    usage: '<parameter> [value]',
    arg_type: 'args',
    execute(msg, args) {
        const client = msg.client;

        if (!msg.member.permissions.has('ADMINISTRATOR')) throw utils.getTranslation(client, msg.guild, 'system.no_permission_command');


        msg.channel.startTyping();


        if (args[0] == undefined) {


            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(utils.getTranslation(client, msg.guild, 'config.values'))
                .setFooter(msg.author.username, msg.author.avatarURL())
                .setTimestamp();

            for (const setting of settings) {
                embed.addField(
                    `\`${setting.name}\` (${setting.value})`,
                    utils.getTranslation(client, msg.guild, 'option.' + setting.name)
                    + '\n' +
                    utils.getTranslation(client, msg.guild, 'config.field', client.config[setting.name], utils.getOption(client, msg.guild, setting.name))
                );
            }

            msg.channel.send(embed);


        } else if (args[1] == undefined)


            msg.reply(utils.getTranslation(client, msg.guild, 'config.value_is', args[0], utils.getOption(client, msg.guild, args[0])));


        else {


            // client.connection.query(`select value from \`guild_options\` where guild = ${guild.id} and name = '${option}'`);
            const result = client.connection.query(`INSERT INTO \`guild_options\` (guild, name, value) VALUES('${msg.guild.id}', '${args[0]}', '${args[1]}') ON DUPLICATE KEY UPDATE value='${args[1]}'`);
            msg.reply(utils.getTranslation(client, msg.guild, 'config.changed', args[0], utils.getOption(client, msg.guild, args[0])));


        }


        msg.channel.stopTyping();
    }
}