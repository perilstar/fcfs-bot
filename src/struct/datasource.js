const sqlite = require('sqlite')
const EventEmitter = require('events');
const Server = require('./server');
const fs = require('fs');

class DataSource extends EventEmitter {
  constructor(client) {
    super();

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

    await db.run(`CREATE TABLE IF NOT EXISTS monitor (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      display_channel TEXT,
      display_message TEXT,
      first_n INTEGER,
      rejoin_window INTEGER,
      afk_check_duration INTEGER,
      restricted_mode INTEGER,
      mod_roles TEXT,
      queue TEXT
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS server (
      id TEXT PRIMARY KEY,
      bot_prefix TEXT,
      admin_roles TEXT
    )`);

    await sqlite.close(db)
  }

  async load() {

    let db = await sqlite.open('./db/fcfs.db');

    let sql = `SELECT * FROM server`
    let result = await db.all(sql, []);
    
    for (let row of result) {
      let adminRoles = row.admin_roles.split(',').filter(Boolean);
      this.addServer(row.id, row.bot_prefix, adminRoles);
    }

    sql = `SELECT * FROM monitor`
    result = await db.all(sql, []);
    
    for (let row of result) {
      let data = {
        id: row.id,
        guildID: row.guild_id,
        displayChannel: row.display_channel,
        displayMessage: row.display_message,
        firstN: row.first_n,
        rejoinWindow: row.rejoin_window,
        afkCheckDuration: row.afk_check_duration,
        restrictedMode: row.restricted_mode === 1,
        modRoles: row.mod_roles.split(',').filter(Boolean),
        snowflakeQueue: row.queue.split(',').filter(Boolean)
      }
      if (!this.servers[row.guild_id]) {
        this.addServer(row.guild_id, 'fcfs!', []);
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
      if (!guild) {
        this.removeServer(id);
      } else if (guild.available) {
        let availableRoles = this.client.guilds.resolve(id).roles.cache.keyArray();
        this.servers[id].adminRoles = this.servers[id].adminRoles.filter(roleID => availableRoles.includes(roleID));
        this.saveServerSnowflakes.push(id);

        for (let monitorID in server.channelMonitors) {
          let channelMonitor = server.channelMonitors[monitorID];

          let a = guild.channels.resolve(monitorID).deleted;
          let b = guild.channels.resolve(channelMonitor.displayChannel).deleted;
          let c = (await guild.channels.resolve(channelMonitor.displayChannel).messages.fetch(channelMonitor.displayMessage)).deleted;

          if (a || b || c ||) {
            this.removeMonitor(id, monitorID);
          }
          channelMonitor.modRoles = channelMonitor.modRoles.filter(roleID => availableRoles.includes(roleID));
          this.saveMonitorSnowflakes.push(monitorID);
        }
      }
    }
  }

  addMissed() {
    let currentlyInGuilds = this.client.guilds.cache.keyArray();
    for (let snowflake of currentlyInGuilds) {
      if (!this.servers[snowflake]) {
        this.addServer(snowflake, 'fcfs!', []);
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
        server.adminRoles.join(',')
      ];
    
      placeholders.push('(?, ?, ?)');
      values = values.concat(v);
    }

    this.saveServerSnowflakes = [];

    let sql = `INSERT INTO server (id, bot_prefix, admin_roles)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    bot_prefix = excluded.bot_prefix,
    admin_roles = excluded.admin_roles`;
    
    await db.run(sql, values);
  }

  addServer(snowflake, prefix = 'fcfs!', adminRoles) {
    this.servers[snowflake] = new Server(this.client, snowflake, prefix, adminRoles);
  }

  removeServer(snowflake) {
    this.removeServerSnowflakes.push(snowflake);

    this.timeoutSave();
  }

  async removeServers(db) {
    if (!this.removeServerSnowflakes.length) return;

    let placeholders = this.removeServerSnowflakes.map(el => '?');

    let sql = `DELETE FROM server
    WHERE id IN (${placeholders.join(', ')});
    DELETE FROM monitor
    WHERE guild_id IN (${placeholders.join(', ')})`;

    await db.run(sql, this.removeServerSnowflakes.concat(this.removeServerSnowflakes));

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
        monitor.firstN,
        monitor.rejoinWindow,
        monitor.afkCheckDuration,
        monitor.restrictedMode ? 1 : 0,
        monitor.modRoles.join(','),
        monitor.queue.map(member => member.id).join(',')
      ];

      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      values = values.concat(v);
    }

    this.saveMonitorSnowflakes = [];


    let sql = `INSERT INTO monitor (id, guild_id, display_channel, display_message,
      first_n, rejoin_window, afk_check_duration, restricted_mode, mod_roles, queue)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    guild_id = excluded.guild_id,
    display_channel = excluded.display_channel,
    display_message = excluded.display_message,
    first_n = excluded.first_n,
    rejoin_window = excluded.rejoin_window,
    afk_check_duration = excluded.afk_check_duration,
    restricted_mode = excluded.restricted_mode,
    mod_roles = excluded.mod_roles,
    queue = excluded.queue`;

    await db.run(sql, values);
  }

}

module.exports = DataSource;