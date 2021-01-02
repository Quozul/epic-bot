module.exports = {
    name: 'voice_time',
    event: 'voiceStateUpdate',
    description: "Log when user join or leave voice channel.",
    execute(client, oldMember, newMember) {
        /*
            serverDeaf: false,
            serverMute: false,
            selfDeaf: false,
            selfMute: false,
        */

        let joined = false, left = false;
        const user = oldMember.member.user;


        if (oldMember.channel == null && newMember.channel != null)
            joined = true; // joined voice

        /*if (oldMember.channel != null && newMember.channel != null)
            if (oldMember.channel == newMember.channel) { // same channel

                if (newMember.selfDeaf && !oldMember.selfDeaf)
                    left = true; // is deaf
                else if (!newMember.selfDeaf && oldMember.selfDeaf)
                    joined = true; // is no longer deaf

                if (newMember.selfMute && !oldMember.selfMute)
                    left = true; // is muted
                else if (!newMember.selfMute && oldMember.selfMute)
                    joined = true; // is no longer muted

            }*/
        // else if (oldMember.channel != newMember.channel) // switched channel

        if (oldMember.channel != null && newMember.channel == null)
            left = true; // left channel

        let action;
        if (joined == !left) action = joined;

        const date = new Date(Date.now()).format('%yyyy-%mm-%dd %hh:%mm:%ss');
        client.connection.query(`insert into \`time_spent_voice\` (user, guild, time, action) values (${oldMember.id}, ${oldMember.guild.id}, '${date}', ${action})`);
    }
}