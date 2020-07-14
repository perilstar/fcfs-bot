const { Command, Argument, Flag } = require('discord-akairo');
const parseDuration = require('parse-duration');
const prettyMS = require('pretty-ms');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');
const Constants = require('../util/constants');

class SetAfkCheckDurationCommand extends Command {
  constructor() {
    super('setafkcheckduration', {
      aliases: ['setafkcheckduration', 'set-afkcheckduration', 'set-afk-check-duration', 'sacd'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'monitorChannel', failure)
        },
        {
          id: 'afkCheckDuration',
          type: (msg, phrase) => {
            let n = this.client.commandHandler.resolver.type('duration')(mesasge, phrase);
            if (Argument.isFailure(n)) return n;
            const min = Constants.AFKCheckDuration.MIN;
            const max = Constants.AFKCheckDuration.MAX;
            if (n < parseDuration(min) || n > parseDuration(max)) return Flag.fail({ reason: 'outOfRange', n, min, max });
            return n;
          },
          otherwise: (msg, { failure }) => apf(this.client, msg, 'afkCheckDuration', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    
    let channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.afkCheckDuration = args.afkCheckDuration;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully changed AFK check duration for ${channelMonitor.name} to ${prettyMS(args.afkCheckDuration)}!`);
  }
}

module.exports = SetAfkCheckDurationCommand;