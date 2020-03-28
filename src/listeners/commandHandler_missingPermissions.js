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
    if (missing == 'botAdmin') {
      return sendmessage(message.channel, 'Missing permissions to do this! Are you a bot admin?')
    }
    if (type == 'user') {
      return sendmessage(message.channel, 'Missing permissions to do this! Are you an Administrator?');
    }
  }
}

module.exports = MissingPermissionsListener;