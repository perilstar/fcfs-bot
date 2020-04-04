const mps_mod = require('./mps_mod');

module.exports = (client, message) => {
  let server = client.datasource.servers[message.guild.id];
  let helperRoles = server.helperRoles;
  let member = client.guilds.resolve(message.guild.id).members.cache.get(message.author.id);
  let a = member.roles.cache.some(role => helperRoles.includes(role.id));
  let b = mps_mod(client, message);
  if (a || !b) {
    return null;
  }

  return 'botHelper';
}