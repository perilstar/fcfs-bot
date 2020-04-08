const { Listener } = require('discord-akairo');

class GuildCreateListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  async exec(guild) {
    if (!this.client.dataSource.servers[guild.id]) {
      this.client.dataSource.addServer(guild.id, 'fcfs!', [], [], []);
      this.client.dataSource.saveServer(guild.id);
    }
  }
}

module.exports = GuildCreateListener;