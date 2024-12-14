const path = require('path');
const {
  getArgs,
  git,
  run,
} = require('./helpers');

const successExitCode = 1;

const checkIfDocker = async () => {
  const params = [
    '-v',
  ];

  await run(
    'docker',
    params,
  );
};

const checkIfGit = async () => {
  await git('--version');
};

const dockerLogin = async ({
  password,
  registry,
  username,
}) => {
  const params = [
    'login',
    '--username',
    username,
    '--password',
    password,
    `https://${registry}`,
  ];

  await run(
    'docker',
    params,
  );
};

/* eslint-disable-next-line complexity */
const setupImages = async ({
  all,
  rebuild,
  registry,
  version,
}) => {
  const params = [
    `${path.resolve(
      __dirname,
      './scripts/setup-images.js',
    )}`,
  ];

  if (registry) {
    params.push(`--registry=${registry}`);
  }

  if (version) {
    params.push(`--version=${version}`);
  }

  if (all) {
    params.push('--all=true');
  }

  if (rebuild) {
    params.push('--rebuild=true');
  }

  await run(
    'node',
    params,
  );
};

const buildImages = async () => {
  const params = [
    `${path.resolve(
      __dirname,
      './scripts/build-images.js',
    )}`,
  ];

  await run(
    'node',
    params,
  );
};

const publishImages = async () => {
  const params = [
    `${path.resolve(
      __dirname,
      './scripts/publish-images.js',
    )}`,
  ];

  await run(
    'node',
    params,
  );
};

const snapshotLayout = async () => {
  const params = [
    `${path.resolve(
      __dirname,
      './scripts/snapshot-layout.js',
    )}`,
  ];

  await run(
    'node',
    params,
  );
};

/* eslint-disable-next-line complexity */
const main = async () => {
  try {
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

    await checkIfDocker();

    await checkIfGit();

    if (username && password) {
      await dockerLogin({
        password,
        registry,
        username,
      });
    }

    await setupImages({
      all,
      rebuild,
      registry,
      version,
    });

    await buildImages();

    if (registry) {
      await publishImages();
    }

    if (!rebuild) {
      await snapshotLayout();
    }
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }
};

main();
