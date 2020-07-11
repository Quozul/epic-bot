
const https = require('https');

/**
 * Returns an array of elements in quotes
 * @param {String} str 
 * @returns {Array}
 */
function quotes(str) {
    const re = /"(.*?)"/g;
    const result = [];
    let current;
    while (current = re.exec(str))
        result.push(current.pop());
    return result.length > 0 ? result : [str];
}

/**
 * Make a https request
 * @param {String} method 
 * @param {String|Object} url 
 * @param {String} reqbody 
 * @param {Object} headers
 * @returns {Promise}
 */
function request(method, url, reqbody = '', headers = {}) {
    return new Promise((resolve, reject) => {
        let hostname, path;
        if (typeof url == 'string') {
            url = url.replace('https://', '');
            hostname = url.split('/')[0];
            path = url.replace(hostname, '') + '/';
        } else if (typeof url == 'object') {
            hostname = url.hostname;
            path = url.path;
        }

        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: method,
            headers: headers
        };

        const req = https.request(options, (res) => {
            let resbody = '';

            res.on('data', (chunk) => {
                resbody = resbody + chunk;
            });

            res.on('end', () => {
                console.log(resbody);
                resolve(resbody);
            });
        });

        req.write(reqbody);
        req.end();

        req.on('error', (e) => {
            reject(e);
        });
    });
}

/**
 * Return a random element from a given array
 * @returns {*}
 */
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
}

/**
 * Return a random element from a given array
 * @returns {Array}
 */
Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
}

/**
 * Return a random element from a given array
 * @returns {Array}
 */
Array.prototype.shuffle = function () {
    let a = this;

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

/**
 * Random number between min and max
 * @param min
 * @param max
 * @returns {Number}
 */
Math.rrandom = function (min, max) {
    return Math.floor(Math.random() * max) + min;
}

/**
 * Format a given date
 * @param {Date} date 
 * @param {String} str
 * @returns {String}
 */
Date.prototype.format = function (str) {
    return str.replace('%yyyy', this.getFullYear())
        .replace('%mm', (this.getMonth() + 1).toString().padStart(2, '0'))
        .replace('%dd', this.getDate().toString().padStart(2, '0'))
        .replace('%hh', this.getHours().toString().padStart(2, '0'))
        .replace('%mm', this.getMinutes().toString().padStart(2, '0'))
        .replace('%ss', this.getSeconds().toString().padStart(2, '0'));
}

/**
 * Format a string
 */
String.prototype.format = function () {
    const args = arguments;
    return this.replace(/{([0-9]+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

/**
 * Returns true if string is url
 */
String.prototype.isUrl = function () {
    const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return regexp.test(this);
}

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

const fs = require('fs');

function rreadDirSync(directory) {
    let files = [];

    fs.readdirSync(directory).forEach(file => {
        const path = directory + '/' + file;
        const stats = fs.statSync(path);
        if (stats.isDirectory())
            files = files.concat(rreadDirSync(path));
        else
            files.push(directory + '/' + file);
    });

    return files;
}

function fixString(str) {
    const c = [
        ['Ã©', 'é'],
        ['Ã¨', 'è'],
        ['Ã ', 'à'],
        ['Ã¯', 'ï'],
        ['Ã´', 'ô'],
        ['Ã§', 'ç'],
        ['Ãª', 'ê'],
        ['Ã¹', 'ù'],
        ['Ã¦', 'æ'],
        ['Å“', 'œ'],
        ['Ã«', 'ë'],
        ['Ã¼', 'ü'],
        ['Ã¢', 'â'],
        ['â¬', '€'],
        ['Â©', '©'],
        ['Â¤', '¤'],
        ['Â', '']
    ];
    for (const a of c)
        str = str.replaceAll(a[0], a[1]);
    return str;
}


// Bot utilities


// For message_sent table
async function updateOrInsert(client, table = '`message_sent`', msg, count) {
    const date = new Date(msg.createdAt).format('%yyyy-%mm-%dd');
    const results = client.connection.query(`select * from ${table} where user = ${msg.author.id} and guild = ${msg.guild.id} and date = '${date}'`);

    if (results.length == 0)
        client.connection.query(`insert into ${table} (user, guild, amount, date) values (${msg.author.id}, ${msg.guild.id}, ${count}, '${date}')`);
    else
        client.connection.query(`update ${table} set amount = ${results[0].amount + count} where user = ${msg.author.id} and guild = ${msg.guild.id} and date = '${date}'`)
}

// For bot_interaction table
async function updateOrInsertBotInteractions(client, table = '`bot_interaction`', msg, count) {
    const results = client.connection.query(`select * from ${table} where guild = ${msg.guild.id}`);

    if (results.length == 0)
        client.connection.query(`insert into ${table} (guild, amount) values (${msg.guild.id}, ${count})`);
    else
        client.connection.query(`update ${table} set amount = ${results[0].amount + count} where guild = ${msg.guild.id}`)
}

/**
 * Return option
 * @param {Guild} guild 
 * @param {String} option 
 * @returns {*} Option value
 */
function getOption(client, guild, option) {
    const result = client.connection.query(`select value from \`guild_options\` where guild = ${guild.id} and name = '${option}'`)[0];

    if (result != undefined) return result.value;
    else if (result == undefined && client.config[option] != undefined) return client.config[option];
    else return null;
}

/**
 * Returns translation
 * @param {Client} client 
 * @param {Guild} guild 
 * @param {String} index
 * @param {*} values
 * @returns {String} translated text
 */
function getTranslation(client, guild, index, ...values) {
    let lang = getOption(client, guild, 'lang');
    lang = lang != null ? lang : 'en';

    // If language is supported by the bot and the language is set in the config, else use english
    const msg = client.langs.get(client.langs.has(lang) && lang != null ? lang : 'en');
    if (msg == undefined)
        return "This message wasn't translated, sorry for the inconvenience";
    return msg[index].format(...values);
}

/**
 * Execute a command from the given message
 * @param {Message} msg 
 */
function executeCommand(client, msg) {
    return new Promise((resolve, reject) => {
        const prefix = getOption(client, msg.guild, 'prefix');
        const content = msg.content.substr(prefix.length, msg.content.length);
        const args = content.split(/ +/);
        const cmd = args.shift().toLowerCase();


        if (client.commands.has(cmd)) {

            const command = client.commands.get(cmd);

            try {
                switch (command.arg_type) {
                    case 'quotes':
                        command.execute(msg, quotes(content.substr(cmd.length, content.length)));
                        break;
                    case 'content':
                        command.execute(msg, content.substr(cmd.length, content.length));
                        break;
                    case 'none':
                        command.execute(msg);
                        break;

                    default:
                        command.execute(msg, args);
                        break;
                }

                resolve();
            } catch (error) {
                if (error == null) reject(getTranslation(client, msg.guild, 'system.command_usage', `${prefix}${cmd} ${command.usage}`));
                else {
                    console.log(error.stack);
                    reject(getTranslation(client, msg.guild, 'system.command_error', error));
                }
            }

        } else
            reject(getTranslation(client, msg.guild, 'system.unknown_command', `${prefix}help`));
    });
}

exports.updateOrInsert = updateOrInsert;
exports.updateOrInsertBotInteractions = updateOrInsertBotInteractions;
exports.textInQuotes = quotes;
exports.request = request;
exports.getTranslation = getTranslation;
exports.executeCommand = executeCommand;
exports.fixString = fixString;
exports.rreadDirSync = rreadDirSync;
exports.getOption = getOption;