const service = {
    getServerUrl: function () {
        const serverHostname: string = window.location.hostname;
        // we could be using 'window.location.host' if only I knew how to serve a react app with express in dev mode..
        const serverPort: string = '4000';
        const serverUrl = 'http://' + serverHostname + ':' + serverPort;
        return serverUrl;
    },

    fetchLocalIps: async function () {
        return window.fetch(this.getServerUrl() + '/ips');
    },

    fetchConfig: async function () {
        return window.fetch(this.getServerUrl() + '/config');
    }
};

export default service;
