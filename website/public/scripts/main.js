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
                ).catch((err) => console.log(err));
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