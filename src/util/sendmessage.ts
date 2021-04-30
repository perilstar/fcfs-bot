import type { DMChannel, TextChannel } from 'discord.js';
import { Util } from 'discord.js';

export default async function sendmessage(channel: TextChannel | DMChannel, text: string) {
  if (channel.deleted) return console.error('Failed to send message in deleted channel!');
  const cleanContent = Util.removeMentions(text);
  return channel.send(cleanContent)
    .catch((err: Error) => {
      if (err.message === 'Missing Permissions') {
        if (channel.type === 'text') {
          // eslint-disable-next-line max-len
          console.error(`Failed to send message in #${channel.name} (ID #${channel.id}) due to Missing Permissions!`);
        } else {
          // eslint-disable-next-line max-len
          console.error(`Failed to send message in a DM (ID #${channel.id}) due to Missing Permissions!`);
        }
        return null;
      }
      console.log(`Error trying to send a message!\n${err.message}`);
      throw (err);
    });
}
