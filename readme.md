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
* Anti vulgarity filter **[Powered by Bodyguard](https://developers.bodyguard.ai/)** (French only)
* Command cooldown ![Command cooldown](assets/cooldown.gif)
* Edit commands ![Command cooldown](assets/edit_command.gif)
* Count messages sent by users
* Automatically attribute active role(s)
* Spam protection
* Weird replies when mentionned **[Using FrenchSentencesGenerator](https://github.com/Klemek/FrenchSentencesGenerator)** (French only)

## Commands
* Get random post from reddit `?reddit`
* Lock and unlock voice channels `?lock, ?unlock` (voice channels automatically unlocks when channel is empty)
* Make the bot speak `?say`
* See a podium of most active users `?podium`
* See boost progress bar `?boost`
* See informations about a user `?whois`
* Play YouTube video in voice channel `?yt`
* Leave the voice channel `?leave`

#### Fun commands
* Get a scratch ticket `?ticket`

#### Admin commands
* Create polls *admin* `?poll`
* Create announcement *admin* `?annonce`
* Clear messages *admin* `?clear`

## Config parameters
Name | Description | Default value
--- | --- | ---
`token` | The token of your Discord application | none
`prefix` | Prefix used for commands | `?`
`command_cooldown` | Cooldown between sames messages and commands | `5`
`spam_protection` | Toggles spam protection | `true`
`lang` | Sets the language of the bot | `english`
`replies` | Send replies when mentionned (French only) | `true`
`activity` | |
`activity.type` | The type of the activity, can be `PLAYING`, `WATCHING`, `LISTENING` or `STREAMING` | `STREAMING`
`activity.url` | Only if `activity.type` is set to `STREAMING` | `https://www.twitch.tv/quozul`
`activity.value` | The "game" the bot is playing | `Utilisez ?help pour connaître la liste des commandes`
`bodyguard` | |
`bodyguard.enabled` | Toggles bad words censorship (French only) | `false`
`bodyguard.token` | Your Bodyguard token | none
`mysql` | |
`mysql.host` | The ip address where your database is hosted | `localhost`
`mysql.user` | Username used to connect to your database | `root`
`mysql.password` | Password used to connect to your database | `root`
`mysql.database` | The name of the database used by the bot | `epic-bot`