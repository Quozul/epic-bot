module.exports = {
    name: 'clear',
    description: 'Supprime x messages.',
    usage: '<quantité>',
    arg_type: 'content',
    execute(msg, content) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";

        if (content == undefined)
            throw 'Vous devez préciser une quantité de message.';
        else if (isNaN(parseInt(content)))
            throw 'Vous devez préciser une quantité de message numérique.';
        else {
            msg.channel.bulkDelete(parseInt(content)).then(() => {
                msg.reply(`${content} messages supprimés du salon.`);
            });
        }
    }
}