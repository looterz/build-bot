import azure from './azure'
import createBot from './bot'
import createWebhook from './webhook'

const bot = createBot()
const webhook = createWebhook()

webhook.on('build.complete', async build => {
    try {
        const projectId = build.resourceContainers.project.id
        const project = await getProject(projectId)
        const definition = await getBuildDefinition(build.resource.definition.id, projectId)
        
    
        const commitSha = /:([a-zA-Z0-9]+)$/.exec(build.resource.sourceGetVersion)[1]
    
        bot.buildComplete({
            commit: definition.repository.properties.manageUrl + '/commit/' + commitSha,
            commitSha: commitSha,
            buildNumber: build.resource.buildNumber,
            buildUrl: /\(([^)]+)\)/.exec(build.message.markdown)[1],
            message: build.message.text,
            project: project.name,
            pipeline: build.resource.definition.name
        })
    }
    catch (err) {
        console.error('Error handling build')
        console.error(err)
    }
})

webhook.on('git.push', async push => {
    try {
        bot.codePushed({
            message: push.message.markdown,
            details: push.detailedMessage.markdown
        })
    }
    catch (err) {
        console.error('Error handling git push')
        console.error(err)
    }
})

async function getBuildDefinition(id: number, projectId: string) {
    const build = await azure.getBuildApi()
    let def = await build.getDefinition(id, projectId)

    return def
}

async function getProject(id: string) {
    const core = await azure.getCoreApi()
    const projects = await core.getProjects()
    return projects.find(proj => proj.id == id)
}
