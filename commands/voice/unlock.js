const utils = require('../../utils');

module.exports = {
    name: 'unlock',
    description: "Removes limit on locked voice channel.",
    usage: '',
    arg_type: 'none',
    execute(msg) {
        const vc = msg.member.voice.channel

        if (!vc) throw utils.getTranslation(msg.client, msg.guild, 'system.no_voice');
        if (vc.userLimit == 0) throw utils.getTranslation(msg.client, msg.guild, 'lock.no_limit');

        const results = msg.client.connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);
        if (results.length == 0) throw utils.getTranslation(msg.client, msg.guild, 'lock.cant_remove');

        vc.setUserLimit(0).then(() => {
            msg.channel.send(utils.getTranslation(msg.client, msg.guild, 'lock.removed_limit', vc.name));

            msg.client.connection.query(`delete from locked_voice_channel where id = '${vc.id}'`);
        });
    }
}