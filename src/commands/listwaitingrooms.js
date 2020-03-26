const { Command } = require('discord-akairo');

class ListWaitingRoomsCommand extends Command {
  constructor() {
    super('listwaitingrooms', {
      aliases: ['listwaitingrooms', 'lwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'page',
          type: 'number'
        }
      ]
    });
  }

  async exec(message, args) {
    let page = args.page || 1;

    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    let channelMonitors = server.channelMonitors;
    
    let monitoredNames = [];
    let displayNames = [];

    for (let snowflake in channelMonitors) {
      if (!channelMonitors[snowflake].initialised) {
        await channelMonitors[snowflake].init();
      }
      monitoredNames.push(channelMonitors[snowflake].name);
      displayNames.push(channelMonitors[snowflake].displayChannelName);
    }

    let lines = [];

    for (let i = 0; i < monitoredNames.length; i++) {
      lines.push(`'${monitoredNames[i]}' queue is displayed in '#${displayNames[i]}'`)
    }

    let pages = Math.ceil(lines.length / 10);

    let currentPage = [];

    if (page > pages || page < 1) {
      currentPage = ['<NONE>']
    } else {
      currentPage = lines.slice((page - 1) * 10, 10);
    }

    let text = '```\n' + currentPage.join('\n') + '\n\nPage ' + page + '/' + pages + '```';

    message.channel.send(text);
  }
}

module.exports = ListWaitingRoomsCommand;