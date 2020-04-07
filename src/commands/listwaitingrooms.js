const { Command } = require('discord-akairo');
const mps_admin = require('../util/mps_admin');
const sendmessage = require('../util/sendmessage');

class ListWaitingRoomsCommand extends Command {
  constructor() {
    super('listwaitingrooms', {
      aliases: ['listwaitingrooms', 'lwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: (message) => mps_admin(this.client, message),
      args: [
        {
          id: 'page',
          type: 'integer'
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
      lines.push(`'${monitoredNames[i]}' queue is displayed in '#${displayNames[i]}'`);
    }

    let pages = Math.ceil(lines.length / 10);

    let currentPage = [];

    if (page > pages || page < 1) {
      currentPage = ['<NONE>'];
    } else {
      currentPage = lines.slice((page - 1) * 10, 10);
    }

    let text = '```\n' + currentPage.join('\n') + '\n\nPage ' + page + '/' + pages + '```';

    return sendmessage(message.channel, text);
  }
}

module.exports = ListWaitingRoomsCommand;