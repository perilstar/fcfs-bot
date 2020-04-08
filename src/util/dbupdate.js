async function dbupdate(db) {
  let version = (await db.get('PRAGMA user_version')).user_version;

  if (version < 2) await v1to2(db);
  if (version < 3) await v2to3(db);
}

async function v1to2(db) {
  await db.run(`ALTER TABLE server RENAME TO _server_old`);

  let sql = `CREATE TABLE server (
    id TEXT PRIMARY KEY ,
    bot_prefix TEXT ,
    admin_roles TEXT ,
    mod_roles TEXT ,
    helper_roles TEXT 
  )`;
  await db.run(sql);

  await db.run(`INSERT INTO server (id, bot_prefix, admin_roles) SELECT id, bot_prefix, admin_roles FROM _server_old`);

  let results = await db.all(`SELECT guild_id, mod_roles FROM monitor`);

  let individual = results.filter((value, index, self) => {
    return self.findIndex(el => el.guild_id == value.guild_id) === index;
  });

  let values = [];
  let placeholders = [];

  for (let row of individual) {
    values.push(row.guild_id);
    values.push(row.mod_roles);
    placeholders.push('(?, ?)');
  }

  sql = `WITH Tmp(id, mod_roles) AS (VALUES ${placeholders.join(',\n')})
  
  UPDATE server SET mod_roles = (SELECT mod_roles FROM Tmp WHERE server.id = Tmp.id)
  
  WHERE id IN (SELECT id FROM Tmp)`;
  
  await db.run(sql, values);

  await db.run(`ALTER TABLE monitor RENAME TO _monitor_old`);

  sql = `CREATE TABLE monitor (
    id TEXT PRIMARY KEY ,
    guild_id TEXT ,
    display_channel TEXT ,
    display_message TEXT ,
    display_size INTEGER ,
    rejoin_window INTEGER ,
    afk_check_duration INTEGER ,
    queue TEXT 
  )`;

  await db.run(sql);

  sql = `INSERT INTO monitor (id, guild_id, display_channel, display_message, display_size, rejoin_window, afk_check_duration, queue)
  SELECT id, guild_id, display_channel, display_message, first_n, rejoin_window, afk_check_duration, queue
  FROM _monitor_old`;

  await db.run(sql);

  await db.run(`DROP TABLE _monitor_old`);
  await db.run(`DROP TABLE _server_old`);
  await db.run(`PRAGMA user_version = 2`);
}

async function v2to3(db) {
  await db.run(`ALTER TABLE monitor ADD COLUMN automatic INTEGER`);
  await db.run(`ALTER TABLE monitor ADD COLUMN auto_output TEXT`);

  await db.run(`PRAGMA user_version = 3`);
}

module.exports = dbupdate;