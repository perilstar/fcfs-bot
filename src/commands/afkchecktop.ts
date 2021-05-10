/* eslint-disable max-len */
import { Command, FailureData } from 'discord-akairo';
import type { Message, TextChannel } from 'discord.js';
import { User } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import AFKChecker, { AFKCheckData } from '../struct/afk_checker';
import apf, { ArgParseFailure } from '../util/arg_parse_failure';
import mpsMod from '../util/mps_mod';
import sendmessage from '../util/sendmessage';

export default class AfkCheckTopCommand extends Command {
  constructor() {
    super('afkchecktop', {
      aliases: ['afkchecktop'],
      quoted: true,
      channel: 'guild',
      userPermissions: (message) => mpsMod(<FCFSClient> this.client, message),
      args: [
        {
          id: 'monitorChannel',
          type: 'monitorChannel',
          otherwise: (msg: Message, { failure }: FailureData) => apf(msg, 'monitorChannel', <ArgParseFailure> failure),
        },
      ],
    });
  }

  async exec(message: Message, args: any) {
    const client = <FCFSClient> this.client;

    const ds = client.dataSource;
    const server = ds.servers[message.guild!.id];

    const channelMonitor = args.monitorChannel;

    if (!channelMonitor.queue.length) {
      sendmessage(<TextChannel> message.channel, `Error: there are no members in queue in ${args.monitorChannel.name}`);
      return;
    }

    const update = (m: Message, data: AFKCheckData) => {
      let text = `Mass AFK-checking for ${channelMonitor.name}...\n\n`;
      if (data.recentlyChecked) text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over\n`;
      if (data.notInVC) text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over\n`;
      if (data.notAFK) text += `${data.notAFK} member(s) reacted to the message in time\n`;
      if (data.pushedBack) text += `${data.pushedBack} member(s) were pushed back 20 spots\n`;
      if (data.kicked) text += `${data.kicked} member(s) were booted from the queue\n`;

      m.edit(text).catch((err) => console.log(`Failed to update in mass check!\n${err.message}`));
    };

    const finalize = (m: Message, data: AFKCheckData) => {
      let text = `Mass AFK-checking complete for ${channelMonitor.name}!\n\n`;

      if (data.recentlyChecked) {
        text += `${data.recentlyChecked} member(s) were recently afk-checked and were skipped over:\n`;
        text += data.recentlyCheckedList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
        text += '\n';
      }

      if (data.notInVC) {
        text += `${data.notInVC} member(s) were not actually in the voice channel and were skipped over:\n`;
        text += data.notInVCList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
        text += '\n';
      }

      if (data.notAFK) {
        text += `${data.notAFK} member(s) reacted to the message in time:\n`;
        text += data.notAFKList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
        text += '\n';
      }

      if (data.pushedBack) {
        text += `${data.pushedBack} member(s) were pushed back 20 spots:\n`;
        text += data.pushedBackList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
        text += '\n';
      }

      if (data.kicked) {
        text += `${data.kicked} member(s) were booted from the queue:\n`;
        text += data.kickedList.map((member) => `${member.displayName} (${member.user.tag})`).join('\n');
      }

      m.edit(text).catch((err) => console.log(`Failed to finalize in mass check!\n${err.message}`));
    };

    const resultsMessage = await sendmessage(<TextChannel> message.channel, `Mass AFK-checking for ${channelMonitor.name}...`);

    if (!resultsMessage) {
      console.log('Failure creating results message for afkchecktop command');
      return;
    }

    const top = channelMonitor.queue.slice(0, channelMonitor.displaySize).map((user: User) => message.guild!.members.cache.get(user.id));

    const afkChecker = new AFKChecker(client, server, channelMonitor, top);

    afkChecker.on('update', (data) => {
      update(resultsMessage, data);
    });

    const results = await afkChecker.run();
    finalize(resultsMessage, results);
    afkChecker.removeAllListeners('update');
  }
}
