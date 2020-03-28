const { Listener } = require('discord-akairo');

class GuildCreateListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate'
    });
  }

  async exec(guild) {
    if (!this.client.datasource.servers[guild.id]) {
      this.client.datasource.addServer(guild.id, 'fcfs!', []);
      this.client.datasource.saveServer(guild.id);
    }
  }
}

module.exports = GuildCreateListener;