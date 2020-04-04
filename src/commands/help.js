const { Command } = require('discord-akairo');
const { TextChannel } = require('discord.js');
const sendmessage = require('../util/sendmessage');

class HelpCommand extends Command {
  constructor() {
    super('help', {
      aliases: ['help', 'about', 'commands'],
      args: [
        {
          id: 'page',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {

    const pages = {
      default: `
        __Help pages:__

        \`roles\`: Configuring Bot Admin, Mod, and Helper roles
        \`admin\`: Bot Admin commands
        \`mod\`: Bot Mod commands
        \`helper\`: Bot Helper commands
        \`base\`: Commands that anyone can use

        To access a page, type \`fcfs!help [page].\`
        Example: \`fcfs!help admin\` for info about Bot Admin commands

        BUGS? Create an issue on the GitHub repository:
        <https://github.com/perilstar/fcfs-bot>

        \`v${this.client.version} by perilstar with help from StKWarrior\`
        `,
      roles: `
        __Configuring Bot Admin Mod and Helper roles:__
        *All of these commands require the Administrator permission to use.*
        
        \`addadminrole "<roleName>"\`
        Adds a role as Bot Admin. Admin commands are described in \`fcfs!help admin\`.
        *Aliases:* \`aar\`
        
        \`removeadminrole "<roleName>"\`
        Removes a role as Bot Admin.
        *Aliases:* \`rar\`
        
        \`listadminroles\`
        Lists all Bot Admin roles for the server.
        *Aliases:* \`lar\`
        
        \`addmodrole "<roleName>"\`
        Adds a role as Bot Mod. Mod commands are described in \`fcfs!help mod\`.
        *Aliases:* \`amr\`
        
        \`removemodrole "<roleName>"\`
        Removes a role as Bot Mod.
        *Aliases:* \`rmr\`
        
        \`listmodroles\`
        Lists all Bot Mod roles for the server.
        *Aliases:* \`lmr\`
        
        \`addhelperrole "<roleName>"\`
        Adds a role as Bot Helper. Helper commands are described in \`fcfs!help helper\`.
        *Aliases:* \`ahr\`
        
        \`removehelperrole "<roleName>"\`
        Removes a role as Bot Helper.
        *Aliases:* \`rhr\`
        
        \`listhelperroles\`
        Lists all Bot Helper roles for the server.
        *Aliases:* \`lhr\`
      `,
      admin: `
        __Bot Admin commands:__
        *All of these commands require Bot Admin permissions to use. Bot Admins may also use commands from Bot Mod and Bot Helper.*

        \`setprefix <prefix>\`
        Sets the bot prefix for the server.
        *Aliases:* \`prefix\`

        \`createwaitingroom "<monitorChannel>" <displayCount> <rejoinWindow> <afkCheckDuration>\`
        Creates a waiting room that displays the first displayCount members to join monitorChannel in the channel the command,
        was typed in, with a grace period of rejoinWindow for accidental disconnects, and waiting afkCheckDuration to remove
        the user from queue when they're afk-checked.
        *Aliases:* \`cwr\`
        *Example:* \`fcfs!cwr "Waiting Room 1" 10 1m 5m\`

        \`deletewaitingroom "<monitorChannel>"\`
        Removes the waiting room associated with \`monitorChannel\`.
        *Aliases:* \`dwr\`

        \`listwaitingrooms\`
        Lists all waiting rooms in the server.
        *Aliases:* \`lwr\`

        \`setdisplaysize "<monitorChannel>" <displaySize>\`
        Sets the display max length for the waiting room associated with \`monitorChannel\`.
        *Aliases:* \`sds\`

        \`setrejoinwindow "<monitorChannel>" <rejoinWindow>\`
        Sets the rejoin window for the waiting room associated with \`monitorChannel\`.
        *Aliases:* \`srw\`

        \`setafkcheckduration "<monitorChannel>" <afkCheckDuration>\`
        Sets the AFK check duration for the waiting room associated with \`monitorChannel\`.
        *Aliases:* \`sacd\`
      `,
      mod: `
        __Bot Mod commands:__
        *All of these commands require Bot Mod permissions to use. Bot Mods may also use commands from Bot Helper.*

        \`setposition <member> <position>\`
        Sets a user's position in the queue that they're in.
        *Aliases:* \`sp\`

        \`afkchecktop "<monitorChannel>"\`,
        AFK-checks all members displayed in the waiting room display.
      `,
      helper: `
        __Bot Helper commands:__
        *All of these commands require Bot Helper permissions to use.*

        \`afkcheck <member>\`
        Sends the user a DM with a reaction on it, which they must click within the configured \`afkCheckDuration\` to stay in the queue.
        *Aliases:* \`afk\`
      `,
      base: `
        __Base Commands__
        *Anyone can use these commands.*

        \`info "<monitorChannel>"\`
        Displays info about the waiting room associated with \`monitorChannel\`.
        *Example:* \`fcfs!info "Waiting Room 1"\`
        
        \`position "[member]"\`
        Displays the command sender's position in the queue, or the referenced \`member\`.
        *Aliases:* \`p\`
        *Example:* \`fcfs!p "peril"\` OR \`fcfs!p\`

        \`queuelength "<monitorChannel>"\`
        Displays the queue length of the waiting room associated with \`monitorChannel\`.
        *Aliases:* \`ql\`
        *Example:* \`fcfs!ql "Waiting Room 1"\`
      `
    };

    let page = args.page ? args.page : 'default';

    if (!pages[page]) {
      return sendmessage(message.channel, 'Unknown page!');
    }

    let content = `**First Come, First Serve**\n*Default prefix:* \`fcfs!\`\n\n` + pages[page].trim().split('\n').map(line => line.trim()).join('\n');

    let dmChannel = message.author.dmChannel;

    if (!dmChannel) {
      dmChannel = await message.author.createDM();
    }

    if (message.channel instanceof TextChannel) {
      sendmessage(message.channel, 'Sending you a DM with the help message!');
    }
    return sendmessage(dmChannel, content);
  }
}

module.exports = HelpCommand;