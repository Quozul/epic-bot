module.exports = {
    name: 'unlock',
    event: 'voiceStateUpdate',
    description: "Removes limit on locked voice channel.",
    execute(client, oldMember, newMember) {
        const vc = oldMember.channel;
        if (vc == null) return;

        const results = client.connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);

        if (results.length > 0)
            vc.setUserLimit(0).then(() => {
                client.connection.query(`delete from locked_voice_channel where id = '${vc.id}'`);
            });
    }
}