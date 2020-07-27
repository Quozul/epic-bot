const utils = require('../utils');

module.exports = {
    name: 'bodyguard',
    event: 'message',
    description: "Remove innapropriate messages using Bodyguard's api (French only).",
    execute(client, msg) {
        if (utils.getOption(client, msg.guild, 'lang') != 'fr') return;

        // Remove innapropriate messages using bodyguard's api
        if (utils.getOption(client, msg.guild, 'bodyguard') && msg.content.match(/[a-zA-Z]/) && !msg.content.isUrl()) {
            utils.request('POST', { hostname: 'api.bodyguard.ai', path: '/1.0/moderation' }, `{"text":"${msg.content}"}`, {
                'Authorization': client.config.bodyguard_token,
                'Content-Type': 'application/json'
            }).then((body) => {
                if (JSON.parse(body).haineux) {
                    msg.reply('ton message à été détecté comme innaproprié, il a été supprimé.');
                    msg.delete();
                }
            }).catch((err) => {
                console.log(err);
            });
        }

    }
}