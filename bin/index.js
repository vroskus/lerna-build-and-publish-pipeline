#! /usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  run,
  getArgs,
  configToArgs,
} = require('./helpers');
const {
  buildAgentImage,
  runAgentContainer,
} = require('./agent');

const getEnv = ({
  rootFolder,
}) => {
  const envFile = path.join(
    rootFolder,
    './configs/pipeline.env',
  );

  if (fs.existsSync(envFile)) {
    const {
      REGISTRY_HOSTNAME,
      REGISTRY_PASSWORD,
      REGISTRY_USERNAME,
    } = dotenv.parse(fs.readFileSync(
      envFile,
      {
        encoding: 'utf8',
      },
    ));

    return {
      registry: REGISTRY_HOSTNAME,
      username: REGISTRY_USERNAME,
      password: REGISTRY_PASSWORD,
    };
  }

  return {
  };
};

const getConfig = ({
  rootFolder,
}) => {
  const {
    registry: envRegistry,
    username: envUsername,
    password: envPassword,
  } = getEnv({
    rootFolder,
  });

  const {
    version,
    all,
    rebuild,
    registry,
    username,
    password,
  } = getArgs([
    'version',
    'all',
    'rebuild',
    'registry',
    'username',
    'password',
  ]);

  return {
    version,
    all,
    rebuild,
    registry: registry || envRegistry,
    username: username || envUsername,
    password: password || envPassword,
  };
};

const main = async () => {
  try {
    const rootFolder = process.cwd();

    const config = getConfig({
      rootFolder,
    });

    const {
      agent,
    } = getArgs([
      'agent',
    ]);

    // If docker agent will be used to run the pipeline
    if (agent) {
      await buildAgentImage();

      await runAgentContainer({
        config,
        rootFolder,
      });
    } else {
      const argsString = configToArgs(config);
      const args = argsString.split(' ');
      const pipelineScriptPath = path.resolve(
        __dirname,
        'pipeline.js',
      );

      await run(
        'node',
        [
          pipelineScriptPath,
          ...args,
        ],
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
