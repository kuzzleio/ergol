# Kuzzle Reloader

__For development purposes only__

This script is meant to be run on top of a Kuzzle starter script. It watches source files (json, ts, js) from Kuzzle core, plugins, configuration files. When a file changes, it automatically shuts the current process down, __WAIT__ until it has correctly been stopped (or kills it after some delay), and only then restarts it.

This script is meant to replace solutions like nodemon, which have a few cumbersome caveats.


## Usage

` $ npx kuzzle-reloader <config file> <node args> <starter script> <args>
`

| Arguments      | Description                               |
|----------------|-------------------------------------------|
| config files   | This script configuration file            |
| node args      | Arguments to pass to the node interpreter |
| starter script | The script to execute using node          |
| args           | Script arguments                          |


## Example

```sh-session
$ npx kuzzle-reloader --inspect=0.0.0.0:9229 -r ts-node/register docker/scripts/start-kuzzle-dev.ts --enable-plugins functional-test-plugin
```
