const sqlite = require('sqlite')
const EventEmitter = require('events');
const Server = require('./server');

class DataSource extends EventEmitter {
  constructor(client) {
    super();

    this.client = client;
    this.servers = {};
    this.saveTimers = {};
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

  async saveServer(snowflake) {
    let server = this.servers[snowflake];

    let db = await sqlite.open('./db/fcfs.db');

    let sql = `INSERT INTO server (id, bot_prefix)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET
    id = ?,
    bot_prefix = ?`;

    let values = [
      server.id,
      server.prefix,
    ];

    values = values.concat(values);

    await db.run(sql, values);

    await sqlite.close(db);
  }

  async saveMonitor(snowflake) {
    delete this.saveTimers[snowflake];

    let guild = this.client.channels.resolve(snowflake).guild
    if (guild.available) {
      let guildID = guild.id;
      let monitor = this.servers[guildID].monitoredChannels[snowflake];

      let db = await sqlite.open('./db/fcfs.db');

      let sql = `INSERT INTO monitor (id, guild_id, name, display_channel, display_message,
        first_n, rejoin_window, afk_check_duration, restricted_mode, allowed_roles, queue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
      id = ?,
      guild_id = ?,
      name = ?,
      display_channel = ?,
      display_message = ?,
      first_n = ?,
      rejoin_window = ?,
      afk_check_duration = ?,
      restricted_mode = ?,
      allowed_roles = ?,
      queue = ?`;

      let values = [
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

      values = values.concat(values);

      await db.run(sql, values);

      await sqlite.close(db);
    }
  }

  timeoutSaveMonitor(snowflake) {
    if (this.saveTimers[snowflake]) return;
    this.saveTimers[snowflake] = setTimeout(() => this.saveMonitor(snowflake), 3000);
  }

  // timeoutSave(guildID) {
  //   if (this.saveTimer) return;
  //   this.saveTimer = setTimeout(() => this.save(guildID), 10000);
  // }

  // async save(guildID) {
  //   this.saveTimer = null;
  //   // Implement saving code here
  // }

}

module.exports = DataSource;