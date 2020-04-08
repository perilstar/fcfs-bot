const { Listener } = require('discord-akairo');
const { GuildChannel } = require('discord.js');

class ChannelDeleteListener extends Listener {
  constructor() {
    super('channelDelete', {
      emitter: 'client',
      event: 'channelDelete'
    });
  }

  async removeMessage(channelMonitor) {
    try {
      this.client.channels.resolve(channelMonitor.displayChannel).messages.delete(channelMonitor.displayMessage);
    } catch (err) {
      // Empty catch because this might fail if someone deletes a message and who cares
    }
  }

  async exec(channel) {
    if (!(channel instanceof GuildChannel)) return;

    let ds = this.client.dataSource;

    let server = ds.servers[channel.guild.id];

    if (channel.type == 'voice') {
      if (server.channelMonitors[channel.id]) {
        this.removeMessage(server.channelMonitors[channel.id]);
        ds.removeMonitor(server.id, channel.id);
      }
    }

    if (channel.type == 'text') {
      for (let snowflake in server.channelMonitors) {
        if (server.channelMonitors[snowflake].displayChannel == channel.id) {
          ds.removeMonitor(server.id, snowflake);
        }
      }
    }
  }
}

module.exports = ChannelDeleteListener;