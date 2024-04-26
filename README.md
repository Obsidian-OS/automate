# Browser Plugin

This plugin produces a very simplistic, yet integrated browser into Obsidian. It features most of the UI features found in mainstream browsers. 

## Features:

The following features are implemented/planned:

- [x] Tabs
- [x] Opening tabs at predefined URLs
- [x] Duplicate tabs
- [x] Configure Search engines
- [x] Set home page
- [ ] Focus URL bar with hotkey
- [ ] Set default browser
- [ ] History navigation
- [ ] Action context menu

## Building

Building is simple but unfortunately doesn't work on Windows. You'll need to build on WSL, Cygwin or Git Bash. 
I prefer 'pnpm' over any other package manager, and NuShell so just adjust the commands as you see fit.

1. Install dependencies:
```nu
pnpm install
```

2. Define the location of your vault (only necessary for auto-installing)
```nu
$env.vault_dir = ~/ObsidianVault
```

3. Build (Includes an install step)
```
pnpm exec tsc -p tsconfig.json
pnpm run build
```

4. Build (Without install step)
```
pnpm exec tsc -p tsconfig.json
pnpm exec mkjson 'build/*'
```

That should be everything. In Obsidian, you'll now need to ensure community plugins are enabled, refresh the plugin list and activate the browser plugin.

## Actions

There are currently three actions defined:

* `New Browser Tab` - Opens a new tab
* `Duplicate Tab` - Creates a new tab with the same URL as the currently open one
* `Focus URL Bar` - Focuses the URL bar [Not implemented]