# Epic-bot
Discord bot for my server. Currently, the bot is only in French but I'm planning to translate it.

## Installation
* Clone the repository.
* Run `npm i` to install dependencies.
* Rename `config.template.json` to `config.json` and replace the placeholder values.
* Run the script from the `db.sql` file into you MySQL database.
* Use `node main.js` to start the bot.
* (Optionnal) Create a `epic-logging` channel for the bot to log stuff.

## Features
* Welcome and quit message
* Boost progress bar on server boost
* Record deleted messages into `epic-logging` channel
* Anti vulgarity filter (French only)
* Command cooldown ![Command cooldown](assets/cooldown.gif)
* Edit commands ![Command cooldown](assets/edit_command.gif)
* Count messages sent by users
* Automatically attribute active role(s)

## Commands
* Get random post from reddit `?reddit`
* Lock and unlock voice channels `?lock, ?unlock` (voice channels automatically unlocks when channel is empty)
* Make the bot speak `?say`
* See a podium of most active users `?podium`
* See boost progress bar `?boost`
* See informations about a user `?whois`
* Play YouTube video in voice channel `?yt`

#### Fun commands
* Get a scratch ticket `?ticket`

#### Admin commands
* Create polls *admin* `?sondage`
* Create announcement *admin* `?annonce`
* Clear messages *admin* `?clear`