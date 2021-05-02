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
const discord_akairo_1 = require("discord-akairo");
class RoleDeleteListener extends discord_akairo_1.Listener {
    constructor() {
        super('roleDelete', {
            emitter: 'client',
            event: 'roleDelete',
        });
    }
    exec(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.client;
            const { guild } = role;
            const ds = client.dataSource;
            const server = ds.servers[guild.id];
            const serverAdminRoleIndex = server.adminRoles.indexOf(role.id);
            if (serverAdminRoleIndex !== -1) {
                server.adminRoles.splice(serverAdminRoleIndex, 1);
                ds.saveServer(server.id);
            }
        });
    }
}
exports.default = RoleDeleteListener;