module.exports = (channel, text) => {
  if (channel.deleted) return console.error('Failed to send message in deleted chanenl!');
  channel.send(text).catch(err => {
    if (err.message == 'Missing Permissions') {
      return console.error(`Failed to send message in ${channel.name} (ID #${channel.id}) due to Missing Permissions!`);
    }
    throw(err);
  })
}