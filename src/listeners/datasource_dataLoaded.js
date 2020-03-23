const { Listener } = require('discord-akairo');

class DataLoadedListener extends Listener {
  constructor() {
    super('dataLoaded', {
      emitter: 'datasource',
      event: 'dataLoaded'
    });
  }

  exec() {
    let currentlyInGuilds = this.client.guilds.cache.keys();
    for (let snowflake of currentlyInGuilds) {
      if (!this.client.datasource.servers[snowflake]) {
        this.client.datasource.addServer(snowflake);
        this.client.datasource.saveServer(snowflake);
      }
    }
  }
}

module.exports = DataLoadedListener;