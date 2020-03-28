const { Command } = require('discord-akairo');

class CheckPositionCommand extends Command {
  constructor() {
    super('checkposition', {
      aliases: ['checkposition', 'position', 'p'],
      split: 'quoted',
      channel: 'guild'
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];
    let guild = this.client.guilds.resolve(message.guild.id);

    let member = guild.members.resolve(message.author.id);
    let voiceState = member.voice;

    if (!voiceState.channelID) {
      return message.channel.send('Error: You are not in a voice channel');
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return message.channel.send('Error: You are not in a monitored channel');
    }

    let position = channelMonitor.queue.findIndex(user => user.id == message.author.id) + 1;

    return message.channel.send(`${member.displayName}'s position in ${channelMonitor.name}: ${position}`)
  }
}

module.exports = CheckPositionCommand;