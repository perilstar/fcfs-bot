const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');

class DeleteWaitingRoomCommand extends Command {
  constructor() {
    super('deletewaitingroom', {
      aliases: ['deletewaitingroom', 'dwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: mps,
      args: [
        {
          id: 'monitorChannel',
          type: 'string',
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel) {
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!monitorChannel) {
      return message.channel.send(`Error: couldn't find a channel called \`${args.monitorChannel}\`!`);
    }

    if (!server.channelMonitors[monitorChannel.id]) {
      return message.channel.send(`Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    ds.removeMonitor(message.guild.id, monitorChannel.id);

    message.channel.send('Successfully deleted!');
  }
}

module.exports = DeleteWaitingRoomCommand;