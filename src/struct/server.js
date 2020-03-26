const MonitoredChannel = require('./monitored_channel');

class Server {
  constructor(client, id, prefix) {
    this.client = client;
    this.id = id;
    this.prefix = prefix;

    this.monitoredChannels = {};
  }

  addMonitoredChannel(data) {
    let monitoredChannel = new MonitoredChannel(this.client, data);
    return this.monitoredChannels[data.id] = monitoredChannel;
  }

  removeMonitoredChannel(id) {
    delete this.monitoredChannels[id];
  }

  async initMonitors() {
    for (let id in this.monitoredChannels) {
      await this.monitoredChannels[id].init();
    }
  }
}

module.exports = Server;