# Setup dev server
Requirements:
 - `mkcert` ex. `sudo pacman -Syu mkcert`
 - `127.0.0.1  dose.dev` in `/etc/hosts

```sh
npm install
npm start
# And open https://dose.dev:8080 (or whichever is rePORTed)
```

# Generate icons
```sh
npm run make-icons
```
Not sure which sizes are needed, maybe 192, 512 are enough: https://github.com/GoogleChrome/lighthouse/issues/291
Also, `dose.webmanifest` needs to be manually updated.

# Deploy to test server
⚠️ Remove everything there at the server once before doing this ...probably.
```sh
rsync -avzh --exclude .git --exclude node_modules * cloud:dev.lifefeed.me
```

# Remote code @ phone

```sh
adb devices # probably shows no devices, so do:
sudo adb kill-server
sudo adb start-server
# if listed in `adb devices` but with no permissions: repeat the above :P
```

Now hopefully it will show up under chrome://inspect/#devices (in Chromium).
And USB Debugging has been enabled on the phone and the computer authorized to debug it.

## Ad-hoc backup
Open browser console & type `copy(localStorage.logs)` and overwrite `../dose-data/logs-<device>.json`.
