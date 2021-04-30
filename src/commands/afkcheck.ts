import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import AFKChecker from '../struct/afk_checker';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import mpsHelper from '../util/mps_helper';
import sendmessage from '../util/sendmessage';

export default class AfkCheckCommand extends Command {
  constructor() {
    super('afkcheck', {
      aliases: ['afkcheck', 'afk'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsHelper(<FCFSClient> this.client, message),
      args: [
        {
          id: 'member',
          type: 'queuedMember',
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'member', <ArgParseFailure> failure),
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const resultsMessage = await sendmessage(<TextChannel> message.channel, 'AFK Checking...');

    if (!resultsMessage) {
      console.log('Failure creating results message for afkcheck command');
      return;
    }

    const afkChecker = new AFKChecker(
      client,
      server,
      server.channelMonitors[args.member.voice.channelID],
      [args.member],
    );
    const results = await afkChecker.run();

    if (results.recentlyChecked > 0) {
      resultsMessage.edit('That user was recently AFK-Checked. Try again later.')
        .catch((err: Error) => console.log(`Failed to skip manual check!\n${err.message}`));
    } else if (results.afk > 0) {
      resultsMessage.edit('User is AFK. Removing them from the queue.')
        .catch((err: Error) => console.log(`Failed to update afk in manual check!\n${err.message}`));
    } else if (results.notAFK > 0) {
      resultsMessage.edit('User is not AFK. Keeping them in the queue.')
        .catch((err: Error) => console.log(`Failed to update not afk in manual check!\n${err.message}`));
    }
  }
}
