const config = require('../config.json');

const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const snekfetch = require('snekfetch');
const firebase = require('firebase');

module.exports = {
    name: 'verify',
    async execute(interaction) {
        const { options } = interaction
        const member = interaction.member.user.id

        const verifiedRole = interaction.guild.roles.cache.find(role => role.name === config.verifiedRole);

        if (interaction.member.roles.cache.some(role => role.name === config.verifiedRole)) {
            return interaction.reply({ content: '당신은 이미 인증을 한적이 있으시군요! /update 를 통해 다시 역활을 지급 받으세요', ephemeral: true });
        }

        var { body } = await snekfetch.get(`${config.firebaseURL}verified/${member}.json`)

        if (body) {
            var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${body.linked}`)
            await interaction.member.roles.add(verifiedRole);

            var displayName

            if (body.displayName === body.name) {
                displayName = body.name;
            } else {
                displayName = body.displayName;
            }
 
            interaction.member.setNickname(`${displayName}`);

            return interaction.reply({ content: `서버에 온걸 환영해요!, ${displayName}!`, ephemeral: true });
        } else {
            const userId = options.getNumber('userid');

            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

            if (body) {
                return interaction.reply({ content: '인증요청 메세지가 이미 있는데요?', ephemeral: true });
            } else {
                var { body } = await snekfetch.get(`https://users.roblox.com/v1/users/${userId}`)

                if (!body.name) {
                    return interaction.reply({ content: `${userId} 은 존재하지 않는 id 에요!`, ephemeral: true });
                }

                var displayName

                if (body.displayName === body.name) {
                    displayName = body.name;
                } else {
                    displayName = body.displayName;
                }

                const page1 = new MessageEmbed()
                    .setTitle('인증✅')
                    .setDescription(`본인 확인을 위해 게임에 들어와주세요(${config.verificationLink}).`)
                    .setColor('0x5d65f3');
                const page2 = new MessageEmbed()
                .setTitle('인증✅')
                    .setDescription(`죄송하지만 아직 게임에 안들어가신것 같은데요? [인증겜](${config.verificationLink})에 들어가 주세요!`)
                    .setColor('0x5d65f3');
                const page3 = new MessageEmbed()
                .setTitle('인증✅')
                    .setDescription(`인증이 확인되었어요. 서버에 오신걸 환영해요, ${displayName}.`)
                    .setColor('0x5d65f3');
                const page4 = new MessageEmbed()
                .setTitle('인증✅')
                    .setDescription(`인증 요청이 거절되었어요. 다시 시도해 주시겠나요?`)
                    .setColor('0x5d65f3');
                const page5 = new MessageEmbed()
                .setTitle('인증✅')
                    .setDescription(`너무 많은 시간이 지났어요...`)
                    .setColor('0x5d65f3');
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('verification_code_next')
                        .setLabel('Next')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('verification_cancel')
                        .setLabel('Cancel')
                        .setStyle('DANGER')
                );

                firebase.database().ref(`pending/${userId}`).set(member)

                interaction.reply({ embeds: [page1], components: [row], ephemeral: true }).then(message => {
                    const filter = i => i.user.id === member;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 300000 });

                    collector.on('collect', async i => {
                        i.deferUpdate();

                        if (i.customId === 'verification_code_next') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}verified/${member}.json`)

                            if (body) {
                                await interaction.member.roles.add(verifiedRole);

                                interaction.member.setNickname(`${body.username}`);

                                return interaction.editReply({ embeds: [page3], components: [], ephemeral: true });
                            } else {
                                return interaction.editReply({ embeds: [page2], components: [row], ephemeral: true });
                            };
                        } else if (i.customId === 'verification_cancel') {
                            var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                            if (body) {
                                firebase.database().ref(`pending/${userId}`).set({})
                            }

                            return interaction.editReply({ embeds: [page4], components: [], ephemeral: true });
                        };
                    });

                    collector.on('end', async i => {
                        var { body } = await snekfetch.get(`${config.firebaseURL}pending/${userId}.json`)

                        if (body) {
                            firebase.database().ref(`pending/${userId}`).set({})
                        }

                        return interaction.editReply({ embeds: [page5], components: [], ephemeral: true });
                    });
                });
            }
        }
    },
};
