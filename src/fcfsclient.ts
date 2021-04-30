import { DMChannel, TextChannel } from 'discord.js';

import {
  AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler,
} from 'discord-akairo';

import DataSource from './struct/data_source';
import ReadyListener from './listeners/client_ready';
import ArgTypesRegistrar from './util/arg_types_registrar';

const { version } = require('../package.json');

require('dotenv').config();

const TOKEN = process.env.FCFS_BOT_TOKEN;

export default class FCFSClient extends AkairoClient {
  private _dataSource: DataSource;

  public get dataSource(): DataSource {
    return this._dataSource;
  }

  private _commandHandler: CommandHandler;

  public get commandHandler(): CommandHandler {
    return this._commandHandler;
  }

  private _listenerHandler: ListenerHandler;

  public get listenerHandler(): ListenerHandler {
    return this._listenerHandler;
  }

  private _inhibitorHandler: InhibitorHandler;

  public get inhibitorHandler(): InhibitorHandler {
    return this._inhibitorHandler;
  }

  private _version: string;

  public get version(): string {
    return this._version;
  }

  private _ready: boolean = false;

  public get ready(): boolean {
    return this._ready;
  }

  public set ready(value: boolean) {
    if (!value) return;
    this._ready = value;
  }

  constructor() {
    super({
      ownerID: ['148611805445357569', '346826796483870741'],
    }, {
      disableMentions: 'everyone',
    });

    this._dataSource = new DataSource(this);

    this._commandHandler = new CommandHandler(this, {
      directory: './src/commands/',
      prefix: (message): Array<string> | string => {
        if (message.channel instanceof TextChannel) {
          return ['fcfs!', this.dataSource.servers[message.channel.guild.id].prefix];
        }
        if (message.channel instanceof DMChannel) {
          return ['fcfs!', ''];
        }
        return '';
      },
      allowMention: true,
    });

    const atr = new ArgTypesRegistrar(this);
    atr.registerTypes();

    this._listenerHandler = new ListenerHandler(this, {
      directory: './src/listeners/',
    });

    this._inhibitorHandler = new InhibitorHandler(this, {});

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler,
    });

    // Other listeners are loaded after the bot is ready, in client_ready.js
    this.listenerHandler.load(ReadyListener);

    this._version = version;
  }

  public async start() {
    console.log('Logging in with token');
    return this.login(TOKEN);
  }
}
