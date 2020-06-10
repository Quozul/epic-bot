const ytdl = require('ytdl-core');

module.exports = {
    name: 'yt',
    description: 'Joue une vidéo YouTube.',
    usage: '<url>',
    arg_type: 'content',
    execute(msg, content) {
        if (msg.member.voice.channel == undefined) throw 'Vous devez être dans un salon vocal pour exécuter cette commande.';
        if (content == '') throw 'Merci de préciser un lien de vidéo YouTube.';
        if (!ytdl.validateURL(content)) throw 'L\'URL n\'est pas valide.';


        msg.member.voice.channel.join().then(async (connection) => {
            const info = await ytdl.getBasicInfo(content);

            connection.play(await ytdl(content))
                .on('start', () => {
                    msg.reply(`__${info.videoDetails.title}__ en cours de lecture...`);
                })

                .on('finish', () => {
                    connection.disconnect();
                });
        }).catch((err) => {
            throw err;
        });
    }
}