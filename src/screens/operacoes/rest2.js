import React, {Component} from 'react';
import { Platform, View, Text } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default class Main extends PureComponent {

  constructor() {
    super();
    this.manager = new BleManager()
    this.state = {info: "", values: {}}
    this.deviceprefix = "Device";
    this.devicesuffix_dx = "DX";
    this.sensors = {
      "0000f0fd-0001-0008-0000-0805f9b34fb0" : "Acc+Gyr+Mg",
      "0000f0f4-0000-1000-8000-00805f9b34fb" : "Pressure"
    }

    }

  serviceUUID() {
      return "0000f0f0-0000-1000-8000-00805f9b34fb"
    }

  notifyUUID(num) {
      return num 
    }

  model_dx (model) {
      return this.deviceprefix + model + this.devicesuffix_dx
    }

  info(message) {
      this.setState({info: message})
    }

  error(message) {
      this.setState({info: "ERROR: " + message})
    }

  updateValue(key, value) {
      this.setState({values: {...this.state.values, [key]: value}})
    }

  componentWillMount(){
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  }
  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({permissionStatus:'granted'});
      }else if(granted === PermissionsAndroid.RESULTS.DENIED) {
        this.setState({permissionStatus:'denied'});
      }else{

      }
    } catch (err) {
      console.error(err)
    }
  }

    scanAndConnect(){
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {

          return
        }

        let model = '0030';
        if (device.name == this.model_dx(model)  ) {
          this.manager.stopDeviceScan();
          device.connect()
            .then((device) => {
              this.info("Discovering services and characteristics ")
              return device.discoverAllServicesAndCharacteristics()
            })
           .then((device) => {
             this.info("SetupNotification")
             return this.setupNotifications(device)
           })
            .catch((error) => {
              this.error(error.message)
            });
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
              return
            }
            this.updateValue(characteristic.uuid, characteristic.value)
          })
        }
      }

    render() {
       return (
         <View>
           <Text>{this.state.info}</Text>
           {Object.keys(this.sensors).map((key) => {
          return <Text key={key}>
                   {this.sensors[key] + ": " + (this.state.values[this.notifyUUID(key)] || "-")}
                 </Text>
        })}
         </View>
       )
     }

}