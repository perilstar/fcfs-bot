import { Listener } from 'discord-akairo';
import { VoiceState } from 'discord.js';
import type FCFSClient from '../fcfsclient';

export default class VoiceStateUpdateListener extends Listener {
  constructor() {
    super('voiceStateUpdate', {
      emitter: 'client',
      event: 'voiceStateUpdate',
    });
  }

  async exec(oldState: VoiceState, newState: VoiceState) {
    const client = <FCFSClient> this.client;

    if (oldState && oldState.channelID) {
      const { guild } = oldState;
      if (guild.available) {
        const server = client.dataSource.servers[guild.id];
        const channelMonitor = server.channelMonitors[oldState.channelID];
        if (channelMonitor) channelMonitor.timeoutRemoveUserFromQueue(oldState.id);
      } else {
        console.error('A guild was not available!');
      }
    }

    if (newState && newState.channelID) {
      const { guild } = newState;
      if (guild.available) {
        const server = client.dataSource.servers[guild.id];
        const channelMonitor = server.channelMonitors[newState.channelID];
        if (channelMonitor) channelMonitor.addUserToQueue(newState.id);
      } else {
        console.error('A guild was not available!');
      }
    }
  }
}
