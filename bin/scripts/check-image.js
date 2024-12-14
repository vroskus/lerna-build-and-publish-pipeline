/* eslint-disable no-console */

const {
  getImagesToProcess,
} = require('../helpers');

const successExitCode = 1;

const imageName = process.argv[2];

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();
    const foundImages = images.filter(({
      name,
    }) => (name === imageName));

    const allowedImagesAmount = 1;

    if (foundImages.length === allowedImagesAmount) {
      const {
        repoPath,
        tag,
      } = foundImages[0];

      console.log(`${repoPath}:${tag}`);
    } else {
      console.log('');
    }
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }
};

main();
