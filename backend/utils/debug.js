function colorText(message, color) {
    if (color) {
        return `\x1b[${color}m${message}\x1b[0m`;
    }
    return message;
  }

export function debugServerLogs(logLevel, agServer) {
    if (logLevel >= 1) {
        (async () => {
            for await (let { error } of agServer.listener("error")) {
                console.error(error);
            }
        })();
    }

    if (logLevel >= 2) {
        console.log(
            `   ${colorText("[Active]", 32)} SocketCluster worker with PID ${
                process.pid
            } is listening on port ${process.env.SOCKETCLUSTER_PORT}`
        );

        (async () => {
            for await (let { warning } of agServer.listener("warning")) {
                console.warn(warning);
            }
        })();
    }
}