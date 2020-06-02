const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {
    name: 'reddit',
    description: 'Récupère un poste depuis sous-reddit.',
    usage: '[sub-reddit]',
    arg_type: 'default',
    execute(msg, args) {
        if (args.length < 1) throw null;

        msg.channel.startTyping();

        utils.request('GET', `https://www.reddit.com/r/${args[0]}/hot/.json?count=20`).then((res) => {
            const post = utils.array_random(JSON.parse(res).data.children).data;

            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(post.title)
                .setDescription(post.selftext.length < 2048 ? post.selftext : post.selftext.substr(0, 2045) + '...')
                .setFooter(post.author)
                .setTimestamp(post.created_utc * 1000)
                .setImage(post.url)
                .setURL('https://redd.it/' + post.id)

            msg.channel.stopTyping();
            msg.channel.send(embed).catch(err => console.log(err));
        }).catch((err) => {
            msg.channel.stopTyping();
            msg.channel.send('Une erreur est survenue, le sous-reddit existe-t-il ?');
        });
    }
}