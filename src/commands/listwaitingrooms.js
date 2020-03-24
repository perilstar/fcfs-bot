const { Command } = require('discord-akairo');

class ListWaitingRoomsCommand extends Command {
  constructor() {
    super('listwaitingrooms', {
      aliases: ['listwaitingrooms', 'lwr'],
      split: 'quoted',
      channelRestriction: 'guild',
      userPermissions: ['ADMINISTRATOR']
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let monitoredChannels = server.monitoredChannels;
    
    let names = [];
    let snowflakes = [];

    let monitoredPromises = [];
    let displayPromises = [];

    for (let snowflake in monitoredChannels) {
      names.push(monitoredChannels[snowflake].name);
      snowflakes.push(snowflake);

      monitoredPromises.push(this.client.channels.fetch(snowflake));
      displayPromises.push(this.client.channels.fetch(monitoredChannels[snowflake].displayChannel));
    }

    let monitoredNames = [];
    let displayNames = [];

    await Promise.all(monitoredPromises).then(channels => {
      monitoredNames = channels.map(channel => channel.name);
    });

    await Promise.all(displayPromises).then(channels => {
      displayNames = channels.map(channel => channel.name);
    });

    let lines = [];

    for (let i = 0; i < names.length; i++) {
      lines.push(`[${snowflakes[i]}] "${names[i]}" monitors "${monitoredNames[i]}" and displays in "${displayNames[i]}"`)
    }

    let text = "```\n" + lines.join('\n') + "\n```";

    message.channel.send(text);
  }
}

module.exports = ListWaitingRoomsCommand;