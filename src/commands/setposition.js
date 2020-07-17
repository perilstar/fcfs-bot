const { Command, Argument, Flag } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const mps_mod = require('../util/mps_mod');
const apf = require('../util/arg_parse_failure');

class SetPositionCommand extends Command {
  constructor() {
    super('setposition', {
      aliases: ['setposition', 'sp'],
      split: 'quoted',
      userPermissions: (message) => mps_mod(this.client, message),
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: 'queuedMember',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'member', failure)
        },
        {
          id: 'position',
          type: (message, phrase) => {
            if (!phrase) return Flag.fail({ reason: 'missingArg' });
            const n = parseFloat(phrase);
            if (isNaN(n)) return Flag.fail({ reason: 'notANumber', phrase });
            return n;
          },
          otherwise: (msg, { failure }) => apf(this.client, msg, 'position', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];
    let channelMonitor = server.channelMonitors[args.member.voice.channelID];

    let position = args.position - 1;
    let index = channelMonitor.queue.findIndex(user => user.id === args.member.id);
    channelMonitor.queue.splice(index, 1);
    channelMonitor.queue = [].concat(channelMonitor.queue.slice(0, position), args.member.user, channelMonitor.queue.slice(position));
    let newPosition = channelMonitor.queue.findIndex(user => user.id === args.member.id) + 1;
    channelMonitor.timeoutUpdateDisplay();
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `${args.member.displayName}'s new position in ${channelMonitor.name}: ${newPosition}`);
  }
}

module.exports = SetPositionCommand;