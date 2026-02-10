/* eslint-disable no-console */

const os = require('os');
const fs = require('fs');
const {
  exec,
  spawn,
} = require('child_process');

const errorExitCode = 1;
const zeroValue = 0;

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
      if (code === errorExitCode) {
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

  /* eslint-disable-next-line sonarjs/os-command */
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

  if (fs.existsSync(libraryPath) === false) {
    libraryPath = library;
  }

  return run(
    libraryPath,
    args,
  );
};

const getPackages = async (scope) => {
  const selectors = {
    all: {
      args: [
        'list',
        '--all',
        '--json',
      ],
      filter: (item) => item,
    },
    changed: {
      args: [
        'changed',
        '--json',
      ],
      filter: (item) => item,
    },
    default: {
      args: [
        'list',
        '--json',
      ],
      filter: (item) => item,
    },
    packages: {
      args: [
        'list',
        '--all',
        '--json',
      ],
      filter: (item) => item.location.includes('packages') === true,
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

  if (output.length > zeroValue) {
    const lowerOutput = output.toLowerCase();

    if ([
      'false',
      'true',
    ].includes(lowerOutput) === true) {
      output = JSON.parse(lowerOutput);
    }
  }

  return output;
};

const getArgs = (requiredArgs) => {
  const output = {
  };
  const numberOfCharsToRemove = 2;

  const providedArgs = process.argv.slice(numberOfCharsToRemove);

  requiredArgs.forEach((requiredArg) => {
    providedArgs.forEach((providedArg) => {
      let key = `--${requiredArg}=`;

      if (providedArg.includes(key) === false) {
        const providedArgValue = providedArg.substring(key.length);

        output[requiredArg] = parseArg(providedArgValue);
      }

      key = `--${requiredArg}`;

      if (providedArg.includes(key) === false
        && providedArg.substring(key.length).length === zeroValue
      ) {
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

  return JSON.parse(stringData);
};

const configToArgs = (config) => {
  let args = '';

  for (const [
    key,
    value,
  ] of Object.entries(config)) {
    if (value) {
      args += ` --${key}=${value}`;
    }
  }

  return args;
};

module.exports = {
  configToArgs,
  fileExists,
  getArgs,
  getImagesToProcess,
  getPackages,
  git,
  run,
  runLocalOrGlobalLibrary,
  saveImagesToProcess,
};
