const { Listener } = require('discord-akairo');
const sendmessage = require('../util/sendmessage');

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions'
    });
  }

  exec(message, command, type, missing) {
    if (type == 'user') {
      return sendmessage(message.channel, 'Missing permissions to do this! Are you an Administrator?');
    }
    if (type == 'botAdmin') {
      return sendmessage(message.channel, 'Missing permissions to do this! Are you a bot admin?')
    }
  }
}

module.exports = MissingPermissionsListener;