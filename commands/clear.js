module.exports = {
    name: 'clear',
    description: 'Supprime x messages.',
    usage: '<quantité>',
    arg_type: 'content',
    execute(msg, content) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";

        const i = parseInt(content);

        if (content == undefined)
            throw 'Vous devez préciser une quantité de message.';
        else if (isNaN(i))
            throw 'Vous devez préciser une quantité de message numérique.';
        else if (1 > i || i > 100)
            throw 'La valeur doit être comprise entre 1 et 100.';
        else {
            msg.channel.bulkDelete(i + 1).then(() => {
                msg.reply(`${content} messages supprimés du salon.`);
            });
        }
    }
}