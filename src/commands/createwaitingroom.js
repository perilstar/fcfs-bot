const { Command } = require('discord-akairo');

class CreateWaitingRoomCommand extends Command {
  constructor() {
    super('createwaitingroom', {
      aliases: ['createwaitingroom', 'cwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'roomName',
          type: 'string'
        },
        {
          id: 'monitorChannel',
          type: 'string',
        },
        {
          id: 'displayChannel',
          type: 'string'
        },
        {
          id: 'firstN',
          type: 'number'
        },
        {
          id: 'rejoinWindow',
          type: 'number'
        },
        {
          id: 'afkCheckDuration',
          type: 'number'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!args.roomName) {
      return message.channel.send(`Error: Missing argument: \`roomName\`. Use fcfs!help for commands.`);
    }
    if (!args.monitorChannel) {
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.displayChannel) {
      return message.channel.send(`Error: Missing argument: \`displayChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.firstN) {
      return message.channel.send(`Error: Missing argument: \`firstN\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return message.channel.send(`Error: Missing argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }
    if (!args.afkCheckDuration) {
      return message.channel.send(`Error: Missing argument: \`afkCheckDuration\`. Use fcfs!help for commands.`);
    }

    
    if (!message.guild.channels.resolve(args.monitorChannel)) {
      return message.channel.send(`Error: Channel \`${args.monitorChannel}\` does not exist!`);
    }
    if (message.guild.channels.resolve(args.monitorChannel).type != 'voice') {
      return message.channel.send(`Error: \`${args.monitorChannel}\` is not a voice channel!`);
    }

    if (server.monitoredChannels[args.monitorChannel]) {
      return message.channel.send(`Error: channel \`${args.roomName}\` is already being monitored!`);
    }

    if (!message.guild.channels.resolve(args.displayChannel)) {
      return message.channel.send(`Error: Channel \`${args.displayChannel}\` does not exist!`);
    }
    if (message.guild.channels.resolve(args.displayChannel).type != 'text') {
      return message.channel.send(`Error: \`${args.displayChannel}\` is not a text channel!`);
    }

    let displayMessage = '';

    try {
      displayMessage = await message.guild.channels.resolve(args.displayChannel).send('<Pending Update>');
    } catch (err) {
      return message.channel.send('Something went wrong. Does the bot have permissions to send messages in `displayChannel`?')
    }

    let data = {
      guildID: message.guild.id,
      id: args.monitorChannel,
      name: args.roomName,
      displayChannel: args.displayChannel,
      displayMessage: displayMessage.id,
      firstN: args.firstN,
      rejoinWindow: args.rejoinWindow,
      afkCheckDuration: args.afkCheckDuration,
      restrictedMode: false,
      allowedRoles: [],
      snowflakeQueue: []
    }

    let monitoredChannel = server.addMonitoredChannel(data);
    await monitoredChannel.init();
    
    this.client.datasource.saveMonitor(args.monitorChannel)

    return message.channel.send('Success!');
  }
}

module.exports = CreateWaitingRoomCommand;