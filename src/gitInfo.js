const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('node:readline/promises');

const filePath = path.resolve('src', 'generatedGitInfo.json');
let currentData = null;

try {
    currentData = JSON.parse(fs.readFileSync(filePath));
} catch (e) { }

async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const answer = await rl.question(question);
        return answer;
    } finally {
        rl.close();
    }
}

const execSyncWrapper = (command) => {
    let stdout = null;
    try {
        stdout = execSync(command).toString().trim();
    } catch (error) {
        console.error(error);
    }
    return stdout;
};

const main = async () => {
    let version = 'Development';
    if (process.argv.includes('--prod')) {
        version = await askQuestion(`Version number${currentData ? ' (current is ' + currentData.version + ')' : ''}: `);
    }

    let gitBranch = execSyncWrapper('git rev-parse --abbrev-ref HEAD');
    let gitCommitHash = execSyncWrapper('git rev-parse --short=7 HEAD');

    const obj = {
        gitBranch,
        gitCommitHash,
        version
    };

    const fileContents = JSON.stringify(obj, null, 2);

    fs.writeFileSync(filePath, fileContents);
};

main();
