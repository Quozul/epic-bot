module.exports = {
    name: 'unlock',
    description: "Restitue l'accès à un channel vocal bloqué.",
    usage: '',
    arg_type: 'none',
    execute(msg, args, client) {
        const vc = msg.member.voice.channel

        if (!vc) throw `Vous devez être dans un salon vocal pour exécuter cette commande.`;
        if (vc.userLimit == 0) throw 'Il n\'y a pas de limite sur ce salon.';

        const results = client.connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);
        if (results.length == 0) throw 'La limite de ce salon ne peut pas être enlevée.';

        vc.setUserLimit(0).then(() => {
            msg.channel.send(`La limite d'utilisateurs du salon vocal \`${vc.name}\` a été enlevée.`);

            client.connection.query(`delete from locked_voice_channel where id = '${vc.id}'`);
        });
    }
}