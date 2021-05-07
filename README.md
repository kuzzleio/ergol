# Ergol

__For development purposes only__

This script is meant to run on top of another process while watching source files. If any change occurs, it automatically shuts the process down, __WAIT__ until it has correctly been stopped (or kills it after some delay), and only then restarts it.

This script is meant to replace solutions like nodemon, which have a few cumbersome caveats.


## Usage

`$ npx ergol <script> -c <config> -d <cwd>`

| Options         | Alias | Required | Description                                                             |
|-----------------|-------|----------|-------------------------------------------------------------------------|
| No flag needed  | -     | yes      | Script that runs under this process and that is reloaded when necessary |
| `--config`      | `-c`  | no       | JSON file containing configuration variables intended to override default ones |
| `--cwd`         | `-d`  | no       | Current Working Directory (if different from your actual cwd)           |
| `--script-args` | -     | no       | Arguments to pass to the script                                         |
| `--node-args`   | -     | no       | Arguments to pass to the node interpreter                               |
| `--watch`       | `-w`  | no       | Array of cwd relative path/to/directories or files to watch             |
| `--kill-delay`  | `-k`  | no       | Kill the process if it did not stop after this delay                    |


## Configuration

Ergol allows you to customize its behavior when necessary. If its a ponctual setting you can use one of the command argument listed before but we recommend using a config file when using recurrent options.

If you choose to use both methods, beware of which setting will be selected. Ergol will resolve each parameter by looking for command options first, config file then and default config otherwise.

### Default Config

```json
{
  "killDelay": "5000",
  "nodeArgs": [],
  "scriptArgs": [],
  "watch": [
    "lib",
    "src",
    "index.*s",
    "nodes_modules"
  ]
}
```


## Example

```sh-session
$ npx ergol scripts/start-app.js -c config/ergol.config.json --script-args=--option my-option-1
```

### ergol.config.json

```json
{
  "killDelay": "10000",
  "watch": [
    "index.ts",
    "src",
    "package-lock.json"
  ]
}
```

### Final Ergol Configuration

```json
{
  "killDelay": "10000",
  "nodeArgs": [],
  "scriptArgs": [
    "--option my-option-1"
  ],
  "watch": [
    "index.ts",
    "src",
    "package-lock.json"
  ]
}
```
