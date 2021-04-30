import { Message } from 'discord.js';
import FCFSClient from '../fcfsclient';
import mpsMod from './mps_mod';

export default function mpsHelper(client: FCFSClient, message: Message) {
  const server = client.dataSource.servers[message.guild!.id];
  const { helperRoles } = server;
  const member = client.guilds.resolve(message.guild!.id)?.members?.cache?.get(message.author.id);
  if (member === undefined) return 'unknown';
  const a = member.roles.cache.some((role) => helperRoles.includes(role.id));
  const b = mpsMod(client, message);
  if (a || !b) return null;

  return 'botHelper';
}
