/* eslint-disable no-console */

const {
  run,
  getImagesToProcess,
} = require('../helpers');

const buildImages = async (images) => {
  console.log('Building images...');

  for (const image of images) {
    console.log(`Building image: ${image.name}:${image.tag}`);

    await run(
      'docker',
      [
        'image',
        'build',
        '-t',
        image.name,
        '-f',
        image.dockerfile,
        '.',
      ],
    );

    await run(
      'docker',
      ['image', 'tag', `${image.name}:latest`, `${image.repoPath}:${image.tag}`],
    );

    if (image.latest) {
      await run(
        'docker',
        ['image', 'tag', `${image.name}:latest`, `${image.repoPath}:latest`],
      );
    }
  }
};

const main = async () => {
  try {
    // Get list of images to process
    const images = await getImagesToProcess();

    // Build images
    await buildImages(images);

    console.log('Successfully built:');
    console.log(images.map((image) => `${image.name}:${image.tag}`).join('\n'));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
