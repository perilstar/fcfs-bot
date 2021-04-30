import { Snowflake } from 'discord.js';
import type FCFSClient from '../fcfsclient';
import ChannelMonitor, { ChannelMonitorData } from './channel_monitor';

export default class Server {
  private client: FCFSClient;

  public id: Snowflake;

  public prefix: string;

  public channelMonitors: { [snowflake: string]: ChannelMonitor };

  public adminRoles: any;

  public modRoles: any;

  public helperRoles: any;

  constructor(
    client: FCFSClient,
    id: string,
    prefix: string,
    adminRoles: Array<string>,
    modRoles: Array<string>,
    helperRoles: Array<string>,
  ) {
    this.client = client;
    this.id = id;
    this.prefix = prefix;

    this.channelMonitors = {};
    this.adminRoles = adminRoles;
    this.modRoles = modRoles;
    this.helperRoles = helperRoles;
  }

  public addChannelMonitor(data: ChannelMonitorData) {
    const channelMonitor = new ChannelMonitor(this.client, data);
    this.channelMonitors[data.id] = channelMonitor;
    return this.channelMonitors[data.id];
  }

  public removeChannelMonitor(id: string) {
    delete this.channelMonitors[id];
  }

  public async initMonitors() {
    // eslint-disable-next-line arrow-body-style
    const initMonitorTasks: Array<Promise<void>> = Object.keys(this.channelMonitors).map((id) => {
      return this.channelMonitors[id].init();
    });

    await Promise.all(initMonitorTasks);
  }
}
