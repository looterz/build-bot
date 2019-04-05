interface IConfig {
    azure: {
        token: string
        url: string
    }

    bot: {
        enable: boolean
        builds_channel_id: string
        commits_channel_id: string
        token: string
    }

    webhook: {
        auth_token: string
        enable: boolean
        listen_port: number
    }
}