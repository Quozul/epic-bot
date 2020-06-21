const utils = require('../../utils');

/**
 * Get response message to a command (basically finds the next message from the bot following a specified message)
 * @param {*} msg 
 */
function getBotResponse(client, msg) {
    return new Promise((resolve, reject) => {
        msg.channel.messages.fetch({ after: msg.id }).then((messages) => {
            Array.from(messages.values()).reverse().forEach(message => {
                if (message.author == client.user)
                    resolve(message);
            });

            reject();
        });
    });
}

module.exports = {
    name: 'edit_commands',
    event: 'messageUpdate',
    description: "Update messages when commands are edited.",
    execute(client, old_msg, msg) {

        if (msg.author == client.user) return;

        // Handles command modification
        if (msg.content.startsWith(client.config.prefix)) {

            utils.executeCommand(client, msg)
                .then(() => {
                    getBotResponse(client, msg).then(message => message.delete());
                })
                .catch((error) => {
                    getBotResponse(client, msg).then(message => message.edit(`<@${msg.author.id}>, ${error}`));
                });

        }

    }
}