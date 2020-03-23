const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const DataSource = require('./struct/datasource');

const TOKEN = process.env.FCFS_BOT_TOKEN;

class FCFSClient extends AkairoClient {
  constructor() {
    super({
      ownerID: ['148611805445357569', '346826796483870741']
    }, {
      disableEveryone: true
    });

    this.datasource = new DataSource(this);

    this.commandHandler = new CommandHandler(this, {
      directory: './src/commands/',
      prefix: message => {
        return ['fcfs!', this.datasource.servers[message.guild.id].prefix];
      },
      allowMention: true
    });

    this.listenerHandler = new ListenerHandler(this, {
        directory: './src/listeners/'
    });

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      datasource: this.datasource
    });

    this.commandHandler.loadAll(); 
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll(); 
  }

  async start() {
    console.log('Logging in with token');
    return this.login(TOKEN);
  }
}

module.exports = FCFSClient;