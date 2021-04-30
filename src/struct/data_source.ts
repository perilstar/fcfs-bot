import { Snowflake, TextChannel } from 'discord.js';
import fs from 'fs';
import sqlite, { Database } from 'sqlite';
import type FCFSClient from '../fcfsclient';
import dbupdate from '../util/dbupdate';
import Server from './server';

export default class DataSource {
  private client: FCFSClient;

  private _servers: { [snowflake: string]: Server; };

  public get servers(): { [snowflake: string]: Server; } {
    return this._servers;
  }

  private removeMonitorSnowflakes: Snowflake[];

  private removeServerSnowflakes: Snowflake[];

  private saveServerSnowflakes: Snowflake[];

  private saveMonitorSnowflakes: Snowflake[];

  // eslint-disable-next-line no-undef
  private saveTimer: NodeJS.Timeout | null = null;;

  constructor(client: FCFSClient) {
    this.client = client;
    this._servers = {};

    this.removeMonitorSnowflakes = [];
    this.removeServerSnowflakes = [];

    this.saveServerSnowflakes = [];
    this.saveMonitorSnowflakes = [];
  }

  public async revUpThoseFryers() {
    await DataSource.init();
    await this.load();
    await this.cleanupDeleted();
    await this.addMissed();
    await this.initServers();
    await this.save();
  }

  private static async init() {
    if (!fs.existsSync('./db')) fs.mkdirSync('./db');

    const db = await sqlite.open('./db/fcfs.db');

    const tableExists = await db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'server\'');
    if (!tableExists) {
      await db.run(`CREATE TABLE IF NOT EXISTS monitor (
        id TEXT PRIMARY KEY ,
        guild_id TEXT ,
        display_channel TEXT ,
        display_message TEXT ,
        display_size INTEGER ,
        rejoin_window INTEGER ,
        afk_check_duration INTEGER ,
        queue TEXT ,
        automatic INTEGER ,
        auto_output TEXT
      )`);

      await db.run(`CREATE TABLE IF NOT EXISTS server (
        id TEXT PRIMARY KEY ,
        bot_prefix TEXT ,
        admin_roles TEXT ,
        mod_roles TEXT ,
        helper_roles TEXT  
      )`);

      await db.run('PRAGMA user_version = 3');
    }

    await dbupdate(db);

    await db.close();
  }

  private async load() {
    const db = await sqlite.open('./db/fcfs.db');

    let sql = 'SELECT * FROM server';
    let result = await db.all(sql, []);

    result.forEach((row) => {
      const adminRoles = (row.admin_roles ?? '').split(',').filter(Boolean);
      const modRoles = (row.mod_roles ?? '').split(',').filter(Boolean);
      const helperRoles = (row.helper_roles ?? '').split(',').filter(Boolean);

      this.addServer(row.id, row.bot_prefix ?? 'fcfs!', adminRoles, modRoles, helperRoles);
    });

    sql = 'SELECT * FROM monitor';
    result = await db.all(sql, []);

    result.forEach((row) => {
      const data = {
        id: row.id,
        guildID: row.guild_id,
        displayChannel: row.display_channel,
        displayMessage: row.display_message,
        displaySize: row.display_size,
        rejoinWindow: row.rejoin_window,
        afkCheckDuration: row.afk_check_duration,
        snowflakeQueue: row.queue.split(',').filter(Boolean),
        automatic: row.automatic ?? -1,
        autoOutput: row.auto_output,
      };

      if (!this.servers[row.guild_id]) {
        this.addServer(row.guild_id, 'fcfs!', [], [], []);
        this.saveServerSnowflakes.push(row.guild_id);
      }
      this.servers[row.guild_id].addChannelMonitor(data);
    });

    await db.close();
  }

  private async cleanupDeleted() {
    Object.keys(this.servers).forEach((id) => {
      const server = this.servers[id];
      const guild = this.client.guilds.resolve(id);
      if (!guild || guild.deleted) {
        this.removeServer(id);
      } else if (guild.available) {
        const guildResolved = this.client.guilds.resolve(id);
        if (!guildResolved) return;
        const availableRoles = guildResolved.roles.cache.keyArray();
        this.servers[id].adminRoles = this.servers[id].adminRoles
          .filter((roleID: Snowflake) => availableRoles.includes(roleID));
        this.saveServerSnowflakes.push(id);

        Object.keys(server.channelMonitors).forEach(async (monitorID) => {
          const channelMonitor = server.channelMonitors[monitorID];
          const textChannel = <TextChannel> guild.channels.resolve(channelMonitor.displayChannel);

          const a = guild.channels.resolve(monitorID);
          const b = guild.channels.resolve(channelMonitor.displayChannel);
          const c = await textChannel.messages.fetch(channelMonitor.displayMessage);

          if (!a || !b || !c || a.deleted || b.deleted || c.deleted) {
            this.removeMonitor(id, monitorID);
          }
          this.saveMonitorSnowflakes.push(monitorID);
        });
      }
    });
  }

  private addMissed() {
    const currentlyInGuilds = this.client.guilds.cache.keyArray();
    currentlyInGuilds.forEach((snowflake) => {
      if (!this.servers[snowflake]) {
        this.addServer(snowflake, 'fcfs!', [], [], []);
        this.saveServerSnowflakes.push(snowflake);
      }
    });
  }

  private async initServers() {
    Object.keys(this.servers).forEach(async (id) => {
      if (this.client.guilds.resolve(id)?.available) {
        await this.servers[id].initMonitors();
      }
    });
  }

  private timeoutSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => this.save(), 1500);
  }

  public async save() {
    const db = await sqlite.open('./db/fcfs.db');
    await this.removeMonitors(db);
    await this.removeServers(db);
    await this.saveServers(db);
    await this.saveMonitors(db);
    await db.close();
    this.saveTimer = null;
  }

  public saveServer(snowflake: Snowflake) {
    this.saveServerSnowflakes.push(snowflake);

    this.timeoutSave();
  }

  private async saveServers(db: Database) {
    if (!this.saveServerSnowflakes.length) return;
    this.saveServerSnowflakes = this.saveServerSnowflakes.filter((value, index, self) => self.indexOf(value) === index);

    const placeholders: Array<string> = [];
    let values: Array<string> = [];

    this.saveServerSnowflakes.forEach((snowflake) => {
      const server = this.servers[snowflake];

      const v = [
        server.id,
        server.prefix,
        (server.adminRoles ?? []).join(','),
        (server.modRoles ?? []).join(','),
        (server.helperRoles ?? []).join(','),
      ];

      placeholders.push('(?, ?, ?, ?, ?)');
      values = values.concat(v);
    });

    this.saveServerSnowflakes = [];

    const sql = `INSERT INTO server (id, bot_prefix, admin_roles, mod_roles, helper_roles)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    bot_prefix = excluded.bot_prefix,
    admin_roles = excluded.admin_roles,
    mod_roles = excluded.mod_roles,
    helper_roles = excluded.helper_roles`;

    await db.run(sql, values);
  }

  public addServer(
    snowflake: Snowflake,
    prefix: string,
    adminRoles: Array<Snowflake>,
    modRoles: Array<Snowflake>,
    helperRoles: Array<Snowflake>,
  ) {
    this.servers[snowflake] = new Server(this.client, snowflake, prefix, adminRoles, modRoles, helperRoles);
  }

  public removeServer(snowflake: Snowflake) {
    this.removeServerSnowflakes.push(snowflake);
    delete this.servers[snowflake];

    this.timeoutSave();
  }

  private async removeServers(db: Database) {
    if (!this.removeServerSnowflakes.length) return;

    // eslint-disable-next-line no-unused-vars
    const placeholders = this.removeServerSnowflakes.map((_) => '?');

    const sql = `DELETE FROM server
    WHERE id IN (${placeholders.join(', ')})`;

    const sql2 = `DELETE FROM monitor
    WHERE guild_id IN (${placeholders.join(', ')})`;

    await db.run(sql, this.removeServerSnowflakes);
    await db.run(sql2, this.removeServerSnowflakes);

    this.removeServerSnowflakes.forEach((snowflake) => delete this.servers[snowflake]);

    this.removeServerSnowflakes = [];
  }

  public async removeMonitor(serverID: Snowflake, channelID: Snowflake) {
    const displayChannelSnowflake = this.servers[serverID].channelMonitors[channelID].displayChannel;
    const displayMessageSnowflake = this.servers[serverID].channelMonitors[channelID].displayMessage;

    const displayChannel: TextChannel = <TextChannel> this.client.channels.resolve(displayChannelSnowflake);
    // Empty catch because this might fail if someone deletes a message and who cares
    displayChannel.messages.delete(displayMessageSnowflake).catch(() => {});

    this.servers[serverID].removeChannelMonitor(channelID);

    this.removeMonitorSnowflakes.push(channelID);

    this.timeoutSave();
  }

  private async removeMonitors(db: Database) {
    if (!this.removeMonitorSnowflakes.length) return;

    // eslint-disable-next-line no-unused-vars
    const placeholders = this.removeMonitorSnowflakes.map((_) => '?');

    const sql = `DELETE FROM monitor
    WHERE id IN (${placeholders.join(', ')})`;

    await db.run(sql, this.removeMonitorSnowflakes);

    this.removeMonitorSnowflakes = [];
  }

  public saveMonitor(snowflake: Snowflake) {
    this.saveMonitorSnowflakes.push(snowflake);

    this.timeoutSave();
  }

  private async saveMonitors(db: Database) {
    if (!this.saveMonitorSnowflakes.length) return;

    this.saveMonitorSnowflakes = this.saveMonitorSnowflakes
      .filter((value, index, self) => self.indexOf(value) === index);

    const placeholders: Array<string> = [];
    let values: Array<string> = [];

    this.saveMonitorSnowflakes.forEach((snowflake) => {
      const guild = (<TextChannel> this.client.channels.resolve(snowflake))?.guild;
      if (!guild?.available) return;

      const guildID = guild.id;

      const monitor = this.servers[guildID].channelMonitors[snowflake];

      const v = [
        monitor.id,
        monitor.guildID,
        monitor.displayChannel,
        monitor.displayMessage,
        monitor.displaySize.toString(),
        monitor.rejoinWindow.toString(),
        monitor.afkCheckDuration.toString(),
        monitor.queue.map((member) => member.id).join(','),
        (monitor.afkCheckScheduler?.interval ?? 0).toString(),
        monitor.autoOutput!,
      ];

      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      values = values.concat(v);
    });

    this.saveMonitorSnowflakes = [];

    const sql = `INSERT INTO monitor (id, guild_id, display_channel, display_message,
      display_size, rejoin_window, afk_check_duration, queue, automatic, auto_output)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    guild_id = excluded.guild_id,
    display_channel = excluded.display_channel,
    display_message = excluded.display_message,
    display_size = excluded.display_size,
    rejoin_window = excluded.rejoin_window,
    afk_check_duration = excluded.afk_check_duration,
    queue = excluded.queue,
    automatic = excluded.automatic,
    auto_output = excluded.auto_output`;

    await db.run(sql, values);
  }
}
