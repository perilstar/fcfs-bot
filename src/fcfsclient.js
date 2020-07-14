const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { TextChannel } = require('discord.js');
const DataSource = require('./struct/data_source');
const ReadyListener = require('./listeners/client_ready');
const ArgTypesRegistrar = require('./util/arg_types_registrar');

const TOKEN = process.env.FCFS_BOT_TOKEN;
const version = require('../package.json').version;

class FCFSClient extends AkairoClient {
  constructor() {
    super({
      ownerID: ['148611805445357569', '346826796483870741']
    }, {
      disableEveryone: true
    });

    this.dataSource = new DataSource(this);

    this.commandHandler = new CommandHandler(this, {
      directory: './src/commands/',
      prefix: message => {
        if (message.channel instanceof TextChannel) {
          return ['fcfs!', this.dataSource.servers[message.guild.id].prefix];
        } else {
          return ['fcfs!', ''];
        }
      },
      allowMention: true
    });

    let atr = new ArgTypesRegistrar(this);
    atr.registerTypes();

    this.listenerHandler = new ListenerHandler(this, {
        directory: './src/listeners/'
    });

    this.inhibitorHandler = new InhibitorHandler(this, {});

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    // Other listeners are loaded after the bot is ready, in client_ready.js
    this.listenerHandler.load(ReadyListener);

    this.version = version;
  }

  async start() {
    console.log('Logging in with token');
    return this.login(TOKEN);
  }
}

module.exports = FCFSClient;