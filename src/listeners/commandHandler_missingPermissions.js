const { Listener } = require('discord-akairo');

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions'
    });
  }

  exec(message, command, type, missing) {
    if (type == 'user') {
      message.channel.send('Missing permissions! Are you an Administrator?');
    }
  }
}

module.exports = MissingPermissionsListener;