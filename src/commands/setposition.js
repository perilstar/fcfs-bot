const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const mps = require('../util/missingpermissionsupplier');

class SetPositionCommand extends Command {
  constructor() {
    super('setposition', {
      aliases: ['setposition', 'sp'],
      split: 'quoted',
      userPermissions: (message) => mps(this.client, message),
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'member'
        },
        {
          id: 'position',
          type: 'integer'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!args.member) {
      return sendmessage(message.channel, `Error: Missing argument: \`member\`. Use fcfs!help for commands.`);
    }

    if (!args.position) {
      return sendmessage(message.channel, `Error: Missing argument: \`position\`. Use fcfs!help for commands.`);
    }

    let voiceState = args.member.voice;

    if (!voiceState.channelID) {
      return sendmessage(message.channel, `Error: \`${args.member.displayName}\` is not in a voice channel`);
    }

    let channelMonitor = server.channelMonitors[voiceState.channelID];

    if (!channelMonitor) {
      return sendmessage(message.channel, `Error: \`${args.member.displayName}\` is not in a monitored channel`);
    }

    let position = args.position - 1;
    let index = channelMonitor.queue.findIndex(user => user.id == args.member.id);
    channelMonitor.queue.splice(index, 1);
    channelMonitor.queue = [].concat(channelMonitor.queue.slice(0, position), args.member.user, channelMonitor.queue.slice(position));
    let newPosition = channelMonitor.queue.findIndex(user => user.id == args.member.id) + 1;
    channelMonitor.timeoutUpdateDisplay();
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `\`${args.member.displayName}\`'s new position in \`${channelMonitor.name}\`: ${newPosition}`);
  }
}

module.exports = SetPositionCommand;