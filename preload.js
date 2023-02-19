const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    invoke: (channel, ...args) => {
        return ipcRenderer.invoke(channel, ...args);
    },
    readImage: (path, callback) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                const buffer = Buffer.from(data);
                callback(null, buffer);
            }
        });
    },
});
