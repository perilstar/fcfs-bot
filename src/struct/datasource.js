const sqlite = require('sqlite')
const EventEmitter = require('events');
const Server = require('./server');

class DataSource extends EventEmitter {
  constructor(client) {
    super();

    this.client = client;
    this.servers = {};

    this.removeMonitorSnowflakes = [];

    this.saveServerSnowflakes = [];
    this.saveMonitorSnowflakes = [];
  }

  addServer(id, prefix = 'fcfs!') {
    this.servers[id] = new Server(this.client, id, prefix)
  }

  async revUpThoseFryers() {
    await this.init();
    await this.load();
    this.emit('dataLoaded');
  }

  async init() {
    let db = await sqlite.open('./db/fcfs.db');

    await db.run(`CREATE TABLE IF NOT EXISTS monitor (
      id TEXT PRIMARY KEY,
      guild_id TEXT,
      name TEXT,
      display_channel TEXT,
      display_message TEXT,
      first_n INTEGER,
      rejoin_window INTEGER,
      afk_check_duration INTEGER,
      restricted_mode INTEGER,
      allowed_roles TEXT,
      queue TEXT
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS server (
      id TEXT PRIMARY KEY,
      bot_prefix TEXT
    )`);

    await sqlite.close(db)
  }

  async load() {

    let db = await sqlite.open('./db/fcfs.db');

    let sql = `SELECT * FROM server`
    let result = await db.all(sql, []);
    
    for (let row of result) {
      this.addServer(row.id, row.bot_prefix);
    }

    sql = `SELECT * FROM monitor`
    result = await db.all(sql, []);
    
    for (let row of result) {
      let data = {
        id: row.id,
        guildID: row.guild_id,
        name: row.name,
        displayChannel: row.display_channel,
        displayMessage: row.display_message,
        firstN: row.first_n,
        rejoinWindow: row.rejoinWindow,
        afkCheckDuration: row.afk_check_duration,
        restrictedMode: row.restricted_mode === 1,
        allowedRoles: row.allowed_roles.split(',').filter(Boolean),
        snowflakeQueue: row.queue.split(',').filter(Boolean)
      }
      if (!this.servers[row.guild_id]) {
        this.addServer(row.guild_id, 'fcfs!');
        this.saveServer(row.guild_id);
      }
      this.servers[row.guild_id].addMonitoredChannel(data);
    }

    await sqlite.close(db)
  }

  timeoutSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => this.save(), 3000);
  }

  async save() {
    let db = await sqlite.open('./db/fcfs.db');
    await this.removeMonitors(db);
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

    let placeholders = [];
    let values = [];

    for (let snowflake of this.saveServerSnowflakes) {
      let server = this.servers[snowflake];
      
      let v = [
        server.id,
        server.prefix
      ];
    
      placeholders.push('(?, ?)');
      values = values.concat(v);
    }

    this.saveServerSnowflakes = [];

    let sql = `INSERT INTO server (id, bot_prefix)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    bot_prefix = excluded.bot_prefix`;
    
    await db.run(sql, values);
  }

  removeMonitor(snowflake) {
    this.removeMonitorSnowflakes.push(snowflake);

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

    let placeholders = [];
    let values = [];

    for (let snowflake of this.saveMonitorSnowflakes) {
      let guild = this.client.channels.resolve(snowflake).guild
      if (!guild.available) return;
      
      let guildID = guild.id;
  
      let monitor = this.servers[guildID].monitoredChannels[snowflake];

      let v = [
        monitor.id,
        monitor.guildID,
        monitor.name,
        monitor.displayChannel,
        monitor.displayMessage,
        monitor.firstN,
        monitor.rejoinWindow,
        monitor.afkCheckDuration,
        monitor.restrictedMode ? 1 : 0,
        monitor.allowedRoles.join(','),
        monitor.queue.map(member => member.id).join(',')
      ];

      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      values = values.concat(v);
    }

    this.saveMonitorSnowflakes = [];


    let sql = `INSERT INTO monitor (id, guild_id, name, display_channel, display_message,
      first_n, rejoin_window, afk_check_duration, restricted_mode, allowed_roles, queue)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT(id) DO UPDATE SET
    id = excluded.id,
    guild_id = excluded.guild_id,
    name = excluded.name,
    display_channel = excluded.display_channel,
    display_message = excluded.display_message,
    first_n = excluded.first_n,
    rejoin_window = excluded.rejoin_window,
    afk_check_duration = excluded.afk_check_duration,
    restricted_mode = excluded.restricted_mode,
    allowed_roles = excluded.allowed_roles,
    queue = excluded.queue`;

    await db.run(sql, values);
  }

}

module.exports = DataSource;