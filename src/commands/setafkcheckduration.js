const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');

class SetAfkCheckDurationCommand extends Command {
  constructor() {
    super('setafkcheckduration', {
      aliases: ['setafkcheckduration', 'set-afkcheckduration', 'set-afk-check-duration', 'sacd'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'monitorChannel',
          type: 'string'
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
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.afkCheckDuration) {
      return message.channel.send(`Error: Missing argument: \`afkCheckDuration\`. Use fcfs!help for commands.`);
    }

    let afkCheckDuration = parseDuration(args.afkCheckDuration);

    if (afkCheckDuration < 15000 || afkCheckDuration > 900000) {
      return message.channel.send('Error: `afkCheckDuration` must be between 15 sec and 15 min');
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!server.channelMonitors[monitorChannel.id]) {
      return message.channel.send(`Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    let channelMonitor = server.channelMonitors[monitorChannel.id]

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    channelMonitor.afkCheckDuration = afkCheckDuration;
    ds.saveMonitor(channelMonitor.id);

    message.channel.send('Successfully changed!');
  }
}

module.exports = SetAfkCheckDurationCommand;