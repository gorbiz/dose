# Remote code @ phone

```sh
adb devices # probably shows no devices, so do:
sudo adb kill-server 
sudo adb start-server
```

Now hopefully it will show up under *Remote devices* in Chrome Dev Tools.
And USB Debugging has been enabled on the phone and the computer authorized to debug it.
