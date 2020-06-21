const utils = require('../../utils');

module.exports = {
    name: 'welcome_user',
    event: 'guildMemberAdd',
    description: "Greets new users.",
    execute(client, member) {

        member.guild.systemChannel.send(utils.getTranslation(member, 'system.greetings', member.id));

    }
}