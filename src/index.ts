import azure from './azure'
import createBot from './bot'
import createWebhook from './webhook'
import * as moment from 'moment'

const bot = createBot()
const webhook = createWebhook()

webhook.on('build.complete', async build => {
    try {
        const projectId = build.resourceContainers.project.id
        const project = await getProject(projectId)
        const definition = await getBuildDefinition(build.resource.definition.id, projectId)
        
    
        const commitSha = /:([a-zA-Z0-9]+)$/.exec(build.resource.sourceGetVersion)[1]
        
        const startTime = moment(build.resource.startTime);
        const finishTime = moment(build.resource.finishTime);
        const duration = moment.duration(finishTime.diff(startTime))
        const durationFormatted = duration.get("hours").toString().padStart(2, '0') +":"+ duration.get("minutes").toString().padStart(2, '0') +":"+ duration.get("seconds").toString().padStart(2, '0');

        bot.buildComplete({
            commit: definition.repository.properties.manageUrl + '/commit/' + commitSha,
            commitSha: commitSha,
            buildNumber: build.resource.buildNumber,
            buildUrl: /\(([^)]+)\)/.exec(build.message.markdown)[1],
            message: build.message.text,
            project: project.name,
            pipeline: build.resource.definition.name,
            duration: durationFormatted
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
            title: push.pushedBy.displayName + ' has pushed updates to ' + push.repository.name + 'repo',
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
