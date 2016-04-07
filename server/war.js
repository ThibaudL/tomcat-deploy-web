'use strict';

const http = require('http');
const fs = require('fs');
const URL = require('url');
const Q = require('q');
const config = require('./config');
const downloadedDir = config.downloadedDir;

const makeDirectory = function () {
  const deferred = Q.defer();

  fs.stat(downloadedDir, (exist) => {
    if (!exist) {
      deferred.resolve(downloadedDir);
      return;
    }
    fs.mkdir(downloadedDir, (err) => {
      if (err) {
        deferred.reject(err);
        return;
      }
      deferred.resolve(downloadedDir);
    });
  });
  return deferred.promise;
};

const warname = function (name) {
  return `${name}.war`;
};

const fullpath = function (name) {
  return `${downloadedDir}/${warname(name)}`;
};
const managedOld = function (item) {
  const deferred = Q.defer();
  const name = item.name;
  const path = fullpath(name);
  try {
    fs.stat(path, (err) => {
      if (err) {
        deferred.resolve(false);
        return;
      }
      const time = new Date().getTime();
      fs.renameSync(path, `${path}.${time}`);
      deferred.resolve(true);
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }
  return deferred.promise;
};

const download = function (item) {
  const deferred = Q.defer();
  try {
    const name = item.name;
    const url = item.url;
    const war = warname(name);
    const path = fullpath(name);
    const file = fs.createWriteStream(path);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          deferred.resolve(war);
        });
      });
    }).on('error', (err) => {
      fs.unlink(path);
      deferred.reject(err);
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }
  return deferred.promise;
};

const host = function (configuration) {
  return `http://${configuration.host}`;
};

const rollback = function (configuration, item, oldVersion) {
  const deferred = Q.defer();
  try {
    const root = host(configuration);
    const parsingUrl = URL.parse(root);
    const url = `${root}/manager/text/deploy?path=/${item.name}&update=true`;
    const options = {
      host: parsingUrl.hostname,
      method: 'PUT',
      port: parsingUrl.port,
      path: url,
      auth: `${configuration.username}:${configuration.password}`
    };
    const req = http.request(options, (rs) => {
      let result = '';
      rs.on('data', (data) => {
        result += data;
      });
      rs.on('end', () => {
        if (rs.statusCode === 200) {
          deferred.resolve(result);
        } else {
          deferred.reject(rs);
        }
      });
    }).on('error', (e) => {
      deferred.reject(e);
    });

    fs.readFile(`${downloadedDir}/${oldVersion.f}`, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        req.end(data);
      }
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }
  return deferred.promise;
};


const deploy = function (configuration, item) {
  const deferred = Q.defer();
  try {
    const root = host(configuration);
    const parsingUrl = URL.parse(root);
    const url = `${root}/manager/text/deploy?path=/${item.name}&update=true`;
    const options = {
      host: parsingUrl.hostname,
      method: 'PUT',
      port: parsingUrl.port,
      path: url,
      auth: `${configuration.username}:${configuration.password}`
    };
    const req = http.request(options, (rs) => {
      let result = '';
      rs.on('data', (data) => {
        result += data;
      });
      rs.on('end', () => {
        if (rs.statusCode === 200 && result.indexOf('ECHEC') === -1 && result.indexOf('FAIL') === -1) {
          deferred.resolve(result);
        } else {
          deferred.reject(rs);
        }
      });
    }).on('error', (e) => {
      deferred.reject(e);
    });

    fs.readFile(fullpath(item.name), (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        req.end(data);
      }
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }
  return deferred.promise;
};

const test = function (h, username, password) {
  const deferred = Q.defer();
  try {
    const root = `http://${h}`;
    const parsingUrl = URL.parse(root);
    const url = `${root}/manager/text/list`;
    const options = {
      host: parsingUrl.hostname,
      method: 'GET',
      port: parsingUrl.port,
      path: url,
      auth: `${username}:${password}`
    };
    http.get(options, (rs) => {
      const bodyChunks = [];
      rs.on('data', (chunk) => {
        bodyChunks.push(chunk);
      }).on('end', () => {
        const body = Buffer.concat(bodyChunks).toString('utf8');
        deferred.resolve({ status: rs.statusCode, body });
      });
    }).on('error', (e) => {
      console.error('Error inc calling', e);
      const body = e.message || 'Error';
      deferred.reject({ status: 404, body });
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }
  return deferred.promise;
};

const undeploy = function (configuration, item) {
  const deferred = Q.defer();
  try {
    const root = host(configuration);
    const parsingUrl = URL.parse(root);
    const url = `${root}/manager/text/undeploy?path=/${item.name}`;
    const options = {
      host: parsingUrl.hostname,
      method: 'GET',
      port: parsingUrl.port,
      path: url,
      auth: `${configuration.username}:${configuration.password}`
    };

    http.get(options, (rs) => {
      let result = '';
      rs.on('data', (data) => {
        result += data;
      });
      rs.on('end', () => {
        if (rs.statusCode === 200) {
          deferred.resolve(result);
        } else {
          deferred.reject(rs);
        }
      });
    }).on('error', (e) => {
      deferred.reject(e);
    });
  } catch (e) {
    console.error(e);
    deferred.reject(e);
  }


  return deferred.promise;
};

module.exports = {
  makedirectory: makeDirectory,
  managedOld: managedOld,
  download: download,
  undeploy: undeploy,
  deploy: deploy,
  test: test,
  rollback: rollback
};
