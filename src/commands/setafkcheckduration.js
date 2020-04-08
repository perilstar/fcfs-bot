const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');
const prettyMS = require('pretty-ms');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');

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
          type: 'voiceChannel'
        },
        {
          id: 'afkCheckDuration',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.afkCheckDuration) {
      return sendmessage(message.channel, `Error: Missing or incorrect argument: \`afkCheckDuration\`. Use fcfs!help for commands.`);
    }

    let afkCheckDuration = parseDuration(args.afkCheckDuration);

    if (afkCheckDuration < 15000 || afkCheckDuration > 900000) {
      return sendmessage(message.channel, 'Error: `afkCheckDuration` must be between 15 sec and 15 min');
    }

    let ds = this.client.dataSource;
    let server = ds.servers[message.guild.id];

    if (!server.channelMonitors[args.monitorChannel.id]) {
      return sendmessage(message.channel, `Error: ${args.monitorChannel.name} is not being monitored!`);
    }

    let channelMonitor = server.channelMonitors[args.monitorChannel.id];

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.afkCheckDuration = afkCheckDuration;
    ds.saveMonitor(channelMonitor.id);

    return sendmessage(message.channel, `Successfully changed AFK check duration for ${channelMonitor.name} to ${prettyMS(afkCheckDuration)}!`);
  }
}

module.exports = SetAfkCheckDurationCommand;