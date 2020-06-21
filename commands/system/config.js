const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'config',
    description: 'Modifie les paramètres du bot.',
    usage: '<paramètre> [valeur]',
    arg_type: 'args',
    execute(msg, args) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";
        if (args.length < 2) throw null;

        throw "La commande ne sert à rien pour le moment";
    }
}