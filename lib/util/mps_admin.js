"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mpsAdmin(client, message) {
    var _a, _b, _c;
    const server = client.dataSource.servers[message.guild.id];
    const { adminRoles } = server;
    const member = (_c = (_b = (_a = client.guilds.resolve(message.guild.id)) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.cache) === null || _c === void 0 ? void 0 : _c.get(message.author.id);
    if (member === undefined)
        return 'unknown';
    const a = member.roles.cache.some((role) => adminRoles.includes(role.id));
    const b = member.permissions.has('ADMINISTRATOR');
    if (a || b)
        return null;
    return 'botAdmin';
}
exports.default = mpsAdmin;
