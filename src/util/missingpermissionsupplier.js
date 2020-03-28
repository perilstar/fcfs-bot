module.exports = (client, message) => {
  let server = client.datasource.servers[message.guild.id];
  let adminRoles = server.adminRoles;
  let member = client.guilds.resolve(message.guild.id).members.cache.get(message.author.id);

  if (member.roles.cache.some(adminRoles.includes) || member.permissions.has('ADMINISTRATOR')) {
    return null;
  }
  
  return 'user';
}