const { Command } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

class DeleteWaitingRoomCommand extends Command {
  constructor() {
    super('deletewaitingroom', {
      aliases: ['deletewaitingroom', 'dwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'afkCheckDuration', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.dataSource;
    ds.removeMonitor(message.guild.id, args.monitorChannel.id);

    return sendmessage(message.channel, 'Successfully deleted!');
  }
}

module.exports = DeleteWaitingRoomCommand;