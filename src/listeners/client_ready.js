const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  async exec() {
    console.log('Getting client ready')
    await this.client.user.setActivity("fcfs!help");
    console.log('Client is ready!')
    await this.client.datasource.revUpThoseFryers();
  }
}

module.exports = ReadyListener;