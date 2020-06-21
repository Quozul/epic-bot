const utils = require('../../utils');

module.exports = {
    name: 'goodby_user',
    event: 'guildMemberRemove',
    description: "Sadness...",
    execute(client, member) {

        member.guild.systemChannel.send(utils.getTranslation(member, 'system.goodbyes', member.user.username, member.user.discriminator));

    }
}