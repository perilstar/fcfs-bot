"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function v1to2(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.run('ALTER TABLE server RENAME TO _server_old');
        let sql = `CREATE TABLE server (
    id TEXT PRIMARY KEY ,
    bot_prefix TEXT ,
    admin_roles TEXT ,
    mod_roles TEXT ,
    helper_roles TEXT 
  )`;
        yield db.run(sql);
        yield db.run('INSERT INTO server (id, bot_prefix, admin_roles) SELECT id, bot_prefix, admin_roles FROM _server_old');
        const results = yield db.all('SELECT guild_id, mod_roles FROM monitor');
        const individual = results.filter((value, index, self) => {
            return self.findIndex((el) => el.guild_id === value.guild_id) === index;
        });
        const values = [];
        const placeholders = [];
        individual.forEach((row) => {
            values.push(row.guild_id);
            values.push(row.mod_roles);
            placeholders.push('(?, ?)');
        });
        sql = `WITH Tmp(id, mod_roles) AS (VALUES ${placeholders.join(',\n')})
  
  UPDATE server SET mod_roles = (SELECT mod_roles FROM Tmp WHERE server.id = Tmp.id)
  
  WHERE id IN (SELECT id FROM Tmp)`;
        yield db.run(sql, values);
        yield db.run('ALTER TABLE monitor RENAME TO _monitor_old');
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
        yield db.run(sql);
        sql = `INSERT INTO monitor (id, guild_id, display_channel, display_message, display_size, rejoin_window, afk_check_duration, queue)
  SELECT id, guild_id, display_channel, display_message, first_n, rejoin_window, afk_check_duration, queue
  FROM _monitor_old`;
        yield db.run(sql);
        yield db.run('DROP TABLE _monitor_old');
        yield db.run('DROP TABLE _server_old');
        yield db.run('PRAGMA user_version = 2');
    });
}
function v2to3(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.run('ALTER TABLE monitor ADD COLUMN automatic INTEGER');
        yield db.run('ALTER TABLE monitor ADD COLUMN auto_output TEXT');
        yield db.run('PRAGMA user_version = 3');
    });
}
function dbupdate(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const version = (yield db.get('PRAGMA user_version')).user_version;
        if (version < 2)
            yield v1to2(db);
        if (version < 3)
            yield v2to3(db);
    });
}
exports.default = dbupdate;
