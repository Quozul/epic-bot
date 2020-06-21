const ytdl = require('ytdl-core');

module.exports = {
    name: 'yt',
    description: 'Play a YouTube video in your voice channel.',
    usage: '<url>',
    arg_type: 'content',
    execute(msg, content) {
        if (msg.member.voice.channel == undefined) throw utils.getTranslation(msg.client, msg.guild, 'system.no_voice');
        if (content == '') throw utils.getTranslation(msg.client, msg.guild, 'yt.no_link');
        if (!ytdl.validateURL(content)) throw utils.getTranslation(msg.client, msg.guild, 'yt.invalid');


        msg.member.voice.channel.join().then(async (connection) => {
            const info = await ytdl.getBasicInfo(content);

            connection.play(await ytdl(content))
                .on('start', () => {
                    msg.reply(utils.getTranslation(msg.client, msg.guild, 'yt.playing', info.videoDetails.title));
                })

                .on('finish', () => {
                    connection.disconnect();
                });
        }).catch((err) => {
            throw err;
        });
    }
}