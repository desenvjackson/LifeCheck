import React, { Component } from 'react';
import { Platform, View, Text } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

export default class SensorsComponent extends Component {

  constructor() {
    super()
    this.manager = new BleManager()
    this.state = {info: "", values: {}}
    this.UUIDservice = "0000fee0-0000-1000-8000-00805f9b34fb"
    this.CharacteristicUUID = "00002a2b-0000-1000-8000-00805f9b34fb"
    this.sensors = {
      0: "Temperature",
      1: "Accelerometer",
      2: "Humidity",  
      3: "Magnetometer",
      4: "Barometer",
      5: "Gyroscope"
    }
  }

  serviceUUID(num) {
    return this.UUIDservice
  }

  notifyUUID(num) {
    return this.CharacteristicUUID
  }

  info(message) {
    this.setState({info: message})
  }

  error(message) {
    this.setState({info: "ERROR: " + message})
  }

  updateValue = async (key, value) => {
    //const readebleData = base64.decode(value);
    await this.setState({values: {...this.state.values, [key]: value}})
  }

  componentDidMount = async () => {
    this.scanAndConnect()
  }

  UNSAFE_componentWillMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scanAndConnect()
      })
    } else {
      this.scanAndConnect()
    }
  }

  scanAndConnect() {
    this.manager.startDeviceScan(null,
                                 null, (error, device) => {
      this.info("Scanning...")

      if (device.name === 'Amazfit Bip Watch') {
        // console.log(device)
      }

      if (error) {
        this.error(error.message)
        return
      }

      if (device.name === 'Amazfit Bip Watch') {
        this.info("Connecting to TI Sensor")
        this.manager.stopDeviceScan()
        device.connect()
          .then((device) => {
            this.info("Discovering services and characteristics")
            return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
            this.info("Setting notifications")
            return this.setupNotifications(device)
          })
          .then(() => {
            this.info("Listening...")
          }, (error) => {
            this.error(error.message)
          })
      }
    });
  }


  async setupNotifications(device) {

            for (const id in this.sensors) {
              const service = this.serviceUUID(id)
              const characteristicN = this.notifyUUID(id)

              device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
                if (error) {
                  this.error(error.message)
                  console.log ( "monitorCharacteristicForService: " + error.message + " service: " + characteristicN)
                  return
                }
                this.updateValue(characteristic.uuid, characteristic.value)
                console.log ( "monitorCharacteristicForService: " + characteristic.uuid, characteristic.value)
              }) 

    }


  }


  render() {
    return (
      <View>
        <Text>{"\n"}</Text>
          <Text>{this.state.info}</Text>
        <Text>{"\n"}</Text>

        {Object.keys(this.sensors).map((key) => {
          return <Text key={key}>
                   {this.sensors[key] + ": " + (this.state.values[this.notifyUUID(key)] || "-")}
                 </Text>
        })}
      </View>
    )
  }


  
}

