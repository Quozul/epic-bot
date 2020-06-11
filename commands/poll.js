const Discord = require('discord.js');
const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    name: 'poll',
    description: 'Créé un sondage.',
    usage: '["question"] <"reponse 1">...',
    arg_type: 'quotes',
    execute(msg, args) {
        if (!msg.member.permissions.has('ADMINISTRATOR')) throw "Vous n'avez pas la permission d'utiliser cette commande.";
        if (args.length < 1 || args[0] == '') throw null;
        else if (args.length == 2) throw "Quantité de réponse invalide.";

        const e = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${msg.author.username} a créé un sondage`)
            .setFooter(msg.author.username, msg.author.avatarURL())
            .setTimestamp()
            .setDescription(args[0])

        if (args.length > 1) {
            for (let i = 1; i < args.length; i++)
                e.addField(
                    emojis[i - 1],
                    args[i], true
                );

            msg.channel.send(e).then(async m => {
                for (let i = 1; i < args.length; i++)
                    await m.react(
                        emojis[i - 1]
                    );
            });
        } else {
            e.addField('✔', 'Oui', true);
            e.addField('❌', 'Non', true);

            msg.channel.send(e).then(async m => {
                await m.react('✔');
                await m.react('❌');
            });
        }
    }
}