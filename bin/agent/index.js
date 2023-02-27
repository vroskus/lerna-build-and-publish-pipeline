const path = require('path');
const {
  run,
  configToArgs,
} = require('../helpers');

const agentName = 'pipeline-agent';

const buildAgentImage = async () => {
  const params = [
    'image',
    'build',
    '-t',
    agentName,
    '-f',
    `${path.resolve(__dirname, 'Dockerfile')}`,
    '.',
  ];

  await run(
    'docker',
    params,
  );
};

const runAgentContainer = async ({
  config,
  rootFolder,
}) => {
  const params = [
    'run',
    '-v',
    '/var/run/docker.sock:/var/run/docker.sock',
    '-v',
    `${rootFolder}:/home/node/app/project`,
    '-v',
    `${path.resolve(__dirname, '../')}:/home/node/app/pipeline`,
    '-w',
    '/home/node/app/project',
    agentName,
    'sh',
    '-c',
  ];

  const args = configToArgs(config);
  const command = `node /home/node/app/pipeline/pipeline.js ${args}`;

  params.push(command);

  await run(
    'docker',
    params,
  );
};

module.exports = {
  buildAgentImage,
  runAgentContainer,
};
