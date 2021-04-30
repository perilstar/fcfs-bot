import {
  Snowflake, VoiceChannel, TextChannel, User, Util,
} from 'discord.js';

import type FCFSClient from '../fcfsclient';
import AFKCheckScheduler from './afk_check_scheduler';

export interface ChannelMonitorData {
  guildID: Snowflake;
  id: string;
  displayChannel: Snowflake;
  displayMessage: Snowflake;
  rejoinWindow: number;
  displaySize: number;
  afkCheckDuration: number;
  snowflakeQueue: Array<Snowflake>;
  automatic: number;
  autoOutput: Snowflake | null;
}

export default class ChannelMonitor {
  private _client: FCFSClient;

  public get client(): FCFSClient {
    return this._client;
  }

  private _guildID: Snowflake;

  public get guildID(): Snowflake {
    return this._guildID;
  }

  private _id: string;

  public get id(): string {
    return this._id;
  }

  private _displayChannel: Snowflake;

  public get displayChannel(): Snowflake {
    return this._displayChannel;
  }

  private _displayMessage: Snowflake;

  public get displayMessage(): Snowflake {
    return this._displayMessage;
  }

  private _rejoinWindow: number;

  public get rejoinWindow(): number {
    return this._rejoinWindow;
  }

  private _displaySize: number;

  public get displaySize(): number {
    return this._displaySize;
  }

  private _afkCheckDuration: number;

  public get afkCheckDuration(): number {
    return this._afkCheckDuration;
  }

  private _lastAfkChecked: { [snowflake: string]: number; };

  public get lastAfkChecked(): { [snowflake: string]: number; } {
    return this._lastAfkChecked;
  }

  // eslint-disable-next-line no-undef
  private removalTimers: {[snowflake: string]: NodeJS.Timeout};

  private snowflakeQueue: Array<Snowflake>;

  private automatic: number;

  private _autoOutput: Snowflake | null;

  public get autoOutput(): Snowflake | null {
    return this._autoOutput;
  }

  public set autoOutput(snowflake: Snowflake | null) {
    this._autoOutput = snowflake;
  }

  private _initialised: boolean;

  public get initialised(): boolean {
    return this._initialised;
  }

  private initialising: boolean;

  private channel: VoiceChannel | null = null;

  private _name: string | null = null;

  public get name(): string | null {
    return this._name;
  }

  private _displayChannelName: string | null = null;

  public get displayChannelName(): string | null {
    return this._displayChannelName;
  }

  private _afkCheckScheduler: AFKCheckScheduler | null = null;

  public get afkCheckScheduler(): AFKCheckScheduler | null {
    return this._afkCheckScheduler;
  }

  private _queue: Array<User> = [];

  public get queue(): Array<User> {
    return this._queue;
  }

  public set queue(data: Array<User>) {
    this._queue = data;
  }

  // eslint-disable-next-line no-undef
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(client: FCFSClient, data: ChannelMonitorData) {
    this._client = client;

    this._guildID = data.guildID;
    this._id = data.id;

    this._displayChannel = data.displayChannel;
    this._displayMessage = data.displayMessage;

    this._rejoinWindow = data.rejoinWindow;
    this._displaySize = data.displaySize;
    this._afkCheckDuration = data.afkCheckDuration;

    this._lastAfkChecked = {};
    this.removalTimers = {};

    this.snowflakeQueue = data.snowflakeQueue;
    this.automatic = data.automatic;
    this._autoOutput = data.autoOutput;

    this._initialised = false;
    this.initialising = false;
  }

  public async init() {
    if (this.initialised || this.initialising) return;
    this.initialising = true;

    this.channel = <VoiceChannel> this.client.channels.resolve(this.id);
    if (!this.channel) return;
    this._name = this.channel.name;

    const displayChannelObj: VoiceChannel = <VoiceChannel> this.client.channels.resolve(this.displayChannel);
    if (!displayChannelObj) return;
    this._displayChannelName = displayChannelObj.name;

    await this.populateQueue(this.snowflakeQueue);

    this.updateDisplay();

    this._afkCheckScheduler = new AFKCheckScheduler(this.client, this, this.automatic);
    this._afkCheckScheduler.start();

    this._initialised = true;
    this.initialising = false;
  }

  private async populateQueue(_snowflakeQueue: Array<Snowflake>) {
    // Get rid of users who aren't in the channel anymore
    const snowflakeQueue = _snowflakeQueue.filter((id) => this.channel!.members.get(id) !== undefined);

    this._queue = [];

    // Get users from queue data
    // eslint-disable-next-line arrow-body-style
    await Promise.all(snowflakeQueue.map((snowflake) => {
      return this.client.users.fetch(snowflake);
    })).then((users) => {
      this._queue = users.filter(Boolean);
    });

    // If there's users missing from the queue, add them in a random order
    if (this.queue.length < this.channel!.members.size) {
      const currentlyConnected = this.channel!.members;
      const rest = currentlyConnected
        .random(currentlyConnected.size)
        .filter((user) => !this.queue.some((u) => u.id === user.id));

      rest.forEach((guildMember) => {
        this.queue.push(guildMember.user);
      });
    }

    this._queue = this.queue.filter((value, index, self) => self.indexOf(value) === index);

    this.client.dataSource.saveMonitor(this.id);
  }

  private get message() {
    const guild = this.client.guilds.resolve(this.guildID);
    if (!guild) return 'BIG FAILURE UH OH';

    const title = `**${this.name} Queue:**`;
    const top = this.queue.slice(0, this.displaySize).map((user, index) => {
      const member = guild.members.cache.get(user.id);
      if (!member) return 'Something went wrong retrieving this user!';
      return `${index + 1}. ${member.displayName} (${user.tag})`;
    }).join('\n');

    return `${title}\n\`\`\`\n${top ?? '<EMPTY>'}\n\`\`\``;
  }

  public async addUserToQueue(userID: Snowflake) {
    if (!this.initialised) await this.init();
    if (this.removalTimers[userID]) {
      clearTimeout(this.removalTimers[userID]);
      delete this.removalTimers[userID];
    } else {
      const user = this.client.users.resolve(userID);
      if (!user) return;
      this.queue.push(user);
      this.timeoutUpdateDisplay();
      this.client.dataSource.saveMonitor(this.id);
    }
  }

  public timeoutRemoveUserFromQueue(userID: Snowflake) {
    const removeIndex = this.queue.findIndex((el) => el.id === userID);
    if (removeIndex === -1) return;
    this.removalTimers[userID] = setTimeout(() => {
      this.removeUserFromQueue(userID);
    }, this.rejoinWindow);
  }

  public async removeUserFromQueue(userID: Snowflake) {
    if (!this.initialised) await this.init();
    const removeIndex = this.queue.findIndex((el) => el.id === userID);
    if (removeIndex === -1) return;
    this.queue.splice(removeIndex, 1);
    this.timeoutUpdateDisplay();
    this.client.dataSource.saveMonitor(this.id);
    delete this.removalTimers[userID];
  }

  public timeoutUpdateDisplay() {
    if (this.updateTimer) return;
    this.updateTimer = setTimeout(() => this.updateDisplay(), 1500);
  }

  public async updateDisplay() {
    if (!this.initialised) await this.init();
    this.updateTimer = null;
    try {
      const displayChannelObj: TextChannel = <TextChannel> this.client.channels.resolve(this.displayChannel);
      if (!displayChannelObj) return;
      displayChannelObj.messages.fetch(this.displayMessage).then((message) => {
        const messageText = this.message;
        if (!messageText) return;
        message.edit(Util.removeMentions(messageText));
      });
    } catch (err) {
      console.log(err);
    }
  }
}
