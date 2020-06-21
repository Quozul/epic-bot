const utils = require('../../utils');

module.exports = {
    name: 'score',
    event: 'message',
    description: "Update score and activity roles.",
    execute(client, msg) {

        // If message is in dm or is not from a human, abort mission
        if (msg.author == client.user || msg.channel.type == 'dm') return;

        const isCommand = msg.content.startsWith(client.config.prefix) && msg.content.match(/[a-z]/);
        if (!isCommand) {
            // Update score
            utils.updateOrInsert(client, 'messages_sent', msg, 1);

            // Get score for last 7 days
            const after = new Date(new Date().getTime() - 7 * 86400000).format('%yyyy-%mm-%dd');
            const result = client.connection.query(`select user, sum(amount) as sum, count(date) as active_days from messages_sent where date in (select * from (select date from messages_sent where date > '${after}' group by date order by date desc) as t) and guild = '${msg.guild.id}' and user = '${msg.author.id}';`)[0];

            // TOTO: Update user's roles
            // Get roles configured by server's owner from database
            // Update user's roles according to database's data
        }

    }
}