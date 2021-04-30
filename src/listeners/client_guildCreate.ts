import { Listener } from 'discord-akairo';
import type { Guild } from 'discord.js';
import type FCFSClient from '../fcfsclient';

class GuildCreateListener extends Listener {
  constructor() {
    super('guildCreate', {
      emitter: 'client',
      event: 'guildCreate',
    });
  }

  async exec(guild: Guild) {
    const client = <FCFSClient> this.client;
    if (!client.dataSource.servers[guild.id]) {
      client.dataSource.addServer(guild.id, 'fcfs!', [], [], []);
      client.dataSource.saveServer(guild.id);
    }
  }
}

module.exports = GuildCreateListener;
