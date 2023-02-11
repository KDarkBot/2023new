const config = require('../config.json');

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: '명령어',
    async execute(interaction) {
        const { commandName, options } = interaction

        const commands = [
            "**/명령어** - 명령어들을 보여줘요!",
           
            "\n**/인증**  - 로블게임을 이용하여 인증해요!",
           
            "\n**/update**  - 역활과 닉네임을 재설정해요",
         
         
           
        ];

        var commandString = commands.join('')

        const response1 = new MessageEmbed()
            .setTitle('명령어')
            .setDescription(`${commandString}`)
            .setColor('0x5d65f3');

        return interaction.reply({ embeds: [response1], ephemeral: true  });
    },
};
