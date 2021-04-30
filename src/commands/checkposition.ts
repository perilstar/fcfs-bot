import { Command, FailureData, Flag } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import sendmessage from '../util/sendmessage';

export default class CheckPositionCommand extends Command {
  constructor() {
    super('checkposition', {
      aliases: ['checkposition', 'position', 'p'],
      quoted: true,
      channel: 'guild',
      args: [
        {
          id: 'member',
          type: (message, phrase) => {
            const client = <FCFSClient> this.client;

            let member;

            if (phrase) {
              member = client.commandHandler.resolver.type('member')(message, phrase);
              if (!member) return Flag.fail({ reason: 'notAMember', phrase });
            } else {
              const guild = client.guilds.resolve(message.guild!.id);
              member = guild!.members.resolve(message.author.id);
            }

            const voiceState = member.voice;
            if (!voiceState.channelID) return Flag.fail({ reason: 'memberNotInVoice', member });

            const ds = client.dataSource;
            const server = ds.servers[message.guild!.id];
            const channelMonitor = server.channelMonitors[voiceState.channelID];
            if (!channelMonitor) return Flag.fail({ reason: 'memberNotInMonitoredChannel', member });

            return member;
          },
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'member', <ArgParseFailure> failure),
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const voiceState = args.member.voice;

    const channelMonitor = server.channelMonitors[voiceState.channelID];

    const position = channelMonitor.queue.findIndex((user) => user.id === args.member.id) + 1;

    sendmessage(
      <TextChannel> message.channel,
      `${args.member.displayName}'s position in ${channelMonitor.name}: ${position}`,
    );
  }
}
