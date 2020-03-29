const { Listener } = require('discord-akairo');
const { TextChannel } = require('discord.js');

class RoleDeleteListener extends Listener {
  constructor() {
    super('roleDelete', {
      emitter: 'client',
      event: 'roleDelete'
    });
  }

  async exec(role) {
    let guild = role.guild;

    let ds = this.client.datasource;

    let server = ds.servers[guild.id];

    let index = server.adminRoles.indexOf(role.id);
    if (index != -1) {
      server.adminRoles.splice(index, 1);
      ds.saveServer(server.id);
    }
    
  }
}

module.exports = RoleDeleteListener;