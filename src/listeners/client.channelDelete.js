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
    this.client.channels.resolve(monitoredChannel.displayChannel).messages.delete(monitoredChannel.displayMessage).catch(err => console.log(err));
  }

  async exec(channel) {
    if (!channel instanceof GuildChannel) return;

    let ds = this.client.datasource;

    let server = ds.servers[channel.guild.id];

    if (channel.type == 'voice') {
      if (server.monitoredChannels[channel.id]) {
        this.removeMessage(server.monitoredChannels[channel.id]);
        server.removeMonitoredChannel(channel.id);
        ds.removeMonitor(channel.id);
      }
    }

    if (channel.type == 'text') {
      for (snowflake in server.monitoredChannels) {
        if (server.monitoredChannels[snowflake].guildID = channel.guild.id) {
          server.removeMonitoredChannel(snowflake);
          ds.removeMonitor(snowflake);
        }
      }
    }
  }
}

module.exports = ChannelDeleteListener;