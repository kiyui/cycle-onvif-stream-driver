const onvif = require('node-onvif')
const arpScanner = require('arpscan/promise')

// Requirement for arp-scan without root
// File: /etc/sudoers.d/arp-scan
// $user ALL = NOPASSWD: /usr/bin/arp-scan

function getONVIFStream (config) {
  const getStreams = addresses => addresses.map(address => {
    const device = new onvif.OnvifDevice({
      xaddr: `http://${address.ip}/onvif/device_service`,
      user: 'admin',
      pass: 'admin'
    })
    return new Promise((resolve, reject) => {
      device.init(err => {
        if (err) {
          resolve(null)
        } else {
          try {
            resolve(Object.assign({}, address, { stream: device.getUdpStreamUrl() }))
          } catch (e) {
            resolve(null)
          }
        }
      })
    })
  })

  // Return promise with all streams
  return arpScanner(config)
    .then(data => getStreams(data)) // Create promise to get stream for specific IP
    .then(streamPromises => Promise.all(streamPromises)) // Wait for all promises to resolve
    .then(streams => streams.filter(stream => stream !== null)) // Filter out non-ONVIF devices
}

function makeONVIFStreamDriver (config) {
  function onvifStreamDriver (outgoing$) {
  }

  return onvifStreamDriver
}

module.exports = makeONVIFStreamDriver
