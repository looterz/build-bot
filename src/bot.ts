import * as Discord from 'discord.js'

import config from './config'

interface IBuildCompleteInfo {
    commit: string
    commitSha: string
    buildNumber: string
    buildUrl: string
    message: string
    project: string
    pipeline: string
    duration: string
}

interface ICodePushInfo {
    title: string,
    details: string
}

export default function createBot() {
    const client = new Discord.Client()

    client.on('error', (error) => {
        console.error('Discord bot unhandled error', error)
    })

    client.on('ready', () => {
        console.log(`[bot] Now signed in.`)
    })

    if (config.bot.enable) {
        client.login(config.bot.token)
    }

    return {
        buildComplete(info: IBuildCompleteInfo) {
            if (!config.bot.enable) return
            let channel = <Discord.TextChannel> client.channels.get(config.bot.builds_channel_id)
            let embed = new Discord.RichEmbed()
                .setColor(0xf4f142)
                .setTitle(info.message)
                .setURL(info.buildUrl)
                .setTimestamp(new Date())
                .setFooter('Azure DevOps', 'https://azurecomcdn.azureedge.net/cvt-c8c25e81432b2564b126c4a01fde1d9ee2e5fe1a4390e6a8494c91255fd5b2c3/images/shared/services/devops/pipelines-icon-80.png')
                .addField('Pipeline', info.pipeline)
                .addField('Commit', `[${info.commitSha}](${info.commit})`)
                .addField('Duration', info.duration)

            try {
                channel.send({ embed })
            }
            catch (err) {
                console.log(err)
            }
        },
        codePushed(info: ICodePushInfo) {
            if (!config.bot.enable) return
            let channel = <Discord.TextChannel> client.channels.get(config.bot.commits_channel_id)
            let embed = new Discord.RichEmbed()
                .setColor(0xf4f142)
                .setTitle(info.title)
                .setTimestamp(new Date())
                .setFooter('Azure DevOps', 'https://azurecomcdn.azureedge.net/cvt-c8c25e81432b2564b126c4a01fde1d9ee2e5fe1a4390e6a8494c91255fd5b2c3/images/shared/services/devops/pipelines-icon-80.png')
                .addField('Details', info.details)

            try {
                channel.send({ embed })
            }
            catch (err) {
                console.log(err)
            }
        }
    }
}