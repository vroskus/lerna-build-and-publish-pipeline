const {
  getImagesToProcess,
} = require('../helpers');

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();
    const output = images.map(({ name, tag }) => `"${name}:${tag}"`).join(', ');

    console.log(output);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
