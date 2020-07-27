function randomId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a toast
 * @param {String} title Title of the toast
 * @param {String} content Content of the toast
 */
function createToast(title, content) {
    const toasts = document.getElementById('toasts');
    const id = '_toast' + randomId();

    // <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="position: absolute; top: 0; right: 0;">
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.setAttribute('role', 'alert');
    toast.id = id;

    toast.innerHTML =
        `<div class="toast-header">
            <strong class="mr-auto">${title}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${content}
        </div>`;

    toasts.append(toast);

    $('#' + id).on('hidden.bs.toast', function () {
        this.remove();
    });

    $('#' + id).toast({ autohide: false });
    $('#' + id).toast('show');
}

// Guild

function save() {
    const guild = window.location.pathname.split('/')[2];
    const values = $('#bot-settings').serializeArray();

    fetch('/token')
        .then(res => res.text())
        .then(token => {
            for (const field of values)
                fetch(`/api/setting/${guild}/${field.name}`,
                    {
                        method: 'post',
                        headers: new Headers({ 'content-type': 'application/json' }),
                        body: JSON.stringify({
                            value: field.value, token: token
                        })
                    }
                )
                    .then((res) => {
                        if (res.status != 200)
                            createToast('Error', 'An error occured while saving informations, please retry later.<br>Error code: ' + res.status);
                    })
                    .catch((err) => {
                        console.log(err);
                        createToast('Network error', 'An error occured while saving informations, please check your internet connection.');
                    });
        });
}

function setSettingValue() {
    const guild = window.location.pathname.split('/')[2];
    const inputs = document.getElementsByClassName('setting-value');

    for (const key in inputs) {
        if (inputs.hasOwnProperty(key)) {
            const element = inputs[key];

            fetch(`/api/setting/${guild}/${element.id}`)
                .then(res => res.text())
                .then(value => {
                    if (value == 'true' || value == 'false')
                        element.checked = value === 'true';

                    element.value = value;
                });
        }
    }
}

// Select

function getGuilds() {
    fetch('/token')
        .then(res => res.text())
        .then(token => {
            if (token != 'null') {
                const guilds = document.getElementById('guilds');
                const progress_bar = document.getElementById('guild-progress');

                fetch('https://discord.com/api/users/@me/guilds', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                })
                    .then(res => res.json())
                    .then(response => {
                        response = response.filter((g) => (g.permissions & 0x8) == 8).sort((a, b) => a.name.localeCompare(b.name));
                        response.forEach((guild, key) => {
                            fetch('/api/in/' + guild.id)
                                .then(res => res.json())
                                .then(isIn => {
                                    const row = document.createElement('tr');
                                    row.innerHTML =
                                        `<td>
                                            <img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" class="guild-icon rounded-circle align-middle">
                                        </td>
                                        <td class="align-middle">
                                            ${guild.name}
                                        </td>`

                                    if (isIn)
                                        row.innerHTML +=
                                            `<td>
                                                <a class="btn btn-primary w-100 align-middle" href="/guild/${guild.id}">Select</a>
                                            </td>`
                                    else
                                        row.innerHTML +=
                                            `<td>
                                                <a class="btn btn-secondary w-100 align-middle" href="https://discord.com/oauth2/authorize?client_id=660424710021971988&scope=bot&permissions=8">Invite</a>
                                            </td>`


                                    guilds.appendChild(row);

                                    progress_bar.style.width = ((key + 1) / response.length * 100) + '%';
                                });
                        });
                    })
                    .catch(console.error);
            } else {
                console.log("You're not connected!");
            }
        });
}

// Aliases

function getAliases() {
    const guild = window.location.pathname.split('/')[2];

    fetch('/api/alias/' + guild)
        .then(res => res.json())
        .then(response => {
            if (response.length > 0) {
                const aliases = document.getElementById('aliases');
                aliases.innerHTML =
                    `<div class="row">
                        <label class="col-4">Alias</label>
                        <label class="col-4">Command</label>
                    </div>`;

                response.forEach((alias) => {
                    const alias_form = document.createElement('div');
                    alias_form.classList.add('form-group');
                    alias_form.innerHTML =
                        `<div class="row">
                            <div class="col-4">
                                <input type="text" class="form-control" placeholder="Alias" value="${alias.alias}">
                            </div>
                            <div class="col-4">
                                <input type="text" class="form-control" placeholder="Command" value="${alias.command}">
                            </div>
                            <div class="col-2">
                                <button class="btn btn-primary w-100" disabled>Save</button>
                            </div>
                            <div class="col-2">
                                <button class="btn btn-danger w-100" disabled>Delete</button>
                            </div>
                        </div>`;

                    aliases.append(alias_form);
                });
            }
        });
}

function formToObject(form) {
    let obj = {};
    for (const field of form.serializeArray())
        obj[field.name] = field.value;
    return obj;
}

function addAlias() {
    const guild = window.location.pathname.split('/')[2];
    const values = formToObject($('#new-alias'));

    fetch('/token')
        .then(res => res.text())
        .then(token => {
            const body = JSON.stringify({
                alias: values.alias,
                command: values.command,
                token: token
            });

            fetch(`/api/alias/${guild}`,
                {
                    method: 'post',
                    headers: new Headers({ 'content-type': 'application/json' }),
                    body: body
                }
            )
                .then((res) => {
                    if (res.status != 200)
                        createToast('Error', 'An error occured while saving informations, please retry later.<br>Error code: ' + res.status);
                })
                .catch((err) => {
                    console.log(err);
                    createToast('Network error', 'An error occured while saving informations, please check your internet connection.');
                });
        });
}

// Guild pills

function setDefaultPill() {
    document.getElementById('pills-settings').classList.add('active', 'show');
    document.getElementById('pills-settings-tab').classList.add('active');
}

function setPills() {
    if (window.location.hash != "") {
        const element = document.querySelector(window.location.hash);

        if (element != null) {
            element.classList.add('active', 'show');
            document.querySelector(window.location.hash + '-tab').classList.add('active');
        } else
            setDefaultPill();
    } else
        setDefaultPill();
}