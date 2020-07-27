const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'reload',
    description: 'Recharge les commandes (ne peut pas décharger des commandes/événements).',
    usage: '<(commands|events|config|all)>',
    arg_type: 'args',
    execute(msg, args, client) {
        throw "Command broken.";
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";
        if (!['commands', 'events', 'config', 'all'].includes(args[0])) throw null;

        // Load config
        if (args[0] == 'config' || args[0] == 'all') {
            msg.client.config = JSON.parse(fs.readFileSync('./config.json'));

            msg.reply('configuration rechargée avec succès !');
        }

        // Load commands
        if (args[0] == 'commands' || args[0] == 'all') {

            const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

            for (const file of commands) {
                try {
                    // Unload current commands
                    try {
                        delete require.cache[require.resolve(`./${file}`)];
                    } catch (error) {
                        throw `Je n'ai pas réussi à décharger le fichier \`${file}\``;
                    }

                    const command = require(`./${file}`);
                    msg.client.commands.set(command.name, command);
                } catch (error) {
                    console.log(error);
                    throw `Je n'ai pas réussi à recharger la commande \`${file}\` :\n> \`${error}\``;
                }
            }

            msg.reply('commandes rechargées avec succès !');
        }

        // Load events
        if (args[0] == 'events' || args[0] == 'all') {
            const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

            for (const file of events) {
                try {
                    // Unload current events
                    try {
                        delete require.cache[require.resolve(`../events/${file}`)];
                    } catch (error) {
                        throw `Je n'ai pas réussi à décharger le fichier \`${file}\``;
                    }

                    const event = require(`../events/${file}`);
                    msg.client.events.set(event.name, event);
                } catch (error) {
                    console.log(error);
                    throw `Je n'ai pas réussi à recharger l'événement \`${file}\` :\n> \`${error}\``;
                }
            }

            msg.reply('évènements rechargés avec succès !');
        }
    }
}