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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const sqlite_1 = __importDefault(require("sqlite"));
const dbupdate_1 = __importDefault(require("../util/dbupdate"));
const server_1 = __importDefault(require("./server"));
class DataSource {
    constructor(client) {
        this.saveTimer = null;
        this.client = client;
        this._servers = {};
        this.removeMonitorSnowflakes = [];
        this.removeServerSnowflakes = [];
        this.saveServerSnowflakes = [];
        this.saveMonitorSnowflakes = [];
    }
    get servers() {
        return this._servers;
    }
    ;
    revUpThoseFryers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield DataSource.init();
            yield this.load();
            yield this.cleanupDeleted();
            yield this.addMissed();
            yield this.initServers();
            yield this.save();
        });
    }
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs_1.default.existsSync('./db'))
                fs_1.default.mkdirSync('./db');
            const db = yield sqlite_1.default.open('./db/fcfs.db');
            const tableExists = yield db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'server\'');
            if (!tableExists) {
                yield db.run(`CREATE TABLE IF NOT EXISTS monitor (
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
                yield db.run(`CREATE TABLE IF NOT EXISTS server (
        id TEXT PRIMARY KEY ,
        bot_prefix TEXT ,
        admin_roles TEXT ,
        mod_roles TEXT ,
        helper_roles TEXT  
      )`);
                yield db.run('PRAGMA user_version = 3');
            }
            yield dbupdate_1.default(db);
            yield db.close();
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield sqlite_1.default.open('./db/fcfs.db');
            let sql = 'SELECT * FROM server';
            let result = yield db.all(sql, []);
            result.forEach((row) => {
                var _a, _b, _c, _d;
                const adminRoles = ((_a = row.admin_roles) !== null && _a !== void 0 ? _a : '').split(',').filter(Boolean);
                const modRoles = ((_b = row.mod_roles) !== null && _b !== void 0 ? _b : '').split(',').filter(Boolean);
                const helperRoles = ((_c = row.helper_roles) !== null && _c !== void 0 ? _c : '').split(',').filter(Boolean);
                this.addServer(row.id, (_d = row.bot_prefix) !== null && _d !== void 0 ? _d : 'fcfs!', adminRoles, modRoles, helperRoles);
            });
            sql = 'SELECT * FROM monitor';
            result = yield db.all(sql, []);
            result.forEach((row) => {
                var _a;
                const data = {
                    id: row.id,
                    guildID: row.guild_id,
                    displayChannel: row.display_channel,
                    displayMessage: row.display_message,
                    displaySize: row.display_size,
                    rejoinWindow: row.rejoin_window,
                    afkCheckDuration: row.afk_check_duration,
                    snowflakeQueue: row.queue.split(',').filter(Boolean),
                    automatic: (_a = row.automatic) !== null && _a !== void 0 ? _a : -1,
                    autoOutput: row.auto_output,
                };
                if (!this.servers[row.guild_id]) {
                    this.addServer(row.guild_id, 'fcfs!', [], [], []);
                    this.saveServerSnowflakes.push(row.guild_id);
                }
                this.servers[row.guild_id].addChannelMonitor(data);
            });
            yield db.close();
        });
    }
    cleanupDeleted() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(this.servers).forEach((id) => {
                const server = this.servers[id];
                const guild = this.client.guilds.resolve(id);
                if (!guild || guild.deleted) {
                    this.removeServer(id);
                }
                else if (guild.available) {
                    const guildResolved = this.client.guilds.resolve(id);
                    if (!guildResolved)
                        return;
                    const availableRoles = guildResolved.roles.cache.keyArray();
                    this.servers[id].adminRoles = this.servers[id].adminRoles
                        .filter((roleID) => availableRoles.includes(roleID));
                    this.saveServerSnowflakes.push(id);
                    Object.keys(server.channelMonitors).forEach((monitorID) => __awaiter(this, void 0, void 0, function* () {
                        const channelMonitor = server.channelMonitors[monitorID];
                        const textChannel = guild.channels.resolve(channelMonitor.displayChannel);
                        const a = guild.channels.resolve(monitorID);
                        const b = guild.channels.resolve(channelMonitor.displayChannel);
                        const c = yield textChannel.messages.fetch(channelMonitor.displayMessage);
                        if (!a || !b || !c || a.deleted || b.deleted || c.deleted) {
                            this.removeMonitor(id, monitorID);
                        }
                        this.saveMonitorSnowflakes.push(monitorID);
                    }));
                }
            });
        });
    }
    addMissed() {
        const currentlyInGuilds = this.client.guilds.cache.keyArray();
        currentlyInGuilds.forEach((snowflake) => {
            if (!this.servers[snowflake]) {
                this.addServer(snowflake, 'fcfs!', [], [], []);
                this.saveServerSnowflakes.push(snowflake);
            }
        });
    }
    initServers() {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(this.servers).forEach((id) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if ((_a = this.client.guilds.resolve(id)) === null || _a === void 0 ? void 0 : _a.available) {
                    yield this.servers[id].initMonitors();
                }
            }));
        });
    }
    timeoutSave() {
        if (this.saveTimer)
            return;
        this.saveTimer = setTimeout(() => this.save(), 1500);
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield sqlite_1.default.open('./db/fcfs.db');
            yield this.removeMonitors(db);
            yield this.removeServers(db);
            yield this.saveServers(db);
            yield this.saveMonitors(db);
            yield db.close();
            this.saveTimer = null;
        });
    }
    saveServer(snowflake) {
        this.saveServerSnowflakes.push(snowflake);
        this.timeoutSave();
    }
    saveServers(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.saveServerSnowflakes.length)
                return;
            this.saveServerSnowflakes = this.saveServerSnowflakes.filter((value, index, self) => self.indexOf(value) === index);
            const placeholders = [];
            let values = [];
            this.saveServerSnowflakes.forEach((snowflake) => {
                var _a, _b, _c;
                const server = this.servers[snowflake];
                const v = [
                    server.id,
                    server.prefix,
                    ((_a = server.adminRoles) !== null && _a !== void 0 ? _a : []).join(','),
                    ((_b = server.modRoles) !== null && _b !== void 0 ? _b : []).join(','),
                    ((_c = server.helperRoles) !== null && _c !== void 0 ? _c : []).join(','),
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
            yield db.run(sql, values);
        });
    }
    addServer(snowflake, prefix, adminRoles, modRoles, helperRoles) {
        this.servers[snowflake] = new server_1.default(this.client, snowflake, prefix, adminRoles, modRoles, helperRoles);
    }
    removeServer(snowflake) {
        this.removeServerSnowflakes.push(snowflake);
        delete this.servers[snowflake];
        this.timeoutSave();
    }
    removeServers(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.removeServerSnowflakes.length)
                return;
            const placeholders = this.removeServerSnowflakes.map((_) => '?');
            const sql = `DELETE FROM server
    WHERE id IN (${placeholders.join(', ')})`;
            const sql2 = `DELETE FROM monitor
    WHERE guild_id IN (${placeholders.join(', ')})`;
            yield db.run(sql, this.removeServerSnowflakes);
            yield db.run(sql2, this.removeServerSnowflakes);
            this.removeServerSnowflakes.forEach((snowflake) => delete this.servers[snowflake]);
            this.removeServerSnowflakes = [];
        });
    }
    removeMonitor(serverID, channelID) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayChannelSnowflake = this.servers[serverID].channelMonitors[channelID].displayChannel;
            const displayMessageSnowflake = this.servers[serverID].channelMonitors[channelID].displayMessage;
            const displayChannel = this.client.channels.resolve(displayChannelSnowflake);
            displayChannel.messages.delete(displayMessageSnowflake).catch(() => { });
            this.servers[serverID].removeChannelMonitor(channelID);
            this.removeMonitorSnowflakes.push(channelID);
            this.timeoutSave();
        });
    }
    removeMonitors(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.removeMonitorSnowflakes.length)
                return;
            const placeholders = this.removeMonitorSnowflakes.map((_) => '?');
            const sql = `DELETE FROM monitor
    WHERE id IN (${placeholders.join(', ')})`;
            yield db.run(sql, this.removeMonitorSnowflakes);
            this.removeMonitorSnowflakes = [];
        });
    }
    saveMonitor(snowflake) {
        this.saveMonitorSnowflakes.push(snowflake);
        this.timeoutSave();
    }
    saveMonitors(db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.saveMonitorSnowflakes.length)
                return;
            this.saveMonitorSnowflakes = this.saveMonitorSnowflakes
                .filter((value, index, self) => self.indexOf(value) === index);
            const placeholders = [];
            let values = [];
            this.saveMonitorSnowflakes.forEach((snowflake) => {
                var _a, _b, _c;
                const guild = (_a = this.client.channels.resolve(snowflake)) === null || _a === void 0 ? void 0 : _a.guild;
                if (!(guild === null || guild === void 0 ? void 0 : guild.available))
                    return;
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
                    ((_c = (_b = monitor.afkCheckScheduler) === null || _b === void 0 ? void 0 : _b.interval) !== null && _c !== void 0 ? _c : 0).toString(),
                    monitor.autoOutput,
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
            yield db.run(sql, values);
        });
    }
}
exports.default = DataSource;
