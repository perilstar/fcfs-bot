const { Command } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');
const apf = require('../util/arg_parse_failure');

class QueueLengthCommand extends Command {
  constructor() {
    super('queuelength', {
      aliases: ['queuelength', 'ql'],
      split: 'quoted',
      channel: 'guild',
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg, { failure }) => apf(this.client, msg, 'monitorChannel', failure)
        }
      ]
    });
  }

  async exec(message, args) {
    if (!args.monitorChannel.initialised) {
      await args.monitorChannel.init();
    }

    return sendmessage(message.channel, `${args.monitorChannel.name} has ${args.monitorChannel.queue.length} people in it.`);
  }
}

module.exports = QueueLengthCommand;