const utils = require('../utils');

const tickets_messages = ['Vous avez perdus...', 'Désolé 😞', 'Oh mince tu viens de perdre', 'Oh nooooon, tu as perdu', 'Quelle erreur, tu as encore perdu', 'Encore perdu', 'Nous sommes tous avec toi, tu gagneras la prochaine fois', 'Perdu, désolé', 'Triste, tu viens de passer à coté de 10 000€', 'Oh non, ça te passe sous le nez', '✈ vioooon, eh non, tu ne rêves pas, tu as perdu']

function t(t) {
    let y = '';
    function p() {
        let p = Math.random() * 10 + 1;
        let f = '';
        for (let i = 0; i < p; i++)
            f += '|| ||';
        return f;
    }

    t.split('').forEach(e => y += `||${e}||`);
    y = p() + y + p();

    return y;
}

module.exports = {
    name: 'ticket',
    description: 'Ticket à gratter !',
    usage: '',
    arg_type: 'none',
    execute(msg, args) {
        msg.reply(t(tickets_messages.random()));
    }
}