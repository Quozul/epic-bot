
const https = require('https');

function quotes(str) {
    const re = /"(.*?)"/g;
    const result = [];
    let current;
    while (current = re.exec(str))
        result.push(current.pop());
    return result.length > 0 ? result : [str];
}

function request(method, url, body = '', headers = {}) {
    return new Promise((resolve, reject) => {
        url = url.replace('https://', '');
        hostname = url.split('/')[0];
        path = url.replace(hostname, '') + '/';

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

array_random = function (array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function updateOrInsert(connection, table, user, guild, count) {
    const results = connection.query(`select * from ${table} where user = ${user} and guild = ${guild}`);

    if (results.length == 0)
        connection.query(`insert into ${table} (user, guild, amount) values (${user}, ${guild}, ${count})`)
    else
        connection.query(`update ${table} set amount = ${results[0].amount + count} where user = ${user} and guild = ${guild}`)
}

exports.updateOrInsert = updateOrInsert;
exports.array_random = array_random;
exports.textInQuotes = quotes;
exports.request = request;