const fetch = require('node-fetch');

function stringToValue(v) {
    if (v === 'false' || v === 'true')
        return v === 'true';
    else if (/^\d+$/.test(v))
        return parseInt(v);
    else
        return v;
}

/**
 * Check if the bot is in the specified guild
 * @param {*} guild Guild id
 */
function isInGuild(connection, guild) {
    const result = connection.query(`select guild from guild where guild = '${guild}'`);
    return result.length == 0 ? false : true;
}

/**
 * Check if the user is admin in the guild and if the bot is in the guild
 * @param {*} guild Guild id
 * @param {*} token Discord OAuth access token
 */
function checkGuildAccess(connection, guild, token) {
    return new Promise((resolve, reject) => {
        if (token == 'null' || token == undefined || token == null)
            reject();
        else
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            })
                .then(response => {
                    if (response.status != 200)
                        reject(response);
                    else
                        response.json().then((response) => {
                            response = response.filter((g) => g.id == guild && (g.permissions & 0x8) == 8);
                            if (response.length > 0)
                                // Verify if the bot is in the guild
                                if (isInGuild(connection, guild))
                                    resolve();
                                else
                                    reject();
                            else
                                reject();
                        });
                });
    });
}

/**
 * Returns the current value of a setting
 * @param {*} guild Guild id
 * @param {*} setting Setting name
 */
function getOption(config, connection, guild, setting) {
    const result = connection.query(`select value from \`guild_options\` where guild = ${guild} and name = '${setting}'`)[0];

    if (result != undefined)
        return stringToValue(result.value);
    else if (result == undefined && config[setting] != undefined)
        return config[setting];
    else
        return null;
}

function isConnected(sd) {
    if (sd == undefined || sd.access_token == undefined || Date.now() > sd.expires_at)
        return false;
    return true;
}

exports.getOption = getOption;
exports.isConnected = isConnected;
exports.stringToValue = stringToValue;
exports.isInGuild = isInGuild;
exports.checkGuildAccess = checkGuildAccess;