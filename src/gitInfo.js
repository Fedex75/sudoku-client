const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readline = require('node:readline/promises')

async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const answer = await rl.question(question);
        return answer
    } finally {
        rl.close();
    }
}

const execSyncWrapper = (command) => {
    let stdout = null
    try {
        stdout = execSync(command).toString().trim()
    } catch (error) {
        console.error(error)
    }
    return stdout
}

const main = async () => {
    let version = 'Development'
    if (process.argv.includes('--prod')){
        version = await askQuestion('Version number:')
    }

    let gitBranch = execSyncWrapper('git rev-parse --abbrev-ref HEAD')
    let gitCommitHash = execSyncWrapper('git rev-parse --short=7 HEAD')

    const obj = {
        gitBranch,
        gitCommitHash,
        version
    }

    const filePath = path.resolve('src', 'generatedGitInfo.json')
    const fileContents = JSON.stringify(obj, null, 2)

    fs.writeFileSync(filePath, fileContents)
    console.log(`Wrote the following contents to ${filePath}\n${fileContents}`)
}

main()
