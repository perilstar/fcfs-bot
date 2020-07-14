const { Flag, Argument } = require('discord-akairo');
const parseDuration = require('parse-duration');

class ArgTypesRegistrar {
  constructor(client) {
    this.client = client;
  }

  registerTypes() {
    const resolver = this.client.commandHandler.resolver;

    resolver.addType('required', (messsage, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      return phrase;
    });

    resolver.addType('roleCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      let role = resolver.type('role')(message, phrase);
      if (!role) return Flag.fail({ reason: 'notARole', phrase });

      return role;
    });

    // Filters BEFORE matching name, unlike default type
    resolver.addType('voiceChannelCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      
      let channels = resolver.type('channels')(message, phrase);
      if (!channels) return Flag.fail({ reason: 'notAVoiceChannel', phrase });

      let voiceChannels = channels.filter(channel => channel.type === 'voice');
      let voiceChannel = this.client.util.resolveChannel(phrase, voiceChannels);
      if (!voiceChannel) return Flag.fail({ reason: 'notAVoiceChannel', phrase });
      
      return voiceChannel;
    });

    // Filters BEFORE matching name, unlike default type
    resolver.addType('textChannelCustom', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      
      let channels = resolver.type('channels')(message, phrase);
      if (!channels) return Flag.fail({ reason: 'notATextChannel', phrase });

      let textChannels = channels.filter(channel => channel.type === 'text');
      let textChannel = this.client.util.resolveChannel(phrase, textChannels);
      if (!textChannel) return Flag.fail({ reason: 'notATextChannel', phrase });
      
      return textChannel;
    });

    resolver.addType('duration', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      
      let duration = parseDuration(phrase);
      return duration;
    });

    resolver.addType('monitorChannel', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });
      
      const voiceChannelCustomType = resolver.type('voiceChannelCustom');
      let voiceChannel = voiceChannelCustomType(message, phrase);
      if (Argument.isFailure(voiceChannel)) return Flag.fail({ reason: 'notAVoiceChannel', phrase });

      let ds = this.client.dataSource;
      let server = ds.servers[message.guild.id];
      let channelMonitor = server.channelMonitors[voiceChannel.id];
      if (!channelMonitor) return Flag.fail({ reason: 'channelNotMonitored', voiceChannel });

      return channelMonitor;
    });

    resolver.addType('queuedMember', (message, phrase) => {
      if (Argument.isFailure(phrase) || phrase === '') return Flag.fail({ reason: 'missingArg' });

      let member = resolver.type('member')(message, phrase);
      if (!member) return Flag.fail({ reason: 'notAMember', phrase });

      let voiceState = member.voice;
      if (!voiceState.channelID) return Flag.fail({ reason: 'memberNotInVoice', member });
  
      let ds = this.client.dataSource;
      let server = ds.servers[message.guild.id];
      let channelMonitor = server.channelMonitors[voiceState.channelID];
      if (!channelMonitor) return Flag.fail({ reason: 'memberNotInMonitoredChannel', member });

      return member;
    });
  }
}

module.exports = ArgTypesRegistrar;