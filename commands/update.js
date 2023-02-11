const config = require('../config.json');

const snekfetch = require('snekfetch');

async function update(interaction, user) {
    var { body } = await snekfetch.get(`${config.firebaseURL}/verified/${user.id}.json`)

    if (!body) {
        return interaction.reply({ content: '업데이트를 쓰기전에 인증을 먼저 하셔야죠!', ephemeral: true });
    }

    var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${body.linked}`)

    const currentName = interaction.member.displayName
    var displayName

    if (body.displayName === body.name) {
        displayName = body.name;
    } else {
        displayName = body.displayName;
    }

    if (interaction.member.displayName !== displayName) {
        interaction.member.setNickname(`${displayName}`);

        return interaction.reply({ content: `U${currentName}에서 ${displayName} 으로 이름이 변경 되셨어요! .`, ephemeral: true })
    } else {
        return interaction.reply({ content: '이미 업데이트 되었는데요?', ephemeral: true })
    }
}

module.exports = {
    name: '업데이트',
    async execute(interaction) {
        const { options } = interaction
        const user = options.getUser('user')

        if (user) {
            update(interaction, user)
        } else {
            update(interaction, interaction.member.user)
        }
    },
};
