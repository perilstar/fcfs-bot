"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mps_mod_1 = __importDefault(require("./mps_mod"));
function mpsHelper(client, message) {
    var _a, _b, _c;
    const server = client.dataSource.servers[message.guild.id];
    const { helperRoles } = server;
    const member = (_c = (_b = (_a = client.guilds.resolve(message.guild.id)) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.cache) === null || _c === void 0 ? void 0 : _c.get(message.author.id);
    if (member === undefined)
        return 'unknown';
    const a = member.roles.cache.some((role) => helperRoles.includes(role.id));
    const b = mps_mod_1.default(client, message);
    if (a || !b)
        return null;
    return 'botHelper';
}
exports.default = mpsHelper;
