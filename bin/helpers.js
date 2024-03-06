/* eslint-disable no-console */

const os = require('os');
const fs = require('fs');
const {
  spawn, exec,
} = require('child_process');

const run = async (command, args) => new Promise(((resolve, reject) => {
  const child = spawn(
    command,
    args,
  );
  let output = null;

  let commandText = command;

  if (args) {
    commandText = `${command} ${args.join(' ')}`;
  }

  console.log(
    'Command: ',
    '\x1b[33m',
    commandText,
    '\x1b[0m\x1b[90m',
    '\n',
  );

  child.stdout.on(
    'data',
    (data) => {
      if (data) {
        console.log(data.toString());
        output = data;
      }
    },
  );

  child.on(
    'error',
    (error) => {
      console.log(error);
    },
  );

  child.stderr.on(
    'data',
    (data) => {
      if (data) {
        console.log(data.toString());
      }
    },
  );

  child.on(
    'close',
    (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Error code: ${code}`));
      }
    },
  );
}));

const git = async (command) => new Promise(((resolve, reject) => {
  const commandText = `git ${command}`;

  console.log(
    '\x1b[32m',
    commandText,
    '\x1b[0m\x1b[90m',
    '\n',
  );

  exec(
    commandText,
    (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    },
  );
}));

const runLocalOrGlobalLibrary = async (library, args) => {
  let libraryPath = `./node_modules/.bin/${library}`;

  try {
    await run(
      libraryPath,
      ['-v'],
    );
  } catch (e) {
    libraryPath = library;
  }

  return run(
    libraryPath,
    args,
  );
};

const getPackages = async (scope) => {
  const selectors = {
    default: {
      args: ['list', '--json'],
      filter: (item) => item,
    },
    all: {
      args: ['list', '--all', '--json'],
      filter: (item) => item,
    },
    changed: {
      args: ['changed', '--json'],
      filter: (item) => item,
    },
    packages: {
      args: ['list', '--all', '--json'],
      filter: (item) => item.location.indexOf('packages') !== -1,
    },
  };

  const selector = selectors[scope] || selectors.default;

  const response = await runLocalOrGlobalLibrary(
    'lerna',
    selector.args,
  );

  const list = JSON.parse(response);

  return list.filter((item) => selector.filter(item));
};

const parseArg = (value) => {
  let output = value;

  if (output.length > 0) {
    const lowerOutput = output.toLowerCase();

    if (['true', 'false'].indexOf(lowerOutput) !== -1) {
      output = JSON.parse(lowerOutput);
    }
  }

  return output;
};

const getArgs = (requiredArgs) => {
  const output = {
  };

  const providedArgs = process.argv.slice(2);

  requiredArgs.forEach((requiredArg) => {
    providedArgs.forEach((providedArg) => {
      let key = `--${requiredArg}=`;

      if (providedArg.indexOf(key) === 0) {
        const providedArgValue = providedArg.substring(key.length);

        output[requiredArg] = parseArg(providedArgValue);
      }

      key = `--${requiredArg}`;

      if (providedArg.indexOf(key) === 0 && providedArg.substring(key.length).length === 0) {
        output[requiredArg] = true;
      }
    });
  });

  return output;
};

const fileExists = (path) => new Promise((resolve) => {
  fs.exists(
    path,
    (error) => resolve(!!error),
  );
});

const tmpDir = os.tmpdir();
const filePath = `${tmpDir}/pipeline-changed-packages.json`;

const saveImagesToProcess = async (images) => {
  const stringData = JSON.stringify(images);

  fs.writeFileSync(
    filePath,
    stringData,
  );
};

const getImagesToProcess = async () => {
  const stringData = fs.readFileSync(filePath);
  const images = JSON.parse(stringData);

  return images;
};

const configToArgs = (config) => {
  let args = '';

  for (const [key, value] of Object.entries(config)) {
    if (value) {
      args += ` --${key}=${value}`;
    }
  }

  return args;
};

module.exports = {
  run,
  git,
  runLocalOrGlobalLibrary,
  getPackages,
  getArgs,
  fileExists,
  getImagesToProcess,
  saveImagesToProcess,
  configToArgs,
};
