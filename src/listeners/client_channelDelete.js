const { Listener } = require('discord-akairo');
const { GuildChannel } = require('discord.js');

class ChannelDeleteListener extends Listener {
  constructor() {
    super('channelDelete', {
      emitter: 'client',
      event: 'channelDelete'
    });
  }

  async removeMessage(monitoredChannel) {
    try {
      this.client.channels.resolve(monitoredChannel.displayChannel).messages.delete(monitoredChannel.displayMessage);
    } catch (err) {
      // Empty catch because this might fail if someone deletes a message and who cares
    }
  }

  async exec(channel) {
    if (!channel instanceof GuildChannel) return;

    let ds = this.client.datasource;

    let server = ds.servers[channel.guild.id];

    if (channel.type == 'voice') {
      if (server.monitoredChannels[channel.id]) {
        this.removeMessage(server.monitoredChannels[channel.id]);
        ds.removeMonitor(server.id, channel.id);
      }
    }

    if (channel.type == 'text') {
      for (let snowflake in server.monitoredChannels) {
        if (server.monitoredChannels[snowflake].guildID = channel.guild.id) {
          ds.removeMonitor(server.id, snowflake);
        }
      }
    }
  }
}

module.exports = ChannelDeleteListener;