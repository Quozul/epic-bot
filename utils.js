
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

// for message_sent table
async function updateOrInsert(client, table = '`message_sent`', msg, count) {
    const date = new Date(msg.createdAt).format('%yyyy-%mm-%dd');
    const results = client.connection.query(`select * from ${table} where user = ${msg.author.id} and guild = ${msg.guild.id} and date = '${date}'`);

    if (results.length == 0)
        client.connection.query(`insert into ${table} (user, guild, amount, date) values (${msg.author.id}, ${msg.guild.id}, ${count}, '${date}')`);
    else
        client.connection.query(`update ${table} set amount = ${results[0].amount + count} where user = ${msg.author.id} and guild = ${msg.guild.id} and date = '${date}'`)
}

// for bot_interaction table
async function updateOrInsertBotInteractions(client, table = '`bot_interaction`', msg, count) {
    const date = new Date(msg.createdAt).format('%yyyy-%mm-%dd');
    const results = client.connection.query(`select * from ${table} where guild = ${msg.guild.id}`);

    if (results.length == 0)
        client.connection.query(`insert into ${table} (guild, amount) values (${msg.guild.id}, ${count})`);
    else
        client.connection.query(`update ${table} set amount = ${results[0].amount + count} where guild = ${msg.guild.id}`)
}

// exports.format = format;
exports.updateOrInsert = updateOrInsert;
exports.updateOrInsertBotInteractions = updateOrInsertBotInteractions;
exports.textInQuotes = quotes;
exports.request = request;