const { Listener } = require('discord-akairo');
const { TextChannel } = require('discord.js');

class MessageDeleteListener extends Listener {
  constructor() {
    super('messageDelete', {
      emitter: 'client',
      event: 'messageDelete'
    });
  }

  async exec(message) {
    let channel = message.channel;
    if (!(channel instanceof TextChannel)) return;

    let ds = this.client.dataSource;

    let server = ds.servers[channel.guild.id];

    for (let snowflake in server.channelMonitors) {
      if (server.channelMonitors[snowflake].displayMessage === message.id) {
        ds.removeMonitor(server.id, snowflake);
      }
    }
    
  }
}

module.exports = MessageDeleteListener;