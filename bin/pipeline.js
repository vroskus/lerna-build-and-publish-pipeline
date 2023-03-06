const path = require('path');
const {
  getArgs,
  git,
  run,
} = require('./helpers');

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
  registry,
  username,
  password,
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

const setupImages = async ({
  version,
  all,
  rebuild,
  registry,
}) => {
  const params = [
    `${path.resolve(__dirname, './scripts/setup-images.js')}`,
    `--registry=${registry}`,
  ];

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
    `${path.resolve(__dirname, './scripts/build-images.js')}`,
  ];

  await run(
    'node',
    params,
  );
};

const publishImages = async () => {
  const params = [
    `${path.resolve(__dirname, './scripts/publish-images.js')}`,
  ];

  await run(
    'node',
    params,
  );
};

const snapshotLayout = async () => {
  const params = [
    `${path.resolve(__dirname, './scripts/snapshot-layout.js')}`,
  ];

  await run(
    'node',
    params,
  );
};

const main = async () => {
  try {
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

    await checkIfDocker();

    await checkIfGit();

    await dockerLogin({
      registry,
      username,
      password,
    });

    await setupImages({
      version,
      all,
      rebuild,
      registry,
    });

    await buildImages();

    await publishImages();

    await snapshotLayout();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
