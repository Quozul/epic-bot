const Discord = require('discord.js');
const utils = require('../../utils');

module.exports = {
    name: 'meme',
    description: 'Get a random meme from /r/memes sub-reddit.',
    usage: '',
    arg_type: 'none',
    execute(msg, args) {
        msg.channel.startTyping();

        utils.request('GET', 'https://www.reddit.com/r/memes/hot/.json?count=20').then((res) => {
            const meme = JSON.parse(res).data.children.random().data;

            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(meme.title)
                .setDescription(meme.selftext)
                .setFooter(meme.author)
                .setTimestamp(meme.created_utc * 1000)
                .setImage(meme.url)
                .setURL('https://redd.it/' + meme.id)
                .setDescription('https://redd.it/' + meme.id);

            msg.channel.send(embed)
                .then(() => {
                    msg.channel.stopTyping();
                })
                .catch(err => console.log(err));
        });
    }
}