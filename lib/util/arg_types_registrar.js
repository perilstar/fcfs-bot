"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const parse_duration_1 = __importDefault(require("parse-duration"));
class ArgTypesRegistrar {
    constructor(client) {
        this.client = client;
    }
    registerTypes() {
        const { resolver } = this.client.commandHandler;
        resolver.addType('required', (messsage, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            return phrase;
        });
        resolver.addType('roleCustom', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const role = resolver.type('role')(message, phrase);
            if (!role)
                return discord_akairo_1.Flag.fail({ reason: 'notARole', phrase });
            return role;
        });
        resolver.addType('voiceChannelCustom', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const channels = resolver.type('channels')(message, phrase);
            if (!channels)
                return discord_akairo_1.Flag.fail({ reason: 'notAVoiceChannel', phrase });
            const voiceChannels = channels.filter((channel) => channel.type === 'voice');
            const voiceChannel = this.client.util.resolveChannel(phrase, voiceChannels);
            if (!voiceChannel)
                return discord_akairo_1.Flag.fail({ reason: 'notAVoiceChannel', phrase });
            return voiceChannel;
        });
        resolver.addType('textChannelCustom', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const channels = resolver.type('channels')(message, phrase);
            if (!channels)
                return discord_akairo_1.Flag.fail({ reason: 'notATextChannel', phrase });
            const textChannels = channels.filter((channel) => channel.type === 'text');
            const textChannel = this.client.util.resolveChannel(phrase, textChannels);
            if (!textChannel)
                return discord_akairo_1.Flag.fail({ reason: 'notATextChannel', phrase });
            return textChannel;
        });
        resolver.addType('duration', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const duration = parse_duration_1.default(phrase);
            return duration;
        });
        resolver.addType('monitorChannel', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const voiceChannelCustomType = resolver.type('voiceChannelCustom');
            const voiceChannel = voiceChannelCustomType(message, phrase);
            if (discord_akairo_1.Argument.isFailure(voiceChannel))
                return discord_akairo_1.Flag.fail({ reason: 'notAVoiceChannel', phrase });
            const ds = this.client.dataSource;
            const server = ds.servers[message.guild.id];
            const channelMonitor = server.channelMonitors[voiceChannel.id];
            if (!channelMonitor)
                return discord_akairo_1.Flag.fail({ reason: 'channelNotMonitored', voiceChannel });
            return channelMonitor;
        });
        resolver.addType('queuedMember', (message, phrase) => {
            if (discord_akairo_1.Argument.isFailure(phrase) || phrase === '')
                return discord_akairo_1.Flag.fail({ reason: 'missingArg' });
            const member = resolver.type('member')(message, phrase);
            if (!member)
                return discord_akairo_1.Flag.fail({ reason: 'notAMember', phrase });
            const voiceState = member.voice;
            if (!voiceState.channelID)
                return discord_akairo_1.Flag.fail({ reason: 'memberNotInVoice', member });
            const ds = this.client.dataSource;
            const server = ds.servers[message.guild.id];
            const channelMonitor = server.channelMonitors[voiceState.channelID];
            if (!channelMonitor)
                return discord_akairo_1.Flag.fail({ reason: 'memberNotInMonitoredChannel', member });
            return member;
        });
    }
}
exports.default = ArgTypesRegistrar;
