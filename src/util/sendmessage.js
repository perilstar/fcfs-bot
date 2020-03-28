async function sendmessage(channel, text) {
  if (channel.deleted) return console.error('Failed to send message in deleted channel!');
  channel.send(text)
    .then(msg => {
      return msg;
    })
    .catch(err => {
      if (err.message == 'Missing Permissions') {
        console.error(`Failed to send message in #${channel.name} (ID #${channel.id}) due to Missing Permissions!`);
        return null;
      }
      throw(err);
    });
}

module.exports = sendmessage;