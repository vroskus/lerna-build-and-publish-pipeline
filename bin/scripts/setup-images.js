/* eslint-disable no-console */

const {
  fileExists,
  getArgs,
  getPackages,
  git,
  runLocalOrGlobalLibrary,
  saveImagesToProcess,
} = require('../helpers');

const versions = ['patch', 'minor', 'major'];
const successExitCode = 1;

const forceByCommitAllPackagesToProcess = async () => {
  const gitCommitMessage = await git('log -1 --pretty=%B');

  return gitCommitMessage.includes('[all]');
};

const getVersionFromByString = (value) => {
  if (versions.includes(value) === true) {
    const index = versions.indexOf(value);

    return versions[index];
  }

  return 'patch';
};

const getVersionByCommit = async () => {
  const gitCommitMessage = await git('log -1 --pretty=%B');

  console.log(`Last commit message: \n${gitCommitMessage}`);

  let version = null;

  for (const v of versions) {
    if (gitCommitMessage.includes(`[${v}]`)) {
      version = v;
    }
  }

  return version || 'patch';
};

const getVersion = async (version) => {
  if (version && version !== '') {
    return getVersionFromByString(version);
  }

  return getVersionByCommit();
};

const getGitValue = async (input) => {
  const gitOutput = await git(input);

  return gitOutput.replace(
    /\//g,
    '-',
  ).replace(
    /\n/g,
    '',
  );
};

const isRelease = async () => {
  const {
    toMaster,
  } = getArgs(['toMaster']);
  const branch = await getGitValue('rev-parse --abbrev-ref HEAD');

  return toMaster || branch === 'master';
};

const getPackagesUpdatedData = async (packagesToProcess) => {
  const allPackages = await getPackages('packages');
  const packagesToProcessNames = packagesToProcess.map((item) => item.name);

  return allPackages.filter((
    item,
  ) => packagesToProcessNames.includes(item.name) === true);
};

const getDockerfile = async (packageName) => {
  const dockerfile = `packages/${packageName}/Dockerfile`;

  if (!(await fileExists(dockerfile))) {
    throw new Error(`Package has no Dockerfile: ${dockerfile}`);
  }

  return dockerfile;
};

const prepareImageToProcess = async (item, registry, release) => {
  const sliceIndexIncrementor = 1;
  const packageName = item.name.slice(item.name.indexOf('.') + sliceIndexIncrementor);

  const dockerfile = await getDockerfile(packageName);
  const branch = await getGitValue('rev-parse --abbrev-ref HEAD');
  const commitId = await getGitValue('rev-parse --short HEAD');

  return {
    dockerfile,
    latest: release,
    name: `${item.name}`,
    packageName,
    repoPath: registry ? `${registry}/${item.name}` : item.name,
    tag: release ? item.version : `${branch}-${commitId}`,
  };
};

const prepareImagesToProcess = async (packagesToProcess, registry, release) => {
  // Get tags after new package versions are set
  const packages = await getPackagesUpdatedData(packagesToProcess);

  const images = [];

  for (const item of packages) {
    const image = await prepareImageToProcess(
      item,
      registry,
      release,
    );

    images.push(image);
  }

  return images;
};

/* eslint-disable-next-line complexity */
const main = async () => {
  try {
    const args = getArgs(['registry', 'all', 'version', 'rebuild']);
    const version = await getVersion(args.version);
    const startPosition = 0;
    const endPosition = 10;
    const date = new Date().toJSON().slice(
      startPosition,
      endPosition,
    ).replace(
      /-/g,
      '-',
    );

    // Initial params to update version
    const params = [
      'version',
      version,
      '-m',
      `Build session ${date} [skip ci]`,
      '--yes',
      '--no-push',
    ];

    let packagesToProcess = [];

    if (args.rebuild || args.all || await forceByCommitAllPackagesToProcess()) {
      // If all packages should be updated
      packagesToProcess = await getPackages('packages');

      packagesToProcess = packagesToProcess.filter((
        packageToProcess,
      ) => packageToProcess.private === false);

      const packageSequenceString = packagesToProcess.map(({
        name,
      }) => name).join(',');

      params.push(`--force-publish=${packageSequenceString}`);
    } else {
      // If only changed packages should be updated
      packagesToProcess = await getPackages('changed');
    }

    const release = await isRelease();

    // Set new package versions but prevent push to git repository
    if (release && !args.rebuild) {
      await runLocalOrGlobalLibrary(
        'lerna',
        params,
      );
    }

    const images = await prepareImagesToProcess(
      packagesToProcess,
      args.registry,
      release,
    );

    // Save image data
    await saveImagesToProcess(images);

    // Set build version for project and add tag
    if (release && !args.rebuild) {
      await runLocalOrGlobalLibrary(
        'yarn',
        ['version', `--${version}`, '--message="Build v%s [skip ci]"'],
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }

  return [];
};

main();
