/* eslint-disable no-console */

const fs = require('fs');
const {
  getArgs,
  getPackages,
  git,
} = require('../helpers');

const identSize = 2;
const successExitCode = 1;

const getProjectVersion = () => {
  const packageJsonString = fs.readFileSync('./package.json');
  const packageJson = JSON.parse(packageJsonString);

  return packageJson.version;
};

const getLayouts = () => {
  const filePath = './layouts.json';
  let layouts = {
  };

  if (fs.existsSync(filePath)) {
    const layoutsString = fs.readFileSync(filePath);

    layouts = JSON.parse(layoutsString);
  }

  return layouts;
};

const saveLayouts = (layouts) => {
  const layoutsString = JSON.stringify(
    layouts,
    null,
    identSize,
  );

  fs.writeFileSync(
    './layouts.json',
    layoutsString,
  );
};

const main = async () => {
  try {
    const version = getProjectVersion();
    const layouts = getLayouts();
    const packages = await getPackages('packages');

    const layout = packages.map((item) => `${item.name}:${item.version}`);

    console.log(
      'Layout:',
      version,
      layout,
    );

    const {
      dry,
    } = getArgs([
      'dry',
    ]);

    if (dry !== true) {
      const updatedLayouts = {
        [version]: layout,
        ...layouts,
      };

      saveLayouts(updatedLayouts);

      await git('add .');
      await git(`commit -m "Layout update for version: ${version}"`);
    }
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }
};

main();
