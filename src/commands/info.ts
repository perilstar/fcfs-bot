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

    if (channelMonitor.afkCheckScheduler.interval !== -1) {
      const autoOutputChannel = message.guild!.channels.resolve(channelMonitor.autoOutput);

      if (autoOutputChannel) {
        lines.push(`Auto Checking every ${prettyMS(channelMonitor.afkCheckScheduler.interval)}`);
        lines.push(`Auto output directed to ${autoOutputChannel.name}`);
      } else {
        lines.push('Something went wrong checking auto AFK check output.');
        lines.push('Check your server configuration or re-set the automatic property with fcfs!setautomatic');
      }
    }

    sendmessage(<TextChannel> message.channel, `**Waiting Room Info**\n\`\`\`\n${lines.join('\n')}\n\`\`\``);
  }
}
