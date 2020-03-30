const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class CheckPositionCommand extends Command {
  constructor() {
    super('checkposition', {
      aliases: ['checkposition', 'position', 'p'],
      split: 'quoted',
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];
    let guild = this.client.guilds.resolve(message.guild.id);

    let member;

    if (args.member) {
      member = args.member;
    } else {
      member = guild.members.resolve(message.author.id);
    }
    let voiceState = member.voice;

    if (!voiceState.channelID) {
      return sendmessage(message.channel, `Error: \`${member.displayName}\` is not in a voice channel`);
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return sendmessage(message.channel, `Error: \`${member.displayName}\` is not in a monitored channel`);
    }

    let position = channelMonitor.queue.findIndex(user => user.id == member.id) + 1;

    return sendmessage(message.channel, `\`${member.displayName}\`'s position in \`${channelMonitor.name}\`: ${position}`)
  }
}

module.exports = CheckPositionCommand;