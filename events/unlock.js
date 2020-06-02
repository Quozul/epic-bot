module.exports = {
    name: 'unlock',
    event: 'voiceStateUpdate',
    description: "Restitue l'accès à un channel vocal bloqué.",
    execute(oldMember, newMember, connection) {
        const vc = oldMember.channel;
        if (vc == null) return;

        const results = connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);

        if (results.length > 0)
            vc.setUserLimit(0).then(() => {
                connection.query(`delete from locked_voice_channel where id = '${vc.id}'`);
            });
    }
}