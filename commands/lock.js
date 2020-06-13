module.exports = {
    name: 'lock',
    description: "Bloque l'accès à un channel vocal.",
    usage: '',
    arg_type: 'content',
    execute(msg, content) {
        const vc = msg.member.voice.channel

        if (!vc) throw `Vous devez être dans un salon vocal pour exécuter cette commande.`;
        const results = msg.client.connection.query(`select * from locked_voice_channel where id = '${vc.id}'`);

        if (!results.length != 0 && vc.userLimit != 0) throw 'Il y a déjà une limite imposée dans ce salon.';

        let mbr_count = 0;
        if (content != undefined && !isNaN(parseInt(content)))
            mbr_count = parseInt(content);
        else
            mbr_count = vc.members.array().length;

        vc.setUserLimit(mbr_count).then(() => {
            msg.channel.send(`Le salon vocal \`${vc.name}\` est limité à ${mbr_count} utilisateurs.`);
        });

        msg.client.connection.query(`insert into locked_voice_channel(id) values ('${vc.id}')`);
    }
}