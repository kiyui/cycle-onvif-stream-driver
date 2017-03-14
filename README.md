# cycle-onvif-stream-driver
A Cycle.js driver for receving stream urls from ONVIF compatible IP cameras.

## installation
Install with NPM
```
npm install --save cycle-onvif-stream-driver
```

## sample
See `samples/`.

## usage
Import into your node code:
```javascript
const makeONVIFStreamDriver = require('cycle-onvif-stream-driver')
```
Register the driver:
```javascript
const drivers = {
  ...
  ONVIF: makeONVIFStreamDriver({
    command: `${__dirname}/sudo_arp_scan.sh`, // You can omit this if you have correct permission
    user: 'admin',
    pass: 'admin'
  })
}
```
Request format for `sockets` sink:
```javascript
{
  category: 'category',
  interface: 'wlp5s0'
}
```
For example:
```javascript
sources.ONVIF.select('category')
```

Sample output:
```javascript
[{  ip: '10.17.96.125',
    mac: '...',
    vendor: '...',
    timestamp: ...,
    stream: 'rtsp://...',
    fps: 15 }]
```

### passwords and ports
The `user` and `pass` keys determine the default authentication details for your IP cameras.
However if certain devices have specific or different passwords, you can always pass in a JSON
object with the appropriate values for `user` and `pass`. You can do the same for devices with
non-standard ONVIF ports (default is port 80).
```javascript
const drivers = {
  ...
  ONVIF: makeONVIFStreamDriver({
    ...
    passwords: {
      '10.17.96.125': {
        user: 'admin2',
        pass: 'admin',
        port: 8899
      },
      '10.17.96.126': {
        user: 'admin',
        pass: '12345'
      }
    },
    user: 'admin',
    pass: 'admin'
  })
}
```

## detection
This driver makes use of ARP requests instead of SOAP requests to detect cameras
as this is able to detect more cameras than the underlying ONVIF library can.
The detection makes use of `arp-scan`, which has to be installed and configured beforehand.
As you'll most likely want to be able to run the script as a regular user, you may have to
allow your user to execute `arp-scan` without a password. This can be acheived by configuring
your sudoers file as below.

### configure sudo
Run `visudo -f /etc/sudoers.d/arp-scan` and add the following, where `$user` is your username.
```
$user ALL = NOPASSWD: /usr/bin/arp-scan
```
After configuring this, you will still need a setup similar to that in `samples/`
to execute `arp-scan` with sudo prefixed to it.

### discover multiple subnets
By default, the `arpscan` library is set up to only discover IPs on the local subnet.
The driver can be configured to discover multiple subnets by passing an `args` list:
```javascript
const drivers = {
  ONVIF: makeONVIFStreamDriver({
    ...
    args: ['10.17.96.0/24', '192.168.191.0/24'],
    ...
  })
}
```
