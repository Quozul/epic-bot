module.exports = {
    name: 'say',
    description: 'Fait parler le bot.',
    usage: 'message',
    arg_type: 'content',
    execute(msg, args) {
        if (args.length == 0) throw "Vous n'avez pas précisé de contenu.";
        msg.delete();
        msg.channel.send(args);
    }
}