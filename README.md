# Ergol

__For development purposes only__

This script is meant to run on top of another process while watching source files. If any change occurs, it automatically shuts the process down, __WAIT__ until it has correctly been stopped (or kills it after some delay), and only then restarts it.

This script is meant to replace solutions like nodemon, which have a few cumbersome caveats.


## Usage

` $ npx ergol <script> -s <script-args> -n <node-args> -c <config> -d <cwd>
`

| Options         | Alias | Required | Description                                                             |
|-----------------|-------|----------|-------------------------------------------------------------------------|
| No flag needed  | -     | yes      | Script that runs under this process and that is reloaded when necessary |
| `--script-args` | `-s`  | no       | Arguments to pass to the script                                         |
| `--node-args`   | `-n`  | no       | Arguments to pass to the node interpreter                               |
| `--config`      | `-c`  | no       | JSON file containing configuration variables intended to override default ones |
| `--cwd`         | `-d`  | no       | Current Working Directory (if different from your actual cwd)           |
| `--watch`       | `-w`  | no       | Array of cwd relative path/to/directories or files to watch             |
| `--kill-delay`  | `-k`  | no       | Kill the process if it did not stop after this delay                    |


## Example

```sh-session
$ npx ergol //todo
```
