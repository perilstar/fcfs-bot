const { Command } = require('discord-akairo');
const mps = require('../util/missingpermissionsupplier');
const sendmessage = require('../util/sendmessage');

class DeleteWaitingRoomCommand extends Command {
  constructor() {
    super('deletewaitingroom', {
      aliases: ['deletewaitingroom', 'dwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps(this.client, message),
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
      return sendmessage(message.channel, `Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());

    if (!monitorChannel) {
      return sendmessage(message.channel, `Error: couldn't find a channel called \`${args.monitorChannel}\`!`);
    }

    if (!server.channelMonitors[monitorChannel.id]) {
      return sendmessage(message.channel, `Error: couldn't find a channel called \`${args.monitorChannel}\` that's being monitored!`);
    }

    ds.removeMonitor(message.guild.id, monitorChannel.id);

    return sendmessage(message.channel, 'Successfully deleted!');
  }
}

module.exports = DeleteWaitingRoomCommand;