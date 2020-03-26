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
        let channelMonitor = server.channelMonitors[oldState.channelID];
        if (channelMonitor) channelMonitor.timeoutRemoveUserFromQueue(oldState.id);
      } else {
        console.error('A guild was not available!');
      }      
    }

    if (newState && newState.channelID) {
      let guild = newState.guild;
      if (guild.available) {
        let server = this.client.datasource.servers[guild.id];
        let channelMonitor = server.channelMonitors[newState.channelID];
        if (channelMonitor) channelMonitor.addUserToQueue(newState.id);
      } else {
        console.error('A guild was not available!');
      }   
    }
  }
}

module.exports = VoiceStateUpdateListener;