module.exports = {
    name: 'welcome_user',
    event: 'guildMemberAdd',
    description: "Greets new users.",
    execute(client, member) {

        member.guild.systemChannel.send(utils.getTranslation(client, msg.guild, 'system.greetings', member.id));

    }
}