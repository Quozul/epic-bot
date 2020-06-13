
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
 * @param {String} body 
 * @param {Object} headers
 * @returns {Promise}
 */
function request(method, url, body = '', headers = {}) {
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
            let body = '';

            res.on('data', (chunk) => {
                body = body + chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        });

        req.write(body);
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
 * Format a given date
 * @param {Date} date 
 * @param {String} str
 * @returns {String}
 */
Date.prototype.format = function (str) {
    return str.replace('%yyyy', this.getFullYear())
        .replace('%mm', (this.getMonth() + 1).toString().padStart(2, '0'))
        .replace('%dd', this.getDate().toString().padStart(2, '0'));
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
 * Returns translation
 * @param {Client} client 
 * @param {Guild} guild 
 * @param {String} index
 * @param {*} values
 */
function getTranslation(msg, index, ...values) {
    return msg.client.langs.get(msg.client.config.lang)[index].format(...values);
}

/**
 * Execute a command from the given message
 * @param {Message} msg 
 */
function executeCommand(client, msg) {
    return new Promise((resolve, reject) => {
        const content = msg.content.substr(client.config.prefix.length, msg.content.length);
        const args = content.split(/ +/);
        const cmd = args.shift().toLowerCase();


        if (client.commands.has(cmd)) {

            const command = client.commands.get(cmd);

            try {
                if (command.arg_type == 'quotes')
                    command.execute(msg, utils.textInQuotes(content.substr(cmd.length, content.length)));
                else if (command.arg_type == 'content')
                    command.execute(msg, content.substr(cmd.length, content.length));
                else if (command.arg_type == 'none')
                    command.execute(msg);
                else
                    command.execute(msg, args);

                resolve();
            } catch (error) {
                if (error == null) reject(`Utilisation de la commande :\n> ${client.config.prefix}${cmd} ${command.usage}`);
                else reject(`Il y a eu une erreur dans l\'exécution de la commande !\n> ${error}`);
            }

        } else
            reject(getTranslation(msg, 'system.unknown_command', `${client.config.prefix}help`));
    });
}

exports.updateOrInsert = updateOrInsert;
exports.updateOrInsertBotInteractions = updateOrInsertBotInteractions;
exports.textInQuotes = quotes;
exports.request = request;
exports.getTranslation = getTranslation;
exports.executeCommand = executeCommand;
exports.fixString = fixString;