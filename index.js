const FCFSClient = require('./src/fcfsclient');

const client = new FCFSClient();

client.start();


async function saveAndExit() {
  console.log('Saving...');
  try {
    await client.dataSource.save();
    console.log('Data Saved.');
    process.exit(0);
  } catch (err) {
    console.error('ERROR! Exiting forcefully.');
    process.exit(1);
  }
}

process.on('SIGINT', saveAndExit);

process.on('message', (msg) => {
  if (msg == 'shutdown') saveAndExit();
});