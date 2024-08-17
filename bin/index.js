#! /usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  configToArgs,
  getArgs,
  run,
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
      password: REGISTRY_PASSWORD,
      registry: REGISTRY_HOSTNAME,
      username: REGISTRY_USERNAME,
    };
  }

  return {
  };
};

const getConfig = ({
  rootFolder,
}) => {
  const {
    password: envPassword,
    registry: envRegistry,
    username: envUsername,
  } = getEnv({
    rootFolder,
  });

  const {
    all,
    password,
    rebuild,
    registry,
    username,
    version,
  } = getArgs([
    'version',
    'all',
    'rebuild',
    'registry',
    'username',
    'password',
  ]);

  return {
    all,
    password: password || envPassword,
    rebuild,
    registry: registry || envRegistry,
    username: username || envUsername,
    version,
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
