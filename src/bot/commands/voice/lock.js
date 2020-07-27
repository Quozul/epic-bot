const utils = require('../../utils');

module.exports = {
    name: 'lock',
    description: "Add a temporary limit to your voice room.",
    usage: '[amount]',
    arg_type: 'content',
    execute(msg, content) {
        const vc = msg.member.voice.channel

        if (!vc) throw utils.getTranslation(msg.client, msg.guild, 'system.no_voice');
        const results = msg.client.connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);

        if (!results.length != 0 && vc.userLimit != 0) throw utils.getTranslation(msg.client, msg.guild, 'lock.already_limited');

        let mbr_count = 0;
        if (content != undefined && !isNaN(parseInt(content)))
            mbr_count = parseInt(content);
        else
            mbr_count = vc.members.array().length;

        vc.setUserLimit(mbr_count).then(() => {
            msg.channel.send(utils.getTranslation(msg.client, msg.guild, 'lock.limit', vc.name, mbr_count));
        });

        msg.client.connection.query(`insert into locked_voice_channel(id) values ('${vc.id}')`);
    }
}