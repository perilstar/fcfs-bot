import { Message } from 'discord.js';
import FCFSClient from '../fcfsclient';
import mpsAdmin from './mps_admin';

export default function mpsMod(client: FCFSClient, message: Message) {
  const server = client.dataSource.servers[message.guild!.id];
  const { modRoles } = server;
  const member = client.guilds.resolve(message.guild!.id)?.members?.cache?.get(message.author.id);
  if (member === undefined) return 'unknown';
  const a = member.roles.cache.some((role) => modRoles.includes(role.id));
  const b = mpsAdmin(client, message);
  if (a || !b) return null;

  return 'botMod';
}
