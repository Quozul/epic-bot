const utils = require('../../utils');

module.exports = {
    name: 'say',
    description: 'Fait parler le bot.',
    usage: '<message>',
    arg_type: 'content',
    execute(msg, content) {
        if (content.length == 0) throw utils.getTranslation(msg.client, msg.guild, 'say.no_content');
        msg.delete();
        msg.channel.send(content);
    }
}