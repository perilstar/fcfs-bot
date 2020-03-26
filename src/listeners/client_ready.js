const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    });
  }

  async exec() {
    console.log('Getting client ready');
    await this.client.user.setActivity("fcfs!help");
    console.log('Client is ready!');
    if (this.client.ready) return;
    await this.client.datasource.revUpThoseFryers();
    this.client.commandHandler.loadAll(); 
    this.client.commandHandler.useListenerHandler(this.listenerHandler);
    this.client.listenerHandler.loadAll(this.client.listenerHandler.directory, path => !path.includes('client_ready.js'));
    this.client.ready = true;
  }
}

module.exports = ReadyListener;