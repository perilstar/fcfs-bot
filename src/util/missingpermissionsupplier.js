module.exports = (client, message) => {
  let server = client.datasource.servers[message.guild.id];
  let adminRoles = server.adminRoles;
  let member = client.guilds.resolve(message.guild.id).members.cache.get(message.author.id);
  let a = member.roles.cache.some(role => adminRoles.includes(role));
  let b = member.permissions.has('ADMINISTRATOR');
  if (a || b) {
    return null;
  }

  return 'botAdmin';
}