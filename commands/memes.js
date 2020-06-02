const Discord = require('discord.js');
const utils = require('../utils');

module.exports = {
    name: 'meme',
    description: 'Récupère un meme depuis /r/memes.',
    usage: '',
    arg_type: 'none',
    execute(msg, args) {
        msg.channel.startTyping();

        utils.request('GET', 'https://www.reddit.com/r/memes/hot/.json?count=20').then((res) => {
            const meme = utils.array_random(JSON.parse(res).data.children).data;

            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(meme.title)
                .setDescription(meme.selftext)
                .setFooter(meme.author)
                .setTimestamp(meme.created_utc * 1000)
                .setImage(meme.url)
                .setURL('https://redd.it/' + meme.id)
                .setDescription('https://redd.it/' + meme.id);

            msg.channel.stopTyping();
            msg.channel.send(embed).catch(err => console.log(err));
        });
    }
}