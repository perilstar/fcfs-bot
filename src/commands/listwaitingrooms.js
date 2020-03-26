const { Command } = require('discord-akairo');

class ListWaitingRoomsCommand extends Command {
  constructor() {
    super('listwaitingrooms', {
      aliases: ['listwaitingrooms', 'lwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitoredChannels = server.monitoredChannels;
    
    let monitoredNames = [];
    let displayNames = [];

    for (let snowflake in monitoredChannels) {
      if (!monitoredChannels[snowflake].initialised) {
        await monitoredChannels[snowflake].init();
      }
      monitoredNames.push(monitoredChannels[snowflake].name);
      displayNames.push(monitoredChannels[snowflake].displayChannelName);
    }

    let lines = [];

    for (let i = 0; i < monitoredNames.length; i++) {
      lines.push(`'${monitoredNames[i]}' queue is displayed in '#${displayNames[i]}'`)
    }

    let text = '```\n' + lines.join('\n') + '\n```';

    message.channel.send(text);
  }
}

module.exports = ListWaitingRoomsCommand;