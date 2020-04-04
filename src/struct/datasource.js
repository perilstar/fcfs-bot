const sqlite = require('sqlite')
const Server = require('./server');
const fs = require('fs');
const dbupdate = require('../util/dbupdate');

class DataSource {
  constructor(client) {
    this.client = client;
    this.servers = {};
    
    this.removeMonitorSnowflakes = [];
    this.removeServerSnowflakes = [];

    this.saveServerSnowflakes = [];
    this.saveMonitorSnowflakes = [];
  }

  async revUpThoseFryers() {
    await this.init();
    await this.load();
    await this.cleanupDeleted();
    await this.addMissed();
    await this.initServers();
    await this.save();
  }

  async init() {
    if (!fs.existsSync('./db')) fs.mkdirSync('./db');

    let db = await sqlite.open('./db/fcfs.db');

    let tableExists = db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='server'`);
    if (!tableExists) {
      await db.run(`PRAGMA user_version = 2`);
    }

    await db.run(`CREATE TABLE IF NOT EXISTS monitor (
      id TEXT PRIMARY KEY ,
      guild_id TEXT ,
      display_channel TEXT ,
      display_message TEXT ,
      display_size INTEGER ,
      rejoin_window INTEGER ,
      afk_check_duration INTEGER ,
      queue TEXT 
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS server (
      id TEXT PRIMARY KEY ,
      bot_prefix TEXT ,
      admin_roles TEXT ,
      mod_roles TEXT ,
      helper_roles TEXT  
    )`);

    await dbupdate(db);

    await sqlite.close(db)
  }

  async load() {

    let db = await sqlite.open('./db/fcfs.db');

    let sql = `SELECT * FROM server`
    let result = await db.all(sql, []);
    
    for (let row of result) {
      let adminRoles = (row.admin_roles || '').split(',').filter(Boolean);
      let modRoles = (row.mod_roles || '').split(',').filter(Boolean);
      let helperRoles = (row.helper_roles || '').split(',').filter(Boolean);

      this.addServer(row.id, row.bot_prefix, adminRoles, modRoles, helperRoles);
    }

    sql = `SELECT * FROM monitor`
    result = await db.all(sql, []);
    
    for (let row of result) {
      let data = {
        id: row.id,
        guildID: row.guild_id,
        displayChannel: row.display_channel,
        displayMessage: row.display_message,
        displaySize: row.display_size,
        rejoinWindow: row.rejoin_window,
        afkCheckDuration: row.afk_check_duration,
        snowflakeQueue: row.queue.split(',').filter(Boolean)
      }
      if (!this.servers[row.guild_id]) {
        this.addServer(row.guild_id, 'fcfs!', [], [], []);
        this.saveServerSnowflakes.push(row.guild_id);
      }
      this.servers[row.guild_id].addChannelMonitor(data);
    }

    await sqlite.close(db)
  }

  async cleanupDeleted() {
    for (let id in this.servers) {
      let server = this.servers[id];
      let guild = this.client.guilds.resolve(id);
      if (!guild || guild.deleted) {
        this.removeServer(id);
      } else if (guild.available) {
        let availableRoles = this.client.guilds.resolve(id).roles.cache.keyArray();
        this.servers[id].adminRoles = this.servers[id].adminRoles.filter(roleID => availableRoles.includes(roleID));
        this.saveServerSnowflakes.push(id);

        for (let monitorID in server.channelMonitors) {
          let channelMonitor = server.channelMonitors[monitorID];

          let a = guild.channels.resolve(monitorID);
          let b = guild.channels.resolve(channelMonitor.displayChannel);
          let c = (await guild.channels.resolve(channelMonitor.displayChannel).messages.fetch(channelMonitor.displayMessage));

          if (!a || !b || !c || a.deleted || b.deleted || c.deleted) {
            this.removeMonitor(id, monitorID);
          }
          this.saveMonitorSnowflakes.push(monitorID);
        }
      }
    }
  }

  addMissed() {
    let currentlyInGuilds = this.client.guilds.cache.keyArray();
    for (let snowflake of currentlyInGuilds) {
      if (!this.servers[snowflake]) {
        this.addServer(snowflake, 'fcfs!', [], [], []);
        this.saveServerSnowflakes.push(snowflake);
      }
    }
  }

  
  async initServers() {
    for (let id in this.servers) {
      if (this.client.guilds.resolve(id).available) {
        await this.servers[id].initMonitors();
      }
    }
  }

  timeoutSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => this.save(), 1500);
  }

  async save() {
    let db = await sqlite.open('./db/fcfs.db');
    await this.removeMonitors(db);
    await this.removeServers(db);
    await this.saveServers(db);
    await this.saveMonitors(db);
    await sqlite.close(db);
    this.saveTimer = null;
  }

  saveServer(snowflake) {
    this.saveServerSnowflakes.push(snowflake);

    this.timeoutSave();
  }

  async saveServers(db) {
    if (!this.saveServerSnowflakes.length) return;
    this.saveServerSnowflakes = this.saveServerSnowflakes.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    let placeholders = [];
    let values = [];

    for (let snowflake of this.saveServerSnowflakes) {
      let server = this.servers[snowflake];
      
      let v = [
        server.id,
        server.prefix,
        (server.adminRoles || []).join(','),
        (server.modRoles || []).join(','),
        (server.helperRoles || []).join(',')
      ];
    
      placeholders.push('(?, ?, ?, ?, ?)');
      values = values.concat(v);
    }

    this.saveServerSnowflakes = [];

    let sql = `INSERT INTO server (id, bot_prefix, admin_roles, mod_roles, helper_roles)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    bot_prefix = excluded.bot_prefix,
    admin_roles = excluded.admin_roles,
    mod_roles = excluded.mod_roles,
    helper_roles = excluded.helper_roles`;
    
    await db.run(sql, values);
  }

  addServer(snowflake, prefix = 'fcfs!', adminRoles, modRoles, helperRoles) {
    this.servers[snowflake] = new Server(this.client, snowflake, prefix, adminRoles, modRoles, helperRoles);
  }

  removeServer(snowflake) {
    this.removeServerSnowflakes.push(snowflake);
    delete this.servers[snowflake];

    this.timeoutSave();
  }

  async removeServers(db) {
    if (!this.removeServerSnowflakes.length) return;

    let placeholders = this.removeServerSnowflakes.map(el => '?');

    let sql = `DELETE FROM server
    WHERE id IN (${placeholders.join(', ')})`;

    let sql2 = `DELETE FROM monitor
    WHERE guild_id IN (${placeholders.join(', ')})`;

    await db.run(sql, this.removeServerSnowflakes);
    await db.run(sql2, this.removeServerSnowflakes);

    this.removeServerSnowflakes.forEach(snowflake => delete this.servers[snowflake]);

    this.removeServerSnowflakes = [];
  }

  async removeMonitor(serverID, channelID) {
    let displayChannelSnowflake = this.servers[serverID].channelMonitors[channelID].displayChannel;
    let displayMessageSnowflake = this.servers[serverID].channelMonitors[channelID].displayMessage;

    // Empty catch because this might fail if someone deletes a message and who cares
    this.client.channels.resolve(displayChannelSnowflake).messages.delete(displayMessageSnowflake).catch(() => {});

    this.servers[serverID].removeChannelMonitor(channelID);

    this.removeMonitorSnowflakes.push(channelID);

    this.timeoutSave();
  }

  async removeMonitors(db) {
    if (!this.removeMonitorSnowflakes.length) return;

    let placeholders = this.removeMonitorSnowflakes.map(el => '?');

    let sql = `DELETE FROM monitor
    WHERE id IN (${placeholders.join(', ')})`;

    await db.run(sql, this.removeMonitorSnowflakes);

    this.removeMonitorSnowflakes = [];
  }

  saveMonitor(snowflake) {
    this.saveMonitorSnowflakes.push(snowflake);

    this.timeoutSave();
  }

  async saveMonitors(db) {
    if (!this.saveMonitorSnowflakes.length) return;

    this.saveMonitorSnowflakes = this.saveMonitorSnowflakes.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

    let placeholders = [];
    let values = [];

    for (let snowflake of this.saveMonitorSnowflakes) {
      let guild = this.client.channels.resolve(snowflake).guild;
      if (!guild.available) return;
      
      let guildID = guild.id;
  
      let monitor = this.servers[guildID].channelMonitors[snowflake];

      let v = [
        monitor.id,
        monitor.guildID,
        monitor.displayChannel,
        monitor.displayMessage,
        monitor.displaySize,
        monitor.rejoinWindow,
        monitor.afkCheckDuration,
        monitor.queue.map(member => member.id).join(',')
      ];

      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?)');
      values = values.concat(v);
    }

    this.saveMonitorSnowflakes = [];


    let sql = `INSERT INTO monitor (id, guild_id, display_channel, display_message,
      display_size, rejoin_window, afk_check_duration, queue)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    guild_id = excluded.guild_id,
    display_channel = excluded.display_channel,
    display_message = excluded.display_message,
    display_size = excluded.display_size,
    rejoin_window = excluded.rejoin_window,
    afk_check_duration = excluded.afk_check_duration,
    queue = excluded.queue`;

    await db.run(sql, values);
  }

}

module.exports = DataSource;