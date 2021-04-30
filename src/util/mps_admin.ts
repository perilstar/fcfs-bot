import { Message } from 'discord.js';
import FCFSClient from '../fcfsclient';

export default function mpsAdmin(client: FCFSClient, message: Message) {
  const server = client.dataSource.servers[message.guild!.id];
  const { adminRoles } = server;
  const member = client.guilds.resolve(message.guild!.id)?.members?.cache?.get(message.author.id);
  if (member === undefined) return 'unknown';
  const a = member.roles.cache.some((role) => adminRoles.includes(role.id));
  const b = member.permissions.has('ADMINISTRATOR');
  if (a || b) return null;

  return 'botAdmin';
}
