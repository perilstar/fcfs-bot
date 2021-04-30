import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';
import type FCFSClient from '../fcfsclient';

export default class RoleDeleteListener extends Listener {
  constructor() {
    super('roleDelete', {
      emitter: 'client',
      event: 'roleDelete',
    });
  }

  async exec(role: Role) {
    const client = <FCFSClient> this.client;

    const { guild } = role;

    const ds = client.dataSource;

    const server = ds.servers[guild.id];

    const serverAdminRoleIndex = server.adminRoles.indexOf(role.id);
    if (serverAdminRoleIndex !== -1) {
      server.adminRoles.splice(serverAdminRoleIndex, 1);
      ds.saveServer(server.id);
    }
  }
}
