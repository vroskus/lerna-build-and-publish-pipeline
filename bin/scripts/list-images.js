/* eslint-disable no-console */

const {
  getImagesToProcess,
} = require('../helpers');

const successExitCode = 1;

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();
    const output = images.map(({
      name, tag,
    }) => `"${name}:${tag}"`).join(', ');

    console.log(output);
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }
};

main();
