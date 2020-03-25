const FCFSClient = require('./src/fcfsclient');

const client = new FCFSClient();

client.start();


async function saveAndExit() {
  console.log('Saving...');
  await client.datasource.save();
  console.log('Data Saved.');
  process.exit(0)
}

process.on('SIGINT', saveAndExit);

process.on('message', (msg) => {
  if (msg == 'shutdown') saveAndExit();
});