/**
 * @format
 */

import { AppState, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import BackgroundFetch from "react-native-background-fetch";
import { BleManager, ScanMode } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-community/async-storage';
import { Buffer } from 'buffer';
import 'moment-timezone';
import moment from "moment";
import api from './src/services/index.tsx';

AppRegistry.registerComponent(appName, () => App);

const manager = new BleManager();

this.state = { startMin: "", endMin: "", devicedados: "", tempMedFim: 0, allMedFim: 0, chega: 0 }
this.state = { frequenciaCardiaca: "", oxigenio: "", hiperTensao: "", hipoTensao: "", temperatura: "" }


/* 
let ScanOptions = { scanMode: ScanMode.LowLatency }
manager.startDeviceScan(null, ScanOptions, (error, device) => {
    if (error) {
        // Handle error (scanning will be stopped automatically)r
        console.log("Error - startDeviceScan : " + error);
        return
    }
    if (device.name != null) {
        const logTeste = { device_id: device.id, description: "MyHeadlessTask - startDeviceScan" }
        var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste));
        // compareID(device)
         MyHeadlessTaskNS("event")
        // setIntervalManual()
    }
});
*/


AppState.addEventListener('change', state => {
    if (state === 'active') {
        console.log("active");
    } else if (state === 'background') {
        console.log("background")
               //MyHeadlessTaskNS("event")
               desconectar()
    } else if (state === 'inactive') {
        console.log("inactive");
    }
});



// Configure it.
BackgroundFetch.configure({
    enableHeadless: true,
    minimumFetchInterval: 20,     // <-- minutes (15 is minimum allowed)
    // Android options
    forceAlarmManager: false,     // <-- Set true to bypass JobScheduler.
    stopOnTerminate: false,
    startOnBoot: true,
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
    requiresCharging: false,      // Default
    requiresDeviceIdle: false,    // Default
    requiresBatteryNotLow: false, // Default
    requiresStorageNotLow: false  // Default
}, async (taskId) => {
    console.log("[js] Received background-fetch event: ", taskId);
    const BackgroundFetchFinish = { device_id: "[js] Received background-fetch event: ", description: taskId }
    var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(BackgroundFetchFinish));
    BackgroundFetch.finish(taskId);
}, (error) => {
    console.log("[js] RNBackgroundFetch failed to start");
    const BackgroundFetchFinish = { device_id: "[js] RNBackgroundFetch failed to start", description: error }
    var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(BackgroundFetchFinish))
});


// Optional: Query the authorization status.
BackgroundFetch.status((status) => {
    switch (status) {
        case BackgroundFetch.STATUS_RESTRICTED:
            console.log("BackgroundFetch restricted");

            const STATUS_RESTRICTED = { device_id: "BackgroundFetch.status", description: "STATUS_RESTRICTED" }
            var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(STATUS_RESTRICTED));

            break;
        case BackgroundFetch.STATUS_DENIED:
            console.log("BackgroundFetch denied");

            const STATUS_DENIED = { device_id: "BackgroundFetch.status", description: "STATUS_DENIED" }
            var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(STATUS_DENIED));

            break;
        case BackgroundFetch.STATUS_AVAILABLE:
            console.log("BackgroundFetch is enabled");

            const STATUS_AVAILABLE = { device_id: "BackgroundFetch.status", description: "STATUS_AVAILABLE" }
            var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(STATUS_AVAILABLE));

            break;
    }
});



const MyHeadlessTaskNS = async (event) => {
    // Get task id from event {}:

    try {

        let taskId = event.taskId;
        console.log('[BackgroundFetch HeadlessTask] start: ', taskId);

        let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')        
        const logTeste2 = { device_id: asyncdeviceID, description: "Passo 01 - MyHeadlessTaskNS" }
        var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste2));

        //Ligando o bluetooth
        manager.enable()

        // Desconectando
        desconectar()

        let ScanOptions = { scanMode: ScanMode.LowLatency }
        manager.startDeviceScan(null, ScanOptions, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                console.log("Error - startDeviceScan : " + error);

                const logTeste3 = { device_id: device.id, description: error }
                var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste3));
            }

            if (device.id === asyncdeviceID) {

                console.log("startDeviceScan - 01")

                const logTeste = { device_id: device.id, description: "Passo 02 - MyHeadlessTaskNS - startDeviceScan" }
                var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste))

                //realiza conexão com o device cadastrado
                compareID(device)
            }

            console.log("startDeviceScan - 02")

        });

    } catch (err) {
        // some error handling
        console.log("MyHeadlessTaskNS " + err);
        const logTeste4 = { device_id: "MyHeadlessTaskNS : ", description: err }
        var { data: returnData } = api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste4));
    }

    // Required:  Signal to native code that your task is complete.
    // If you don't do this, your app could be terminated and/or assigned
    // battery-blame for consuming too much time in background.
    BackgroundFetch.finish(taskId);
}

// Register your BackgroundFetch HeadlessTask
BackgroundFetch.registerHeadlessTask(MyHeadlessTaskNS);
//BackgroundFetch.stop(MyHeadlessTask);


const desconectar = async () => {

    console.log("INICIO desconectar")

    let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')
    const logTesteCID = { device_id: asyncdeviceID, description: "Passo 13 - Inicio DESCONECTAR" }
    var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))

    try {
        if (asyncdeviceID) {
            await manager.cancelDeviceConnection(asyncdeviceID)
            const logTestedesconectar = { device_id: asyncdeviceID, description: "Passo 14 - DESCONECTADO COM SUCESSO" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTestedesconectar))
        }
    } catch (err) {
        console.log("ERROR desconectar : " + err)
        const logTesteCID = { device_id: asyncdeviceID, description: "Erro DESCONECTAR" }
        var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))
    }
}

const logs = async (chave, descricao, local) => {
    const logs = { device_id: chave, description: descricao }
    var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logs))
}

const compareID = async (device) => {

    let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')
    // console.log("asyncdeviceID - Primeiro passo : " + asyncdeviceID)
    await logs(device.id, "Passo 03 - compareID", "compareID")

    try {
        if (device.id === asyncdeviceID) {

            manager.stopDeviceScan()

            // Primeira tentativa de conexão 
            device = await manager.connectToDevice(device.id)
            console.log("isConnected: " + "C O N E C T A D O !")

            // Verifica se o dipositivo tá conectado - Revalida
            let isConnected = await device.isConnected()
            if (!isConnected) {
                device = await manager.connectToDevice(device.id)
            }

            await logs(device.id, "Passo 04 - ", "compareID")

            // #### iniciar medição básica
            this.state.tempMedFim = 0
            this.state.allMedFim = 0
            this.state.devicedados = device

            // Validando se tá na hora de realizar uma medição
            await checkmonitoringschedule(device)

        } else {
            console.log("device.name: " + device.name + " NOT Connected ")
        }
    } catch (err) {
        // some error handling
        console.log("compareID" + err);
        // BackgroundFetch.finish(taskId);
        const logTesteCID = { device_id: "compareID - Passo ERRO : ", description: err }
        var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))
    }
}


const checkmonitoringschedule = async (device) => {

    const logTeste = { device_id: device.id, description: "Passo 05 - checkmonitoringschedule" }
    var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTeste));

    //Recuperando o ultimo usuário logado
    let id_patient = await AsyncStorage.getItem("id_patient")

    // Verificando se é hora de realizar uma leitura de monitoramento # envia o id do paciente - Verifica se tá na hora do monitoramento
    const MonitoringPatient = { id_patient: id_patient }
    var { data: returnData } = await api.post("monitoring/checkmonitoringschedule", "data=" + JSON.stringify(MonitoringPatient));

    //Passando o status da consulta, em caso de SUCESSO ou ERRO
    if (returnData["status"] === 'sucesso' && returnData["dados"] === 1) {


        try {
            //Abrir comunicação com o relógio
            await setupNotifications(device)
            const logsetupNotifications = { device_id: device.id, description: "Passo 06 - setupNotifications" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logsetupNotifications))

            //Enviando PUSH NOTIFICATION - Sobre o inicio da medição
            await sendNotificationMeasure(device, 1)
            const logsendNotificationMeasure = { device_id: device.id, description: "Passo 07 - sendNotificationMeasure" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logsendNotificationMeasure))

            //Vibra o relógio e envia notificação de leitura para o usuário
            await vibratephone(device)
            const logvibratephone = { device_id: device.id, description: "Passo 08 - vibratephone" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logvibratephone))

            //Realiza a medição pressão, oxigênio e bpm
            await novaMedicao(device)
            const lognovaMedicao = { device_id: device.id, description: "Passo 09 - novaMedicao" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(lognovaMedicao))

            // Tratando o tempo de execucao da leitura da medição    
            let startMin = moment(new Date()).format("HH:mm:ss")
            this.state.startMin = startMin
            const logstartMin = { device_id: device.id, description: "Passo 09.1 " + this.state.startMin }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logstartMin))

            //Realiza a medição temperatura
            await measureTempNow(device)
            const logmeasureTempNow = { device_id: device.id, description: "Passo 10 - measureTempNow" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logmeasureTempNow))

            //Realiza a medição temperatura
            await setIntervalManual()
            const logsetIntervalManual = { device_id: device.id, description: "Passo 11 - setIntervalManual" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logsetIntervalManual))

        } catch (err) {
            console.log("compareID" + err);
            const logTesteCID = { device_id: "checkmonitoringschedule - ERRO : ", description: err }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))
        }

    } else {
        //desconecta device T1S
        console.log("Não é hora de fazer a medição, bye!")
        const logcheckmonitoringscheduleELSE = { device_id: device.id, description: "Não é hora de fazer a medição, bye!" }
        var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logcheckmonitoringscheduleELSE))
        await device.cancelConnection()
    }
}

const timeVerification = async () => {
    // Tratando o tempo de execucao da leitura da medição    
    let startEnd = moment(new Date()).format("HH:mm:ss")
    var ms = moment(startEnd, "HH:mm:ss").diff(moment(this.state.startMin, "HH:mm:ss"));
    var d = moment.duration(ms);
    var s = moment.utc(ms).format("ss");

    const logTimeVerification = { device_id: this.state.devicedados.id, description: "timeVerification = INICIADO " +  s }
    var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTimeVerification))

    if (s > 45) {
        this.state.chega = 1
        await measureAllStop(this.state.devicedados)
        await measureTempStop(this.state.devicedados)
        // Enviando dados para Cloud
        await sendDataCloud()
    }

}


const setIntervalManual = async () => {

    console.log('setIntervalManual = OK')
    const logTesteCID = { device_id: this.state.devicedados.id, description: "setIntervalManual: INICIADO " }
    var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))

    try {

        //Variavel de controle do while
        this.state.chega = 0

        while (true) {
            let status = await timeVerification();
            if (this.state.chega) {
                break;
            } else {
                // Delay before running the next loop iteration:
                // console.log(" ELSE do RELOGIO ")
            }
        }

    } catch (err) {
        console.log("setIntervalManual" + err)
        const logTesteCID = { device_id: this.state.devicedados.id, description: "setIntervalManual = ERRO" }
        var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))
    }
}

const sendNotificationMeasure = async (device, codigomensagem) => {

    try {
        let nomePaciente = await AsyncStorage.getItem("nome");
        const logsendsOneSignal = { device_id: device.id, codigoMensagem: codigomensagem, nomePaciente: nomePaciente }
        var { data: returnData } = await api.post("monitoring/sendsOneSignal", "data=" + JSON.stringify(logsendsOneSignal));
    } catch (err) {
        // some error handling
        console.log("sendNotificationMeasure" + err);
    }
}

const vibratephone = async (device) => {
    try {
        if (device) {
            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )

            let comandoAll = "qwAD/3GA" // -- 
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoAll
            )
                .then(characteristic => {
                    //this.setState({ info4: characteristic.value })
                })
                .catch(err => {
                    console.log(" valores > vibratephone :  " + err)
                });
        } else {
            console.log("Instant Check:", "Sem dispositivo conectado");
        }
    } catch (err) {
        // some error handling
        console.log("vibratephone" + err);
    }
}


const novaMedicao = async (device) => {
    try {
        if (device) {
            //const services = await device.services();
            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let RX_CHARACT = "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // RX Characteristic (Property = Write without response e READ )
            let comandoAll = "qwAE/zKAAQ==" // -- 
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                comandoAll
            )
                .then(characteristic => {
                    //this.setState({ info4: characteristic.value })
                })
                .catch(err => {
                    console.log(" valores > novaMedicao:  " + err)
                });
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
                    console.log(" valores > measureAllStop: " + err)
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
                    this.state.frequenciaCardiaca, this.state.oxigenio, this.state.hiperTensao, this.state.hipoTensao
                )


            } else if (hex2 === 5 && hex[6] > 0 && hex[4] === 134) {
                this.state.temperatura = hex[6] + '.' + hex[7]
                console.log(this.state.temperatura)
            }

            //console.log(hex)
        }
    } catch (err) {
        console.log("onUARTSubscriptionUpdate_ALL" + JSON.stringify(err))
    }

}

const measureTempNow = async (device) => {
    //const services = await device.services(); 
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
                    console.log(" valores > : measureTempNow" + err)
                });
        } catch (err) {
            console.log(err)
        }
    }
}

const measureTempStop = async (device) => {
    //const services = await device.services();
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
                    console.log(" valores > measureTempStop: " + err)
                });

        } catch (err) {
            console.log(err)
        }
    }
}


const sendDataCloud = async () => {

    try {

        let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')
        let id_patient = await AsyncStorage.getItem('id_patient')

        const MonitoringHistoryModel = {
            frequenciaCardiaca: await this.state.frequenciaCardiaca,
            oxigenio: await this.state.oxigenio,
            hiperTensao: await this.state.hiperTensao,
            hipoTensao: await this.state.hipoTensao,
            temperatura: await this.state.temperatura,
            id_patient: id_patient,
            id_firm: 1,
            id_monitoringstatus: 1,
            id_user: 1,
        }

        // envia dados para a tabela de monitoramento
        var { data: token } = await api.post("monitoring/sendDataCloud", "data=" + JSON.stringify(MonitoringHistoryModel));

        //Passando o status da consulta, em caso de SUCESSO ou ERRO
        if (token["status"] === 'sucesso') {
            console.log('sendDataCloud', ' Sucesso !')
        } else {
            console.log('sendDataCloud', 'Dados incorretos !')
        }

        console.log(
            "sendDataCloud",
            this.state.frequenciaCardiaca,
            this.state.oxigenio,
            this.state.hiperTensao,
            this.state.hipoTensao,
            this.state.temperatura
        )

        // Limpando states
        this.state.tempMedFim = 0
        this.state.allMedFim = 0

        const logsendData = { device_id: asyncdeviceID, description: "Passo 12 - " + " / " + this.state.frequenciaCardiaca + " / " + this.state.oxigenio + " / " + this.state.hiperTensao + " / " + this.state.hipoTensao + " / " + this.state.temperatura }
        var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logsendData))

        // Saindo no Exit ....
        // desconectar()

        //Enviando PUSH NOTIFICATION - Sobre o inicio da medição
        sendNotificationMeasure(this.state.devicedados, 2)

    } catch (err) {
        console.log(err)
    }
}
