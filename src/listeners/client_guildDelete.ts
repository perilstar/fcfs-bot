import { Listener } from 'discord-akairo';
import type { Guild } from 'discord.js';
import type FCFSClient from '../fcfsclient';

class GuildDeleteListener extends Listener {
  constructor() {
    super('guildDelete', {
      emitter: 'client',
      event: 'guildDelete',
    });
  }

  async exec(guild: Guild) {
    const client = <FCFSClient> this.client;
    client.dataSource.removeServer(guild.id);
  }
}

module.exports = GuildDeleteListener;
