const { Listener } = require('discord-akairo');

class VoiceStateUpdateListener extends Listener {
  constructor() {
    super('voiceStateUpdate', {
      emitter: 'client',
      event: 'voiceStateUpdate'
    });
  }

  async exec(oldState, newState) {
    if (oldState && oldState.channelID) {
      let guild = oldState.guild;
      if (guild.available) {
        let server = this.client.datasource.servers[guild.id];
        let monitoredChannel = server.monitoredChannels[oldState.channelID];
        if (monitoredChannel) monitoredChannel.timeoutRemoveUserFromQueue(oldState.id);
      } else {
        console.error('A guild was not available!');
      }      
    }

    if (newState && newState.channelID) {
      let guild = newState.guild;
      if (guild.available) {
        let server = this.client.datasource.servers[guild.id];
        let monitoredChannel = server.monitoredChannels[newState.channelID];
        if (monitoredChannel) monitoredChannel.addUserToQueue(newState.id);
      } else {
        console.error('A guild was not available!');
      }   
    }
  }
}

module.exports = VoiceStateUpdateListener;