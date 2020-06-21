const utils = require('../utils');

module.exports = {
    name: 'bodyguard',
    event: 'message',
    description: "Remove innapropriate messages using Bodyguard's api (French only).",
    execute(client, msg) {
        if (client.config.bodyguard && client.config.lang != 'fr') return;

        // Remove innapropriate messages using bodyguard's api
        if (client.config.bodyguard.enabled && msg.content.match(/[a-zA-Z]/) && !msg.content.isUrl()) {
            utils.request('POST', { hostname: 'api.bodyguard.ai', path: '/1.0/moderation' }, `{"text":"${msg.content}"}`, {
                'Authorization': config.bodyguard.token,
                'Content-Type': 'application/json'
            }).then((body) => {
                if (JSON.parse(body).haineux) {
                    msg.reply('ton message à été détecté comme innaproprié, il a été supprimé.');
                    msg.delete();
                }
            });
        }

    }
}