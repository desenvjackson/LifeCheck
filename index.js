/**
 * @format
 */

import { AppRegistry, ShadowPropTypesIOS } from 'react-native';
import App from './App';
import { Provider as PaperProvider } from 'react-native-paper';
import { name as appName } from './app.json';

import BackgroundFetch from "react-native-background-fetch";
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-community/async-storage';
import { Buffer } from 'buffer';
import Moment from 'react-moment';
import 'moment-timezone';
import moment from "moment";

AppRegistry.registerComponent(appName, () => App);

const manager = new BleManager();

this.state = { startMin: "", endMin: "", devicedados: "" }
this.state = { frequenciaCardiaca:"", oxigenio:"", hiperTensao:"", hipoTensao:"", temperatura:"" }


const MyHeadlessTask = async (event) => {
    // Get task id from event {}:
    let taskId = event.taskId;
    console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

    try {

        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                console.log("Error - startDeviceScan : " + error);
                return
            }

            compareID(device)

        });

    } catch (err) {
        // some error handling
        console.log("scanAndConnect" + err);
        BackgroundFetch.finish(taskId);
    }

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(taskId);
}

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(MyHeadlessTask);

const compareID = async (device) => {

    let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID');
    //console.log("asyncdeviceID - Primeiro passo : " + asyncdeviceID)

    try {
        if (device.id === asyncdeviceID) {

            console.log("isConnected - else if : " + "NOT Connected")

            device = await manager.connectToDevice(device.id)

            console.log("isConnected - else if : " + "Conectei....")

            // #### iniciar medição básica
            manager.stopDeviceScan()
            this.state.devicedados = device
            await setupNotifications(device)
            await novaMedicao(device)

        } else {
            console.log("isConnected: " + "NOT Connected")
            console.log("device.name: " + device.name)
            console.log("asyncdeviceID : " + asyncdeviceID)
        }
    } catch (err) {
        // some error handling
        console.log("compareID" + err);
        // BackgroundFetch.finish(taskId);
    }
}


const novaMedicao = async (device) => {

    try {

        if (device) {
            console.log('novaMedicao 1')
            const services = await device.services();
            await measureTempNow(device)

            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )

            console.log('novaMedicao 2')

            let comandoAll = "qwAE/zKAAQ==" // -- 
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoAll
            )
                .then(characteristic => {
                    //this.setState({ info4: characteristic.value })
                    console.log('novaMedicao 3')

                })
                .catch(err => {
                    console.log(" valores > " + err)
                    console.log('novaMedicao 4')

                });
            console.log('novaMedicao 5')

            // Tratando o tempo de execucao da leitura da medição    
            let startMin = moment(new Date()).format("HH:mm")
            this.state.startMin = startMin

            console.log('novaMedicao 7')

            //return () => this.clearTimeout(timeout);

        } else {
            console.log("Instant Check:", "Sem dispositivo conectado");
        }

    } catch (err) {
        // some error handling
        console.log("novaMedicao" + err);
        // BackgroundFetch.finish(taskId);
    }

}

const measureAllStop = async (device) => {

    console.log("measureAllStop = INICIO")

    const services = await device.services();

    if (!device) {
        console.log("Dispositivo desconectado")
        return
    } else {
        try {
            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )

            let comandoAll = "qwAE/zKAAA=="
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoAll
            )
                .then(characteristic => {
                    // this.setState({ info4: characteristic.value })     
                })
                .catch(err => {
                    console.log(" valores > " + err)
                    //this.setState({ info4: "Escrevendo..." + err })
                });
        } catch (err) {
            console.log("measureAllStop : " + err)
        }
    }

    console.log("measureAllStop = FIM")
}

const setupNotifications = async (device) => {

    console.log('setupNotifications = INICIO')

    // assuming the 'device' is already connected
    try {
        await device.discoverAllServicesAndCharacteristics();
        const services = device.services();

        // Ativando notificação de ECG+PPG HR        
        let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
        let TX_CHARACT = "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // TX Characteristic (Property = Notify) 

        try {
            let retorno = manager.monitorCharacteristicForDevice(device.id,
                UART_SERVICE, TX_CHARACT, onUARTSubscriptionUpdate_ALL
            );

        } catch (err) {
            console.log('setupNotification catch 1' + JSON.stringify(err))
        }

    } catch (err) {
        console.log('setupNotification catch 2 ' + JSON.stringify(err))
    }

    console.log('setupNotifications = FIM')
}

const onUARTSubscriptionUpdate_ALL = async (error, characteristics) => {

    console.log("onUARTSubscriptionUpdate_ALL = INICIO ")

    try {

        let startEnd = moment(new Date()).format("HH:mm")
        var ms = moment(this.state.startMin, "HH:mm").diff(moment(startEnd, "HH:mm"));
        var d = moment.duration(ms);
        var s = moment.utc(ms).format("mm");

        if (s > 1) {            
           await measureTempStop(this.state.devicedados)
           await measureAllStop(this.state.devicedados)               
        }

        if (error) {
            console.log(JSON.stringify(error))
        } else if (characteristics) {

            let hex = Buffer.from(characteristics.value, 'base64');
            let hex2 = hex[2]
            let hex6 = hex[6]
            let hex7 = hex[7]
            let hex8 = hex[8]
            let hex9 = hex[9]

            if (hex2 === 10) {
                this.state.frequenciaCardiaca = hex6
                this.state.oxigenio = hex7
                this.state.hiperTensao = hex8
                this.state.hipoTensao = hex9

                console.log(
                    "frequenciaCardiaca:" + hex6, "oxigenio:" + hex7, "hiperTensao:" + hex8, "hipoTensao:" + hex9,
                )

                console.log(
                    this.state.frequenciaCardiaca,this.state.oxigenio, this.state.hiperTensao, this.state.hipoTensao
                )

                manager.stopDeviceScan()
                BackgroundFetch.finish(taskId)
                return false
                
            } else if (hex2 === 5) {
                this.state.temperatura = hex[6] + '.' + hex[7]
                console.log(hex[6] + '.' + hex[7])
            }

            console.log(hex)
        }
    } catch (err) {
        console.log("onUARTSubscriptionUpdate_ALL" + JSON.stringify(err))
    }

    console.log("onUARTSubscriptionUpdate_ALL = FIM ")
}

const measureTempNow = async (device) => {
    const services = await device.services();

    if (!device) {
        return
    } else {
        try {

            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )

            let comandoTemp = "qwAE/4aAAQ==" // -- 
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoTemp
            )
                .then(characteristic => {
                })
                .catch(err => {
                    console.log(" valores > " + err)
                });

            //this.setTimeout(() => {
            //      measureTempStop(device)          
            //}, 5000);

            //return () => this.clearTimeout(timeout);

        } catch (err) {
            console.log(err)
        }

    }
}

const measureTempStop = async (device) => {
    const services = await device.services();
    if (!device) {
        // this.setState({ info4: "Dispositivo desconectado" })
        return
    } else {
        try {

            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )

            let comandoTemp = "qwAE/4aAAA=="
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoTemp
            )
                .then(characteristic => {
                    // this.setState({ info4: characteristic.value })     
                })
                .catch(err => {
                    console.log(" valores > " + err)
                });
        } catch (err) {
            console.log(err)
        }
    }
}