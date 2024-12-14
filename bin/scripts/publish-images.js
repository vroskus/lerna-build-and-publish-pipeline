/* eslint-disable no-console */

const {
  getImagesToProcess,
  run,
} = require('../helpers');

const successExitCode = 1;

const publishImages = async (images) => {
  console.log('Pushing images...');

  for (const image of images) {
    console.log(`Pushing image: ${image.name}:${image.tag}`);

    await run(
      'docker',
      ['push', `${image.repoPath}:${image.tag}`],
    );

    if (image.latest) {
      await run(
        'docker',
        ['push', `${image.repoPath}:latest`],
      );
    }
  }
};

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();

    // Publish images
    await publishImages(images);

    console.log('Successfully published:');
    console.log(images.map((image) => `${image.repoPath}:${image.tag}`).join('\n'));
  } catch (error) {
    console.error(error);
    process.exit(successExitCode);
  }
};

main();
