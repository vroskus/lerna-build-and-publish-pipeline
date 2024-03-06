/* eslint-disable no-console */

const {
  getImagesToProcess,
} = require('../helpers');

const imageName = process.argv[2];

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();
    const foundImages = images.filter(({
      name,
    }) => (name === imageName));

    if (foundImages.length === 1) {
      const {
        repoPath, tag,
      } = foundImages[0];

      console.log(`${repoPath}:${tag}`);
    } else {
      console.log('');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
