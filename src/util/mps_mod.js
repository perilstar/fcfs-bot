const mps_admin = require('./mps_admin');

module.exports = (client, message) => {
  let server = client.dataSource.servers[message.guild.id];
  let modRoles = server.modRoles;
  let member = client.guilds.resolve(message.guild.id).members.cache.get(message.author.id);
  let a = member.roles.cache.some(role => modRoles.includes(role.id));
  let b = mps_admin(client, message);
  if (a || !b) {
    return null;
  }

  return 'botMod';
};