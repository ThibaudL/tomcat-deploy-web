var deploydb = require('../deploydb');
var remoteConsole = function (io) {
    return {
        error: function (msg) {
            io.sockets.emit('rc-error', msg);
        },
        log: function (msg) {
            io.sockets.emit('rc-log', msg);
        },
        end: function () {
            io.sockets.emit('rc-end', {});
        },
        start: function () {
            io.sockets.emit('rc-start', {});
        }
    };
};


module.exports = function (socket, io, ip) {
    var war = require('../war'),
        rc = remoteConsole(io);

    socket.on('versions', function (data) {
        console.log(data);
        socket.emit('on-versions', data);
    });

    socket.on('undeploy', function (data) {
        var recursiveUndeploy = function (artifacts) {
            if (!artifacts || artifacts.length === 0) {
                rc.end();
                return;
            }

            try {
                var last = artifacts.slice(-1)[0];
                var rest = artifacts.slice(0, -1);
                rc.log('undeploy : ' + last.name);
                war.undeploy(deploydb.config().data[0], last).then(function (name) {
                    rc.log('undeployed : ' + name);
                    recursiveUndeploy(rest);
                }, function (err) {
                    console.error(err);
                    rc.error('error in undeploying');
                    rc.error(err.message);
                    recursiveUndeploy(rest);
                });

            } catch (err) {
                console.error(err);
                if (err.stack) {
                    console.error(err.stack);
                }
                rc.error('Exception in deployement');
                rc.error(err.message);
                rc.end();
            }
        };
        recursiveUndeploy(data);
    });

    socket.on('deploy', function (data) {

            var errorLogger = function (msg, o) {
                return function (err) {
                    if (o) {
                        socket.emit('replace-item', deploydb.updateStatus(deploydb.files(), o, 'KO'));
                    }
                    io.sockets.emit('deploy-end', {});
                    rc.error(msg);
                    rc.error(err.message);
                    rc.end();
                };
            };

            var configuration = deploydb.config().data[0];
            var launch_inner = function (array) {
                if (!array || array.length === 0) {
                    rc.end();
                    return;
                }
                var o = array.shift();
                rc.log('managing old version :' + o.name);
                war.managedOld(o).then(
                    function () {
                        rc.log('prepare download :' + o.name);
                        war.download(o).then(
                            function (name) {
                                rc.log('deploy : ' + name);
                                war.undeploy(deploydb.config().data[0], o).then(function () {
                                    rc.log('Undeployed : ' + name);

                                    war.deploy(configuration, o).then(
                                        function (name) {
                                            rc.log('Updated : ' + name);
                                            socket.emit('replace-item', deploydb.updateStatus(deploydb.files(), o, 'OK'));
                                            io.sockets.emit('rc-end', {});
                                            io.sockets.emit('deploy-end', {});
                                            launch_inner(array);
                                        }, errorLogger('error in deploying', o));
                                }, errorLogger('error in undeploying', o));
                            }, errorLogger('error in downloading', o));

                    }, errorLogger('error in managing old war', o));

            };
            io.sockets.emit('deploy-start', {type:'Deploy',host:ip});
            rc.start();

            rc.log('selected wars :' + data.length + ' by ' + ip);
            war.makedirectory().then(function () {
                rc.log('root directory : OK.');
                launch_inner(data);
            });
        }
    );
};
