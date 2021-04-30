import { Listener } from 'discord-akairo';
import type { TextChannel, Channel } from 'discord.js';
import { GuildChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import type ChannelMonitor from '../struct/channel_monitor';

class ChannelDeleteListener extends Listener {
  constructor() {
    super('channelDelete', {
      emitter: 'client',
      event: 'channelDelete',
    });
  }

  static async removeMessage(channelMonitor: ChannelMonitor, client: FCFSClient) {
    try {
      const displayChannel: TextChannel = <TextChannel> client.channels.resolve(channelMonitor.displayChannel);
      displayChannel.messages.delete(channelMonitor.displayMessage);
    } catch (err) {
      // Empty catch because this might fail if someone deletes a message and who cares
    }
  }

  async exec(channel: Channel) {
    const client = <FCFSClient> this.client;

    if (!(channel instanceof GuildChannel)) return;

    const ds = client.dataSource;

    const server = ds.servers[channel.guild.id];

    if (channel.type === 'voice') {
      if (server.channelMonitors[channel.id]) {
        ChannelDeleteListener.removeMessage(server.channelMonitors[channel.id], client);
        ds.removeMonitor(server.id, channel.id);
      }
    }

    if (channel.type === 'text') {
      Object.keys(server.channelMonitors).forEach((snowflake) => {
        if (server.channelMonitors[snowflake].displayChannel === channel.id) {
          ds.removeMonitor(server.id, snowflake);
        }
      });
    }
  }
}

module.exports = ChannelDeleteListener;
