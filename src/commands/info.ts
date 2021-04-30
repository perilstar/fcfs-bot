import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import prettyMS from 'pretty-ms';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import sendmessage from '../util/sendmessage';

export default class InfoCommand extends Command {
  constructor() {
    super('info', {
      aliases: ['info', 'wr'],
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
    const channelMonitor = args.monitorChannel;

    if (!channelMonitor.initialised) {
      await channelMonitor.init();
    }

    const lines = [
      `Monitoring: ${channelMonitor.name} (ID ${channelMonitor.id})`,
      `Display: #${channelMonitor.displayChannelName} (ID ${channelMonitor.displayChannel})`,
      `Showing the first ${channelMonitor.displaySize} people in the queue`,
      `Rejoin Window: ${prettyMS(channelMonitor.rejoinWindow)}`,
      `AFK Check Duration: ${prettyMS(channelMonitor.afkCheckDuration)}`,
    ];

    sendmessage(<TextChannel> message.channel, `**Waiting Room Info**\n\`\`\`\n${lines.join('\n')}\n\`\`\``);
  }
}
