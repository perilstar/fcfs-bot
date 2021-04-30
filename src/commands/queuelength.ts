import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import sendmessage from '../util/sendmessage';

export default class QueueLengthCommand extends Command {
  constructor() {
    super('queuelength', {
      aliases: ['queuelength', 'ql'],
      quoted: true,
      channel: 'guild',
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'monitorChannel', <ArgParseFailure> failure),
        },
      ],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async exec(message: Message, args: any) {
    if (!args.monitorChannel.initialised) {
      await args.monitorChannel.init();
    }

    sendmessage(
      <TextChannel> message.channel,
      `${args.monitorChannel.name} has ${args.monitorChannel.queue.length} people in it.`,
    );
  }
}
