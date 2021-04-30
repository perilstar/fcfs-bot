import { Channel } from 'discord.js';

import { Flag, Argument } from 'discord-akairo';
import parseDuration from 'parse-duration';
import type FCFSClient from '../fcfsclient';

export default class ArgTypesRegistrar {
  private client: FCFSClient;

  constructor(client: FCFSClient) {
    this.client = client;
  }

  public registerTypes() {
    const { resolver } = this.client.commandHandler;

    resolver.addType('required', (messsage, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      return phrase;
    });

    resolver.addType('roleCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const role = resolver.type('role')(message, phrase);
      if (!role) return Flag.fail({ reason: 'notARole', phrase });

      return role;
    });

    // Filters BEFORE matching name, unlike default type
    resolver.addType('voiceChannelCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const channels = resolver.type('channels')(message, phrase);
      if (!channels) return Flag.fail({ reason: 'notAVoiceChannel', phrase });

      const voiceChannels = channels.filter((channel: Channel) => channel.type === 'voice');
      const voiceChannel = this.client.util.resolveChannel(phrase, voiceChannels);
      if (!voiceChannel) return Flag.fail({ reason: 'notAVoiceChannel', phrase });

      return voiceChannel;
    });

    // Filters BEFORE matching name, unlike default type
    resolver.addType('textChannelCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const channels = resolver.type('channels')(message, phrase);
      if (!channels) return Flag.fail({ reason: 'notATextChannel', phrase });

      const textChannels = channels.filter((channel: Channel) => channel.type === 'text');
      const textChannel = this.client.util.resolveChannel(phrase, textChannels);
      if (!textChannel) return Flag.fail({ reason: 'notATextChannel', phrase });

      return textChannel;
    });

    resolver.addType('duration', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const duration = parseDuration(phrase);
      return duration;
    });

    resolver.addType('monitorChannel', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const voiceChannelCustomType = resolver.type('voiceChannelCustom');
      const voiceChannel = voiceChannelCustomType(message, phrase);
      if (Argument.isFailure(voiceChannel)) return Flag.fail({ reason: 'notAVoiceChannel', phrase });

      const ds = this.client.dataSource;
      const server = ds.servers[message.guild!.id];
      const channelMonitor = server.channelMonitors[voiceChannel.id];
      if (!channelMonitor) return Flag.fail({ reason: 'channelNotMonitored', voiceChannel });

      return channelMonitor;
    });

    resolver.addType('queuedMember', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      const member = resolver.type('member')(message, phrase);
      if (!member) return Flag.fail({ reason: 'notAMember', phrase });

      const voiceState = member.voice;
      if (!voiceState.channelID) return Flag.fail({ reason: 'memberNotInVoice', member });

      const ds = this.client.dataSource;
      const server = ds.servers[message.guild!.id];
      const channelMonitor = server.channelMonitors[voiceState.channelID];
      if (!channelMonitor) return Flag.fail({ reason: 'memberNotInMonitoredChannel', member });

      return member;
    });
  }
}
