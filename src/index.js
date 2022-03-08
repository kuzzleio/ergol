/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2021 Kuzzle
 * mailto: support AT kuzzle.io
 * website: http://kuzzle.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */

'use strict';

const path = require('path');
const clc = require('cli-color');
const chokidar = require('chokidar');
const { fork } = require('child_process');
const StateEnum = require('./stateEnum');

let notEnoughWatcherError = false;

/**
 * Process running under this one and that is reloaded when necessary
 */
let childProcess;

/**
 * ChildProcess current state
 */
let state = StateEnum.STOPPED;

/**
 * Execute a script and run on top it while watching requested files.
 * When a file changes, it automatically shuts the current process down,
 * wait until it has correctly been stopped (or kills it after some delay),
 * and only then restarts it.
 *
 * @param {Object} config Configuration variables
 * @param {string} script Path to the script that runs under this process and that is reloaded when necessary
 * @param {Array<string>} scriptArgs Arguments to pass to the script (Default to [])
 * @param {Array<string>} nodeArgs Arguments to pass to the node interpreter (Default to [])
 */
async function run(config, script) {
  const watcher = chokidar.watch(script);
  watcher.add(config.watch.map(dir => path.join(config.cwd, dir)));

  watcher.on('change', async file => {
    if (state !== StateEnum.STOPPING) {
      console.log(clc.green(`[RELOADER] Change detected on ${path.relative(config.cwd, file)}. Reloading...`));
      await stopProcess(config.killDelay);
      startProcess(script, config.scriptArgs, config.nodeArgs);
    }
  });

  process.on('SIGUSR1', async () => {
    console.log(clc.green('[RELOADER] Caught signal SIGUSR1. Restarting...'));
    await stopProcess(config.killDelay);
    startProcess(script, config.scriptArgs, config.nodeArgs);
  });

  process.on('unhandledRejection', async error => {
    if (error.message.includes('ENOSPC')) {
      if (notEnoughWatcherError) {
        return;
      }

      notEnoughWatcherError = true;

      console.error(error.message);
      console.error('  You system does not have enough file watchers to run Ergol.');
      console.error('  You need to increase this number:');
      console.error('    - Linux: "sudo sysctl -w fs.inotify.max_user_watches=524288"');
      console.error('    - OSX: "sudo sysctl -w kern.maxfiles=524288"');
      console.error('\n  Or you can just search "increase system file watcher <your os>"');

      await stopProcess(config.killDelay);
      process.exit(1);
    }
    else {
      throw error;
    }
  });

  startProcess(script, config.scriptArgs, config.nodeArgs);
}

/**
 * Starts the child process with the given args
 *
 * @param {string} script Path to the script that runs under this process and that is reloaded when necessary
 * @param {Array<string>} scriptArgs Arguments to pass to the script (Default to [])
 * @param {Array<string>} nodeArgs Arguments to pass to the node interpreter (Default to [])
 */
function startProcess (script, scriptArgs, nodeArgs) {
  childProcess = fork(script, scriptArgs, {
    detached: true,
    execArgv: nodeArgs,
  });

  childProcess.on('exit', (code, signal) => {
    const msg = code !== null
      ? `code ${code}`
      : `signal ${signal}`;

    console.log(clc.red(`[RELOADER] Process exited with ${msg}. Waiting for a file change to restart it.`));
    childProcess = null;
    state = StateEnum.STOPPED;
  });

  // Exits child process on termination
  for (const signal of ['SIGINT', 'SIGTERM']) {
    // eslint-disable-next-line no-loop-func
    process.on(signal, () => {
      if (childProcess) {
        childProcess.kill(signal);
      }

      process.exit();
    });
  }

  state = StateEnum.RUNNING;
}

/**
 * Gracefully shuts the current process down or kills it after some delay
 *
 * @param {number} killDelay Max delay after which the process must be killed
 */
async function stopProcess (killDelay) {
  if (state !== StateEnum.RUNNING) {
    return;
  }

  state = StateEnum.STOPPING;

  childProcess.removeAllListeners();

  let exited = false;

  childProcess.on('exit', () => {
    exited = true;
  });

  childProcess.kill();

  // Wait a certain delay for the process to stop itself and if time is up, kills it
  const now = Date.now();
  let forced = false;

  while (!exited) {
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!forced && (Date.now() - now) > killDelay) {
      console.log(clc.red(`[RELOADER] Process still here after ${killDelay}ms. Sending a SIGKILL signal`));
      childProcess.kill('SIGKILL');
      forced = true;
    }
  }

  state = StateEnum.STOPPED;
}

module.exports = run;