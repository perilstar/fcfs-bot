import { Listener } from 'discord-akairo';
import type FCFSClient from '../fcfsclient';

export default class ReadyListener extends Listener {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
    });
  }

  async exec() {
    const client = <FCFSClient> this.client;

    console.log('Getting client ready');
    await client.user!.setActivity(`fcfs!help | v${client.version}`);
    setInterval(() => client.user!.setActivity(`fcfs!help | v${client.version}`), 60000);
    console.log('Client is ready!');
    if (client.ready) return;
    await client.dataSource.revUpThoseFryers();
    client.commandHandler.loadAll();
    client.commandHandler.useListenerHandler(client.listenerHandler);
    client.listenerHandler.loadAll(
      client.listenerHandler.directory,
      (path: string) => !path.includes('client_ready'),
    );

    client.ready = true;
  }
}
