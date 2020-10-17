import React, { Component } from 'react';
import {
    Platform,
    PermissionsAndroid
} from 'react-native';

import {
    BleManager
} from 'react-native-ble-plx';


import { Buffer } from 'buffer';
const manager = new BleManager();
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";



async function getBluetoothScanPermission() {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
            title: 'Bluetooth Permission',
            message:
                'In the next dialogue, Android will ask for permission for this ' +
                'App to access your location. This is needed for being able to ' +
                'use Bluetooth to scan your environment for peripherals.',
            buttonPositive: 'OK'
        },
    )
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('BleManager.scan will *NOT* detect any peripherals! = NOT')
    } else {
        console.log('BleManager.scan will detect any peripherals! = OK')
    }
}


async function requestLocationPermission() {
    try {
        let granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Permissão para usar a localização',
                message: 'O aplicativo precisa de permissão para utilizar a sua localização',
                buttonNegative: 'Cancelar',
                buttonPositive: 'OK',
            });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("PermissionsAndroid.RESULTS.GRANTED = OK");
        } else {
            console.log("PermissionsAndroid.RESULTS.GRANTED = NOT PERMISSION");
        }
    } catch (error) {
        console.log(error);
    }

    if (Platform.OS === 'android')
        LocationServicesDialogBox.checkLocationServicesIsEnabled({
            message: "<h2>Use Location?</h2> \
                              This app wants to change your device settings:<br/><br/>\
                              Use GPS for location<br/><br/>",
            ok: "YES",
            cancel: "NO"
        }).then(() => {
            // locationTracking(dispatch, getState, geolocationSettings)
        })

}


export class conectaBLE extends Component {


    constructor(props) {
        super(props);
        this.state = {
            marker: [],
            dados: [],
            dadosservices: [],
            peripherals: new Map(),
            dadosservicesMAP: new Map(),
            loading: true,
            scanning: false,
            erro: false,
            conectando: '',
            corIconBluetooth: 'navy',
            modal: false,
            deviceDados: '',
        };
    }

    


    componentDidMount = async () => {
        console.log("check getBluetoothScanPermission access permission...")
        await getBluetoothScanPermission()

        console.log("check requestLocationPermission access permission...")
        await requestLocationPermission()
    }

    UNSAFE_componentWillMount() {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                //this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }



    scanAndConnect = async () => {

        await this.setState({
            loading: true, scanning: true, dadosservicesMAP: new Map(), erro: false, dadosservices: [],
            dados: [], peripherals: new Map(),
            conectando: "Conectando ao seu INSTANT CHECK... ", corIconBluetooth: 'navy',
            modal: true
        });

        try {
            var peripherals = this.state.peripherals;
            manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    console.log("Error - startDeviceScan : " + error);
                    return
                }

                if (!device.name) {
                    device.name = 'SEM NOME';
                }

                peripherals.set(device.id, device);
                this.setState({ peripherals });

                //  let list = Array.from(this.state.peripherals.values());

                this.setState({ dadosservices: Array.from(this.state.peripherals.values()) })
                let lista = this.state.dadosservices.filter((index) => index.name != 'SEM NOME');
                this.setState({ dados: lista });

                // setTimeout(() => {
                //  manager.stopDeviceScan();
                //this.setState({ loading: false, scanning: false });
                // }, 5000);

            });
        } catch (err) {
            // some error handling
            console.log("scanAndConnect" + err);
        }




    }


    deviceconnect = async (device) => {

        this.setState({ loading: true, dados: [], modal: false });
        console.log("Connecting to device :")

        // Verifica se o dipositivo tá conectado
        let isConnected = await device.isConnected()
        manager.stopDeviceScan();


        try {
            if (!isConnected) {
                device = await manager.connectToDevice(device.id)
                this.setState({ deviceDados: device })
                // await AsyncStorage.setItem("device", JSON.stringify(device))

                setTimeout(() => {
                    this.setState({ conectando: "Conectado! Bem vindo.", corIconBluetooth: 'green' });
                }, 1000);

            }
        } catch (err) {
            // some error handling
            console.log("deviceconnect" + err);
        }


        device = await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();


        device.onDisconnected((error, disconnectedDevice) => {
            console.log('Disconnected ', disconnectedDevice.name)
            console.log('Disconnected ', error)
        });


        await this.setupNotifications(device);

    }

    async setupNotifications(device: any) { 

        // assuming the 'device' is already connected
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();

        // Ativa Monitoramento Cardiaco
        let UART_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb" // UART Service
        let TX_CHARACT = "00002a37-0000-1000-8000-00805f9b34fb" // TX Characteristic (Property = Notify) - "Heart Rate Measurement"

        try {
            let char = await manager.monitorCharacteristicForDevice(device.id,
                UART_SERVICE,
                TX_CHARACT,
                this.onUARTSubscriptionUpdate
            );
        } catch (err) {
            console.log(JSON.stringify(err))
        }

/*
        // Ativando notificação de ECG+PPG HR
        let UART_SERVICE_ALL = "0000fff0-0000-1000-8000-00805f9b34fb"  // UART Service
        let TX_CHARACT_ALL = "0000fff7-0000-1000-8000-00805f9b34fb" // TX Characteristic (Property = Notify) - "Heart Rate Measurement"

        try {
            let char = await manager.monitorCharacteristicForDevice(device.id,
                UART_SERVICE_ALL,
                TX_CHARACT_ALL,
                this.onUARTSubscriptionUpdate_ALL
            );
        } catch (err) {
            console.log(JSON.stringify(err))
        }
*/

    }



    onUARTSubscriptionUpdate = async (error: any, characteristics: any) => {
        try {
            if (error) {
                console.log(JSON.stringify(error))
            } else if (characteristics) {

                let Geralbuff = Buffer.from(characteristics.value, 'base64');

                let buff = Buffer.from(characteristics.value, 'base64');
                //buff = buff[1];
                // {"data": [4, 101], "type": "Buffer"}

                //  console.log(' Batimento cardíaco - Received: ', buff)
                //  this.info(" Valor do batimento cardíaco  : " + buff);

                console.log(' General Received: ', Geralbuff)



            }
        } catch (err) {
            console.log(JSON.stringify(err))
        }
    };


    onUARTSubscriptionUpdate_ALL = async (error: any, characteristics: any) => {
        try {
            if (error) {
                console.log(JSON.stringify(error))
            } else if (characteristics) {


                let Geralbuff = Buffer.from(characteristics.value, 'base64');
                let buff = Buffer.from(characteristics.value, 'base64');
                //var buff2 = buff[1];
                // {"data": [4, 101], "type": "Buffer"}

                //  console.log(' Batimento cardíaco - Received: ', buff)
                //  this.info(" Valor do batimento cardíaco  : " + buff);

                console.log(' General Received: ', Geralbuff)



            }
        } catch (err) {
            console.log(JSON.stringify(err))
        }
    };


    desconectar = async (device: any) => {
        await manager.cancelDeviceConnection(device.id);
        console.log("Desconectando ... ");
        this.setState({ conectando: "Desconectado.", corIconBluetooth: 'gray' });
    }



    render() {

        return (
            <p>Click on an emoji to view the emoji short name.</p>
        )


    }





}

export default conectaBLE;

