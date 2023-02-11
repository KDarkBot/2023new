const config = require('./config.json');

const { readdirSync } = require('fs');
const { Client, Collection} = require('discord.js');

const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
});

const firebase = require('firebase');
const { env } = require('process');
const firebaseConfig = {
    databaseURL: `${config.firebaseURL}`,
};
firebase.initializeApp(firebaseConfig)

client.commands = new Collection();
const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));

for (const file of commands) {
    try {
        const props = require(`./commands/${file}`);
        client.commands.set(props.name, props);
    } catch (e) {
        console.error(`Unable to load command ${file}: ${e}`);
    }
}

client.once('ready', () => {
    print("작동하거랏")
    client.user.setActivity('나는 인증하는 노예!', { type: 'WATCHING' });

    let slashCommands

    slashCommands = client.application?.commands

    slashCommands?.create({
        name: '명령어',
        description: '명령어를 보여줘요!'
    })

    slashCommands?.create({
        name: '인증',
        description: '게임인증',
        options: [
            {
                name: 'userid',
                description: 'Your Roblox userid.',
                required: true,
                type: 'NUMBER'
            }
        ]
    })

    slashCommands?.create({
        name: '업데이트',
        description: '당신의 역활과 이름을 재설정해요',
        options: [
            {
                name: 'user',
                description: 'The Discord user to update.',
                required: false,
                type: 'USER'
            }
        ]
    })

    

});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(env("TOKEN"))
