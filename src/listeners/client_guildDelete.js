const { Listener } = require('discord-akairo');

class GuildDeleteListener extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete'
    });
  }

  async exec(guild) {
    this.client.datasource.removeServer(guild.id);
  }
}

module.exports = GuildDeleteListener;