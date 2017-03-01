const makeONVIFStreamDriver = require('../src/makeONVIFStreamDriver')
const Cycle = require('@cycle/xstream-run')

/*
var DEFAULTS = {
 command: 'arp-scan',
 args:['-l'],
 interface: 'wlan0',
 parser: parse,
 sudo: false
}
*/

const main = sources => {
  const getOnvif$ = sources.ONVIF.select('WiFi')
    .map(data => {
      console.dir(data)
    })
    .startWith(null)

  const onvif$ = getOnvif$
    .mapTo({ category: 'WiFi', interface: 'wlp5s0' })

  return {
    ONVIF: onvif$
  }
}

// Requirement for arp-scan without root
// File: /etc/sudoers.d/arp-scan
// $user ALL = NOPASSWD: /usr/bin/arp-scan

// Please view the sudo_arp_scan.sh file to see how I configured
// arp-scan to not require root permissions. A better alternative
// will be to run the node script as root or to run the application
// inside a Docker container with the correct privileges

const drivers = {
  ONVIF: makeONVIFStreamDriver({
    command: `${__dirname}/sudo_arp_scan.sh`,
    args: ['10.17.96.0/24', '192.168.191.0/24'],
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

Cycle.run(main, drivers)
