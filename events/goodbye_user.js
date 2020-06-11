module.exports = {
    name: 'goodby_user',
    event: 'guildMemberRemove',
    description: "Sadness...",
    execute(client, member) {

        member.guild.systemChannel.send(utils.getTranslation(client, msg.guild, 'system.message_deleted', member.user.username, member.user.discriminator));

    }
}