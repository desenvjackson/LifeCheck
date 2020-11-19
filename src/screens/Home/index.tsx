import React, { PureComponent } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    PermissionsAndroid,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Image,
    SectionList, AppState
} from 'react-native';
import { Card, Title, Paragraph, TextInput, Switch, Checkbox, RadioButton, ToggleButton } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const window = Dimensions.get('window');
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import AsyncStorage from '@react-native-community/async-storage';
import {
    BleManager,
    ScanMode,
    Device,
    LogLevel,
    Characteristic,
} from 'react-native-ble-plx';
import Modal from 'react-native-modal';
import { Buffer } from 'buffer';
import api from '../../services/index'
import OneSignal from 'react-native-onesignal';
import AndroidWhitelist from 'react-native-android-whitelist';
import BackgroundJob from 'react-native-background-actions';


interface Props {
    navigation: NavigationScreenProp<any, any>;
}



let manager = new BleManager();
//manager.destroy();
//manager = new BleManager();

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const subscription = manager.onStateChange((state) => {
    console.log("state : #" + state)
    if (state === 'PoweredOn') {
        //this.scanAndConnect();
        subscription.remove();
    }
}, true);



export default class HomeScreen extends PureComponent {

    private inputs = []

    static navigationOptions = ({ navigation }) => {
        return {
        }
    }
    state = {
        marker: [],
        dados: [],
        dadosservices: [],
        peripherals: new Map(),
        dadosservicesMAP: new Map(),
        loading: false,
        scanning: false,
        erro: false,
        conectando: '',
        corIconBluetooth: 'red',
        modal: false,
        deviceDados: '',
        info: '',
        connected: false,
        modalPerfil: false,
        modalSaude: false,
        email: '', nome: '', idade: '', peso: '', altura: '',
        outros: '',
        switchValueCardiaco: false, switchValuePressao: false, switchValueDiabete: false,
        switchValue1: true,
        interval: false, modalMedicao: false, loadingMedicao: false,
        frequenciaCardiaca: '', oxigenio: '', hiperTensao: '', hipoTensao: '', temperatura: '', medeTemperatura: false,
        nomeUsuario: '',
        deviceID: '',
        stateLogin: true,
        login: ''
    };
    ativarLoginAuto = async () => {
        await this.setState({
            stateLogin: false,
            login: 'true'
        })
        await AsyncStorage.setItem("loginAuto", this.state.login);

    }

    desativarLoginAuto = async () => {
        await this.setState({
            stateLogin: true,
            login: 'false'
        })

        await AsyncStorage.setItem("loginAuto", this.state.login);

    }


    connectBackgroundMeasurement = async () => {

        console.log(" connectBackgroundMeasurement ")
        let id_patient = await AsyncStorage.getItem('id_patient')
        let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')

        manager.stopDeviceScan()

        //Ligando o bluetooth
        manager.enable()

        await manager.destroy()
        manager = new BleManager()

        let subscription = await manager.onStateChange((state) => {
            console.log("state : #" + state)
            if (state === 'PoweredOn') {
                subscription.remove();
            }
        }, true);

        //await manager.cancelDeviceConnection(asyncdeviceID);
        // Verificando se é hora de realizar uma leitura de monitoramento # envia o id do paciente - Verifica se tá na hora do monitoramento
        const MonitoringPatient = { id_patient: id_patient }
        var { data: returnData } = await api.post("monitoring/checkmonitoringschedule", "data=" + JSON.stringify(MonitoringPatient));

        //Passando o status da consulta, em caso de SUCESSO ou ERRO
        if (returnData["status"] === 'sucesso' && returnData["dados"] === 1) {
            try {
                if (asyncdeviceID) {
                    let ScanOptions = { scanMode: ScanMode.LowLatency }
                    manager.startDeviceScan(null, ScanOptions, (error, device) => {
                        if (error) {
                            // Handle error (scanning will be stopped automatically)
                            console.log("Error - startDeviceScan : " + error);
                            return
                        }
                        if (device.id === asyncdeviceID) {
                            // Parando scaneamento dos devices
                            manager.stopDeviceScan()
                            this.deviceconnect(device, true)
                        }
                        console.log("loopando")
                    });
                } else {
                    console.log("CONECTADO !!!! O MENINO ")
                }
            } catch (err) {
                console.log("compareID" + err);
                const logTesteCID = { device_id: asyncdeviceID, description: err }
                var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logTesteCID))
            }
        } else {
            //desconecta device T1S
            console.log("Não é hora de fazer a medição, bye!")
            const logcheckmonitoringscheduleELSE = { device_id: asyncdeviceID, description: "Não é hora de fazer a medição, bye!" }
            var { data: returnData } = await api.post("monitoring/logTeste", "data=" + JSON.stringify(logcheckmonitoringscheduleELSE))
        }
    }


    processBackgroundMeasurement = async () => {

        let options = {
            taskName: 'Example',
            taskTitle: 'Medição em segundo plano',
            taskDesc: '',
            taskIcon: {
                name: 'ic_launcher',
                type: 'mipmap',
            },
            color: '#000080',
            linkingURI: 'exampleScheme://chat/jane',
            parameters: {
                delay: 1200000,
                // delay:  60000,
            },
        }

        let playing = BackgroundJob.isRunning();

        playing = !playing;
        if (playing) {
            try {
                console.log('Trying to start background service');
                await BackgroundJob.start(this.taskRandom, options);
                console.log('Successful start!');
            } catch (e) {
                console.log('Error', e);
            }
        } else {
            console.log('Stop background service');
            await BackgroundJob.stop();
        }

    }

    taskRandom = async taskData => {
        if (Platform.OS === 'ios') {
            console.warn(
                'This task will not keep your app alive in the background by itself, use other library like react-native-track-player that use audio,',
                'geolocalization, etc. to keep your app alive in the background while you excute the JS from this library.',
            );
        }
        await new Promise(async resolve => {
            // For loop with a delay
            const { delay } = taskData;
            for (let i = 0; BackgroundJob.isRunning(); i++) {
                console.log('Runned -> ', i);
                //await BackgroundJob.updateNotification({ taskDesc: 'Instant Check Ativo no momento.' + i });
                await BackgroundJob.updateNotification({ taskDesc: 'Instant Check está ativo no momento' });
                await sleep(delay);
                await this.connectBackgroundMeasurement();
            }
        });
    };

    stopBackGround = async () => {
        console.log("stopBackGround")
        await BackgroundJob.stop();
    }

    getWhiteListPermission = async () => {
        const config = {
            title: 'INSTANT CHECK',
            text: 'Para garantir a entrega oportuna de notificações push e a medição em segundo plano, coloque nosso aplicativo na lista de permissões.',
            //doNotShowAgainText: 'Não mostrar de novo',
            positiveText: 'Incluir',
            //negativeText: 'Não'
        }
        AndroidWhitelist.alert(config)
    }

    getBluetoothScanPermission = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
                title: 'Permissão Bluetooth',
                message:
                    'No próximo diálogo, o Android pedirá permissão para este' +
                    ' APP para acessar sua localização.' +
                    '\n\n' +
                    'Isso é necessário para o bluetooth ser capaz de ' +
                    'verificar se há periféricos em seu ambiente.',
                buttonPositive: 'OK'
            },
        )
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('BleManager.scan will *NOT* detect any peripherals! = NOT')
        } else {
            console.log('BleManager.scan will detect any peripherals! = OK')
        }
    }

    requestLocationPermission = async () => {
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
                message: "<h2>Permissão Bluetooth</h2> \
                                Isso é necessário para o bluetooth ser capaz de verificar se há periféricos em seu ambiente.<br/><br/>\
                                Ativar o GPS.<br/><br/>",
                ok: "SIM",
                cancel: "Não"
            }).then(() => {
                // locationTracking(dispatch, getState, geolocationSettings)
            })
    }


    componentDidMount = async () => {
        //LoginAutomatico 
        //Setar o state para mostrar o botão do login correto 
        var loginAuto = await AsyncStorage.getItem("loginAuto")
        if (loginAuto == 'true') {
            this.setState({
                stateLogin: false
            })
        } else {
            this.setState({
                stateLogin: true
            })
        }

        AppState.addEventListener('change', state => {
            if (state === 'active') {
                Alert.alert("INSTANT CHECK", "Enquanto seu APP estiver aberto, o modo de medição em segundo plano fica desativado.")
                this.stopBackGround()
                console.log("active");
            } else if (state === 'background') {
                console.log("background")
                this.processBackgroundMeasurement()
            } else if (state === 'inactive') {
                console.log("inactive");
            }
        });


        //Inicia processo em background - medicao
        // await this.processBackgroundMeasurement()

        //Ligando o bluetooth
        manager.enable();

        // Função ONESIGNAL 
        await this.oneSignal();

        //Permissão para liberar a medição em segundo plano, sem monitoração do uso de bateria.
        //await this.getWhiteListPermission()

        console.log("check getBluetoothScanPermission access permission...")
        await this.getBluetoothScanPermission()

        console.log("check requestLocationPermission access permission...")
        await this.requestLocationPermission()

        // Pegando nome do usuário logado e o último device conectado
        let nomeUsuario = await AsyncStorage.getItem("nome")
        nomeUsuario = nomeUsuario.replace("\"", "").replace(" \"", "").replace(" \"  \" ", "")
        let deviceID = await AsyncStorage.getItem("asyncdeviceID")
        this.setState({ nomeUsuario: nomeUsuario, deviceID: deviceID })

    }




    // oneSignal
    oneSignal = async () => {
        try {
            await OneSignal.init("6d02ccd7-05bb-4089-9d66-58caa11080a4", { kOSSettingsKeyAutoPrompt: true });
            await OneSignal.addEventListener('received', this.onReceived);
            await OneSignal.addEventListener('opened', this.onOpened);
            await OneSignal.addEventListener('ids', this.onIds.bind(this));
            await OneSignal.enableVibrate(true);
            await OneSignal.inFocusDisplaying(2);
        }
        catch (err) {
            console.log(err);
        }
    }

    // oneSignal
    onReceived(notification) {
        console.log("Notification received: ", notification);
    }

    // oneSignal
    onOpened(openResult) {
        //console.log('Message: ', openResult.notification.payload.body);
        //console.log('Data: ', openResult.notification.payload.additionalData);
        //console.log('isActive: ', openResult.notification.isAppInFocus);
        //console.log('openResult: ', openResult);
    }

    // oneSignal
    onIds = async (deviceOneSignal) => {
        // console.log('Device info: ', deviceOneSignal);
        // console.log('player id: ', deviceOneSignal.userId);

        // recupera o id do paciente logado
        let id_patient = await AsyncStorage.getItem("id_patient")
        //console.log('idPatient - ONESIGNAL: ', id_patient );

        // recupera id do relogio/device
        let asyncdeviceID = await AsyncStorage.getItem('asyncdeviceID')

        //API para atualizar o codigo do ONESIGNAL do paciente
        try {
            const oneSignal = { id_patient: id_patient, deviceOneSignal: deviceOneSignal.userId, id_device: asyncdeviceID }
            var { data: returnData } = await api.post("monitoring/updateCodOneSignalPatient", "data=" + JSON.stringify(oneSignal));
        } catch (err) {
            // some error handling
            console.log("oneSignal" + err);
        }
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

        try {
            // Parando o processo em segundo plano
            await this.stopBackGround()

            await manager.destroy()
            manager = new BleManager()

            let subscription = await manager.onStateChange((state) => {
                console.log("state : #" + state)
                if (state === 'PoweredOn') {
                    subscription.remove();
                }
            }, true);

            await this.setState({
                loading: true, scanning: true, dadosservicesMAP: new Map(), erro: false, dadosservices: [],
                dados: [], peripherals: new Map(),
                conectando: "Conectando ao seu INSTANT CHECK... ", corIconBluetooth: 'navy',
                modal: true
            });

            var peripherals = this.state.peripherals;
            let ScanOptions = { scanMode: ScanMode.LowLatency }
            manager.startDeviceScan(null, ScanOptions, (error, device) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    console.log("Error - startDeviceScan : " + error);
                    return
                }

                if (!device.name) {
                    device.name = 'SEM NOME';
                }
                // Quando encontrar o dispositivo encerra o processo de scan.    
                //if (device.name === 'T1S') {
                // manager.stopDeviceScan()

                peripherals.set(device.id, device)
                this.setState({ peripherals })
                this.setState({ dadosservices: Array.from(this.state.peripherals.values()) })
                //let lista = this.state.dadosservices.filter((index) => index.name != 'SEM NOME')
                let lista = this.state.dadosservices.filter((index) => index.name === 'T1S')
                this.setState({ dados: lista });
                //}

                console.log(device.name)
                //this.desconectar(device)

                setTimeout(() => {
                    manager.stopDeviceScan()
                    this.setState({ loading: false })
                }, 2500)


            });
        } catch (err) {
            console.log("scanAndConnect" + err);
        }
    }


    deviceconnect = async (device, comando) => {

        await this.setState({ conectando: "Conectando...", corIconBluetooth: 'navy', loading: true, dados: [], modal: false })
        // Limpando campos da última consulta.
        await this.setState({ frequenciaCardiaca: '', oxigenio: '', hiperTensao: '', hipoTensao: '', temperatura: '' })
        if (!comando) { await this.setState({ loadingMedicao: true, modalMedicao: true }) }

        console.log("Connecting to device #### ")

        try {
            //if (!isConnected) {
            console.log("Connecting to device :")
            device = await manager.connectToDevice(device.id, { autoConnect: true })
            console.log("connectToDevice >>> ")
            this.setState({ deviceDados: device })


            //Salvando o id device no registro do usuário

            await AsyncStorage.setItem('asyncdeviceID', device.id)
            // recupera o id do paciente logado                
            await this.oneSignal()

            // Pegando nome do usuário logado e o último device conectado
            let nomeUsuario = await AsyncStorage.getItem("nome")
            nomeUsuario = nomeUsuario.replace("\"", "").replace(" \"", "").replace(" \"  \" ", "")
            let deviceID = await AsyncStorage.getItem("asyncdeviceID")
            this.setState({ nomeUsuario: nomeUsuario, deviceID: deviceID })


            // Active listenning notify 
            await this.setupNotifications(device)
            console.log("setupNotifications")

            // vibra após conectar
            await this.vibratephone(device)
            console.log("vibratephone")

            //Iniciar medição
            await this.novaMedicao(device, comando)
            console.log("novaMedicao")


        } catch (err) {
            // some error handling
            console.log("deviceconnect" + err);
        }
    }

    vibratephone = async (device) => {
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


    measureTempNow = async (device) => {
        //const services = await device.services();
        this.setState({ medeTemperatura: true })

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

                const timeout = setTimeout(() => {
                    if (this.state.interval) {
                        this.measureTempStop(device)
                    }
                }, 5000);

                return () => clearTimeout(timeout);

            } catch (err) {
                console.log(err)
            }

        }
    }

    measureTempStop = async (device) => {
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
                        console.log(" valores > " + err)
                    });
            } catch (err) {
                console.log(err)
            }

            this.setState({ medeTemperatura: false })
        }
    }


    async setupNotifications(device: any) {
        // assuming the 'device' is already connected
        try {
            await device.discoverAllServicesAndCharacteristics();

            // Ativando notificação de ECG+PPG HR        
            let UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"  // UART Service
            let TX_CHARACT = "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // TX Characteristic (Property = Notify) 

            try {
                let retorno = await manager.monitorCharacteristicForDevice(device.id,
                    UART_SERVICE, TX_CHARACT, this.onUARTSubscriptionUpdate_ALL
                );

            } catch (err) {
                console.log(JSON.stringify(err))
            }

        } catch (err) {
            console.log(JSON.stringify(err))
        }
    }


    onUARTSubscriptionUpdate_ALL = async (error: any, characteristics: any) => {
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
                    await this.setState({
                        frequenciaCardiaca: hex6, oxigenio: hex7, hiperTensao: hex8, hipoTensao: hex9,
                    })

                    // Enviando dados para dashboard
                    await this.sendDataCloud(hex6, hex7, hex8, hex9)

                } else if (hex2 === 5 && hex[6] > 0 && hex[4] === 134) {
                    await this.setState({ temperatura: hex[6] + '.' + hex[7] })
                }
                // Vai para página de medições    
                // this.props.navigation.navigate("Medições");
            }
        } catch (err) {
            console.log(JSON.stringify(err))
        }
    };


    desconectar = async (device: any) => {
        if (device) {
            await manager.cancelDeviceConnection(device.id);
            console.log("Desconectando ... ");
            this.setState({ conectando: "Desconectado.", corIconBluetooth: 'gray', connected: false });
            //await AsyncStorage.setItem('asyncdeviceID', '')
            //Alert.alert("Instant Check:", "Desconectado!");
            //manager.destroy()
            //manager = new BleManager()
        } else {
            this.setState({ conectando: "Sem dispositivo conectado.", corIconBluetooth: 'gray' });
            Alert.alert("Instant Check:", "Sem dispositivo conectado");
        }
    }





    abreModal = async (msg: any) => {

        if (msg.item === "Perfil") {
            this.setState({
                modalPerfil: true
            })
        }

        if (msg.item === "Saúde e bem-estar") {
            this.setState({
                modalSaude: true
            })
        }

        if (msg.item === "MULTIMEDIÇÃO") {
            await this.scanAndConnect()
        }

        console.log(msg.item);
    }

    fechaModal = async () => {
        await this.setState({
            modal: false, modalPerfil: false, modalSaude: false, modalMedicao: false
        })
    }


    setText = async (msg) => {
        console.log("setText")
    }


    focusNextField = (id: string) => {
        this.inputs[id].focus();
    };

    toggleSwitchCardiaco = async (value) => {

        this.setState({ switchValueCardiaco: value })

        //await AsyncStorage.setItem("loginAuto", this.state.switchValue.toString());
    }

    toggleSwitchPressao = async (value) => {

        this.setState({ switchValuePressao: value })

        //await AsyncStorage.setItem("loginAuto", this.state.switchValue.toString());
    }

    toggleSwitchDiabete = async (value) => {

        this.setState({ switchValueDiabete: value })

        //await AsyncStorage.setItem("loginAuto", this.state.switchValue.toString());
    }


    toggleSwitch1 = async (value) => {
        this.setState({ switchValue1: value })
    }

    telaLogin = async () => {
        this.props.navigation.navigate("Login")

    }

    novaMedicao = async (device, comando) => {

        // Limpando campos da última consulta.
        await this.setState({ frequenciaCardiaca: '', oxigenio: '', hiperTensao: '', hipoTensao: '', temperatura: '' })
        // if (!comando) { await this.setState({ loadingMedicao: true, modalMedicao: true }) }

        if (device) {
            //const services = await device.services()
            await this.measureTempNow(device)

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
                    console.log(" valores > " + err)
                });

            const timeout = setTimeout(() => {
                this.setState({ interval: true })

                if (this.state.interval) {
                    this.measureAllStop(this.state.deviceDados)
                }
            }, 40000);

            return () => clearTimeout(timeout)

        } else {
            Alert.alert("Instant Check:", "Sem dispositivo conectado");
        }
    }

    measureAllStop = async (device) => {
        //const services = await device.services();
        if (!device) {
            console.log("Dispositivo desconectado")
            //this.setState({ info4: "Dispositivo desconectado" })
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
                console.log(err)
            }
            this.setState({ loadingMedicao: false })
            await this.desconectar(device)
            //await this.processBackgroundMeasurement()
        }
    }



    sendDataCloud = async (frequenciaCardiaca: any, oxigenio: any, hiperTensao: any, hipoTensao: any) => {

        let id_patient = await AsyncStorage.getItem('id_patient')
        try {
            const MonitoringHistoryModel = {
                frequenciaCardiaca: frequenciaCardiaca,
                oxigenio: oxigenio,
                hiperTensao: hiperTensao,
                hipoTensao: hipoTensao,
                temperatura: this.state.temperatura,
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
            console.log("sendDataCloud")
        } catch (err) {
            console.log(err)
        }
    }



    render() {
        const btnScanTitle = 'Conectar Dispositivo (' + (this.state.scanning ? 'on' : 'off') + ')';

        return (
            <>

                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor="black"
                />


                <View
                    style={{
                        paddingTop: 10,
                        backgroundColor: "white",
                        flex: 1
                    }}

                >

                    <View style={styles.cardBorderPersonal}>
                        <View style={{ height: 0 }}>
                            <FontAwesome5 name="portrait" size={90} color='navy'> </FontAwesome5>
                            {/* <Image
                                style={styles.tinyLogo}
                                source={{ uri: 'https://app-bueiro-limpo.s3-us-west-2.amazonaws.com/alas.png' }}
                            /> */}
                        </View>
                        <View style={{ paddingLeft: 100, paddingTop: 3 }}  >
                            <Text style={styles.titleText} > {this.state.nomeUsuario}  </Text>
                            <Text style={styles.titleTextTituloID} > Último ID conectado: {"\n"} {this.state.deviceID}   </Text>
                            <TouchableOpacity onPress={() => this.scanAndConnect()} >
                                <View style={{ flexDirection: "row", paddingTop: 17 }}>

                                    {/*
                                    {this.state.connected ?
                                        <FontAwesome5 name="bluetooth" size={23} color='green'> Conectado ! </FontAwesome5> :
                                        <FontAwesome5 name="bluetooth" size={23} color={this.state.corIconBluetooth}> </FontAwesome5>
                                    }

                                    {this.state.loading &&
                                        <>
                                            <Text><ActivityIndicator size={"small"} color="red" style={{ marginTop: 10 }} /> Conectando... </Text>
                                        </>
                                    }

                                    {!this.state.loading &&
                                        <Text style={{ color: 'gray', fontFamily: '', fontWeight: '400', textAlign: 'right', paddingLeft: 4, fontSize: 20 }}>
                                            {this.state.connected ? '' : 'Desconectado'}
                                        </Text>
                                    }

                                */}

                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={{ flex: 1, paddingTop: 45 }}>

                        <View style={{ flexDirection: "row", justifyContent: "center", flex: 1 }}>

                            <TouchableOpacity onPress={() => this.scanAndConnect()}>
                                <View style={styles.cardBorderMenu}>
                                    <View >
                                        <Text style={styles.titleTextBodyMenu} > <FontAwesome5 name={"stethoscope"} size={50} color="navy" /> </Text>
                                        <Text style={styles.textTextDescricao} >  MULTIMEDIÇÃO  </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>


                            <TouchableOpacity onPress={()=>  this.props.navigation.navigate("Historico") }>
                                <View style={styles.cardBorderMenu}>
                                    <View >
                                        <Text style={styles.titleTextBodyMenu} > <FontAwesome5 name={"history"} size={50} color="navy" /> </Text>
                                        <Text style={styles.textTextDescricao} >  HISTÓRICO  </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                        </View>


                        <View style={{ flexDirection: "row", justifyContent: "center", flex: 1 }}>

                            {this.state.stateLogin &&
                                <TouchableOpacity onPress={() => this.ativarLoginAuto()} >
                                    <View style={{
                                        backgroundColor: "white",
                                        flex: 1,
                                        //padding: 10,
                                        //margin: 50, 
                                        marginRight: 10,
                                        marginBottom: 10,
                                        marginTop: 20,
                                        marginLeft: 10,

                                        width: 115,
                                        height: 120,

                                        borderColor: "navy",
                                        borderWidth: 1,

                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10,

                                        shadowColor: 'black',
                                        shadowOffset: { width: 50, height: 50 },
                                        shadowOpacity: 3,
                                        shadowRadius: 50,
                                        //elevation: 17,

                                        alignContent: "center",
                                        alignItems: "center",
                                        alignSelf: "center",
                                    }}>
                                        <View >
                                            <Text style={styles.titleTextBodyMenu} > <FontAwesome5 name={"lock-open"} size={50} color="navy" /> </Text>
                                            <Text style={styles.textTextDescricao} >  LOGIN AUTOMÁTICO  </Text>
                                            <Text style={{
                                                fontSize: 12, color: "navy", opacity: 0.4, alignItems: "center",
                                                alignSelf: "center", paddingBottom: 2
                                            }}>Desativado </Text>

                                        </View>
                                    </View>
                                </TouchableOpacity>

                            }
                            {!this.state.stateLogin &&
                                <TouchableOpacity onPress={() => this.desativarLoginAuto()} >
                                    <View style={{
                                        backgroundColor: "green",
                                        flex: 1,
                                        //padding: 10,
                                        //margin: 50, 
                                        marginRight: 10,
                                        marginBottom: 10,
                                        marginTop: 20,
                                        marginLeft: 10,

                                        width: 115,
                                        height: 120,

                                        borderColor: "navy",
                                        borderWidth: 1,

                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10,

                                        shadowColor: 'black',
                                        shadowOffset: { width: 50, height: 50 },
                                        shadowOpacity: 3,
                                        shadowRadius: 50,
                                        //elevation: 17,

                                        alignContent: "center",
                                        alignItems: "center",
                                        alignSelf: "center",
                                    }}>
                                        <View >
                                            <Text style={styles.titleTextBodyMenu} > <FontAwesome5 name={"lock"} size={50} color="navy" /> </Text>
                                            <Text style={styles.textTextDescricao} >  LOGIN AUTOMÁTICO  </Text>
                                            <Text style={{
                                                fontSize: 12, color: "navy", opacity: 0.7, alignItems: "center",
                                                alignSelf: "center", paddingBottom: 2
                                            }}>Ativado </Text>

                                        </View>
                                    </View>
                                </TouchableOpacity>

                            }


                            <TouchableOpacity >
                                <View style={styles.cardBorderMenu}>
                                    <View >
                                        <Text style={styles.titleTextBodyMenu} > <FontAwesome5 name={"user-cog"} size={50} color="navy" /> </Text>
                                        <Text style={styles.textTextDescricao} >  OPÇÔES  </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>


                        <View style={{ flexDirection: "row", justifyContent: "center", flex: 1 }}>
                            <TouchableOpacity >
                                <View >
                                    <Text style={styles.titleTextBodyMenu} >  </Text>
                                    <Text style={styles.textTextDescricao} >   </Text>
                                </View>
                            </TouchableOpacity>
                        </View>


                    </ScrollView>
                    {/*
                    <SectionList
                        sections={[
                            // { title: 'MEUS DADOS:', data: ['Perfil', 'Saúde e bem-estar'] },
                            { title: 'INDICADORES:', data: ['MULTIMEDIÇÃO', 'Alertas', 'Histórico'] },
                        ]}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => this.abreModal({ item })} >
                                <Text style={styles.item}>{item}</Text>
                            </TouchableOpacity>
                        }
                        renderSectionHeader={({ section }) =>
                            <Text style={styles.sectionHeader}><FontAwesome5 name="file-medical-alt" size={22} color='navy'></FontAwesome5> {section.title}</Text>
                        }
                        keyExtractor={(item, index) => index}
                    />


                    <Text style={styles.sectionHeader}> <FontAwesome5 name="user-cog" size={22} color='navy'></FontAwesome5> GERENCIAR:</Text>


                    <View style={{ flexDirection: "row", paddingLeft: 35, margin: 12 }}>

                        <Text style={{ paddingLeft: 9, fontSize: 15 }}>{this.state.switchValue1 ? 'Login automático - Ativado' : 'Login automático - Desativado'}</Text>
                        <Switch
                            style={{ paddingLeft: 50 }}
                            onValueChange={this.toggleSwitch1}
                            value={this.state.switchValue1} />
                    </View>

                    <TouchableOpacity
                        onPress={() => this.desconectar(this.state.deviceDados)} >
                        <View style={{ flexDirection: "row", paddingLeft: 35, margin: 12 }}>


                            <Text style={{ paddingLeft: 9, fontSize: 15 }}>Desconectar dispositivo </Text>
                        </View>
                    </TouchableOpacity>
 */}
                </View>



                <View style={{ position: "absolute" }}>
                    <Modal
                        isVisible={this.state.modal}
                        //animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modal: false })}
                        style={styles.modal}
                    >



                        <Text style={styles.sectionHeader}>
                            <FontAwesome5 name="bluetooth" size={22} color='navy'></FontAwesome5> Lista de Dispositivos:
                       </Text>

                        <View style={{ paddingLeft: 30, paddingTop: 15, backgroundColor: '#DCDCDC' }}>
                            <Text >
                                Último ID conectado: {this.state.deviceID} {"\n"}
                            </Text>
                        </View>

                        <ScrollView>
                            {this.state.dados.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={item.name}
                                        onPress={() => this.deviceconnect(item, false)}
                                    >
                                        <Card.Title
                                            title={item.name ? 'INSTANT CHECK - T1S' : 'INSTANT CHECK - T1S'}
                                            //subtitle={item.connected ? 'Desconectar' : 'Conectar'} {item.id}
                                            subtitle={item.id}
                                        //left={() => <FontAwesome5 name={"bluetooth"} size={25} color={this.state.corIconBluetooth} />}
                                        //right={() => <FontAwesome5 name={"bluetooth"} size={25} color={this.state.corIconBluetooth} /> }
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {this.state.loading &&
                            <>
                                <Text style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 40, fontSize: 18 }}>
                                    <ActivityIndicator size={"large"} color="red" style={{ marginTop: 10 }} />  {" "} Pesquisando... Aguarde ! </Text>
                            </>
                        }

                        <TouchableOpacity style={{ alignItems: "flex-end", alignContent: "flex-end", margin: 10, paddingTop: 10, paddingLeft: 40 }}
                            onPress={this.fechaModal} >
                            <FontAwesome5 name='sign-out-alt' color='navy' size={17} > Sair </FontAwesome5>
                        </TouchableOpacity>

                    </Modal>
                </View>

                <View>
                    <Modal
                        isVisible={this.state.modalPerfil}
                        animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modalPerfil: false })}
                        style={styles.modalPerfil}
                    >

                        <Card>
                            <Card.Content>
                                <Title>Dados Pessoais:</Title>
                            </Card.Content>
                        </Card>


                        <ScrollView>

                            <View style={{ margin: 15 }}>
                                <TextInput
                                    style={{ fontSize: 13 }}
                                    mode="outlined"
                                    label="Email"
                                    value={this.state.email}
                                    onChangeText={text => this.setState({ email: text })}
                                    onSubmitEditing={() => { this.focusNextField('Nome'); }}
                                    ref={input => { this.inputs['Email'] = input; }}
                                    returnKeyType="next"

                                />

                                <TextInput
                                    style={{ fontSize: 13 }}
                                    mode="outlined"
                                    label="Nome"
                                    value={this.state.nome}
                                    onChangeText={text => this.setState({ nome: text })}
                                    onSubmitEditing={() => { this.focusNextField('Idade'); }}
                                    ref={input => { this.inputs['Nome'] = input; }}
                                    returnKeyType="next"
                                    placeholder=""
                                    placeholderTextColor="gray"
                                />

                                <TextInput
                                    style={{ fontSize: 13 }}
                                    mode="outlined"
                                    label="Idade"
                                    value={this.state.idade}
                                    onChangeText={text => this.setState({ idade: text })}
                                    keyboardType='numeric'
                                    onSubmitEditing={() => { this.focusNextField('Peso'); }}
                                    ref={input => { this.inputs['Idade'] = input; }}
                                    returnKeyType="next"
                                    placeholder="33"
                                    placeholderTextColor="gray"
                                />

                                <TextInput
                                    style={{ fontSize: 13 }}
                                    mode="outlined"
                                    label="Peso"
                                    value={this.state.peso}
                                    onChangeText={text => this.setState({ peso: text })}
                                    keyboardType='numeric'
                                    onSubmitEditing={() => { this.focusNextField('Altura'); }}
                                    ref={input => { this.inputs['Peso'] = input; }}
                                    returnKeyType="next"
                                    placeholder="90"
                                    placeholderTextColor="gray"
                                />

                                <TextInput
                                    style={{ fontSize: 13 }}
                                    mode="outlined"
                                    label="Altura"
                                    value={this.state.altura}
                                    onChangeText={text => this.setState({ altura: text })}
                                    ref={input => { this.inputs['Altura'] = input; }}
                                    placeholder="1,83"
                                    placeholderTextColor="gray"
                                />
                            </View>

                        </ScrollView>

                        <View style={{ flexDirection: "row", justifyContent: "center" }}>

                            <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 1 }}
                                onPress={() => console.log('Pressed')}>
                                <FontAwesome5 name='cloud-upload-alt' color='blue' size={17} > Salvar </FontAwesome5>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 40 }}
                                onPress={this.fechaModal} >
                                <FontAwesome5 name='sign-out-alt' color='red' size={17} > Sair </FontAwesome5>
                            </TouchableOpacity>

                        </View>

                    </Modal>
                </View>


                <View>
                    <Modal
                        isVisible={this.state.modalSaude}
                        animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modalPerfil: false })}
                        style={styles.modalPerfil}
                    >

                        <Card>
                            <Card.Content>
                                <Title>Sua saúde :</Title>
                            </Card.Content>
                        </Card>


                        <ScrollView>

                            <View style={{ margin: 15 }}>

                                <SectionList
                                    sections={[
                                        { title: 'MEUS DADOS:', data: [] }
                                    ]}
                                    renderItem={({ item }) =>
                                        <TouchableOpacity onPress={() => this.abreModal({ item })} >
                                            <Text style={styles.item}>{item}</Text>
                                        </TouchableOpacity>
                                    }
                                    renderSectionHeader={({ section }) =>
                                        <Text style={styles.sectionHeader}>

                                            <View style={{ flexDirection: "row" }}>
                                                <Text style={{ paddingTop: 3 }}>{this.state.switchValuePressao ? 'Pressão alta ou baixa - Sim' : 'Pressão alta ou baixa - Não'}</Text>
                                                <Switch
                                                    style={{ paddingBottom: -3, paddingLeft: 20 }}
                                                    onValueChange={this.toggleSwitchPressao}
                                                    value={this.state.switchValuePressao}
                                                />
                                            </View>

                                            <View style={{ flexDirection: "row", paddingTop: 15 }}>
                                                <Text style={{ paddingTop: 3 }}>{this.state.switchValueCardiaco ? 'Problemas cardíacos - Sim' : 'Problemas cardíacos - Não'}</Text>
                                                <Switch
                                                    style={{ paddingBottom: -3, paddingLeft: 20 }}
                                                    onValueChange={this.toggleSwitchCardiaco}
                                                    value={this.state.switchValueCardiaco}
                                                />
                                            </View>

                                            <View style={{ flexDirection: "row", paddingTop: 15 }}>
                                                <Text style={{ paddingTop: 3 }}>{this.state.switchValueDiabete ? 'Diabetes - Sim' : 'Diabetes - Não'}</Text>
                                                <Switch
                                                    style={{ paddingBottom: -3, paddingLeft: 20 }}
                                                    onValueChange={this.toggleSwitchDiabete}
                                                    value={this.state.switchValueDiabete}
                                                />
                                            </View>



                                        </Text>
                                    }
                                    keyExtractor={(item, index) => index}
                                />

                                <View style={{ borderColor: "#fff", borderWidth: 0, margin: 5 }}>
                                    <TextInput
                                        placeholderTextColor="gray"
                                        style={{
                                            maxHeight: 300,
                                            textAlignVertical: 'top',
                                            //padding: 10,
                                            fontSize: 14,
                                            backgroundColor: "white",
                                            borderWidth: 1,
                                            borderColor: "gray",
                                            borderRadius: 20,
                                            margin: 10,
                                            paddingBottom: 30,
                                            flex: 1,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: 30
                                        }}
                                        maxLength={150}
                                        multiline={true}
                                        numberOfLines={3}
                                        placeholder="Outras informações"
                                        onChangeText={(texto) => this.setState({ outros: texto })}
                                        value={this.state.outros}
                                    />
                                </View>
                            </View>

                        </ScrollView>

                        <View style={{ flexDirection: "row", justifyContent: "center" }}>

                            <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 1 }}
                                onPress={() => console.log('Pressed')}>
                                <FontAwesome5 name='cloud-upload-alt' color='blue' size={17} > Salvar </FontAwesome5>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 40 }}
                                onPress={this.fechaModal} >
                                <FontAwesome5 name='sign-out-alt' color='red' size={17} > Sair </FontAwesome5>
                            </TouchableOpacity>

                        </View>

                    </Modal>
                </View>




                <View  >
                    <Modal
                        isVisible={this.state.modalMedicao}
                        animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modalMedicao: false })}
                        style={styles.modalMedicao}
                    >

                        <ScrollView>

                            <View style={styles.viewPrincipal}>

                                <Image
                                    source={require('../../assets/logo.png')}
                                    resizeMode="contain"
                                    style={styles.logoMedicao}
                                />
                                <Text style={styles.textlogoMedicao} > MULTIMEDIÇÃO  </Text>

                                <View style={{ flexDirection: "row", justifyContent: "center" }}>

                                    <TouchableOpacity >
                                        <View style={styles.cardBorder}>
                                            <View >
                                                {/*  <Text style={styles.titleTextTitulo} > <FontAwesome5 name={"heartbeat"} size={30} color="navy" /> </Text> */}
                                                <Text style={styles.textTextDescricao} > Frequência Cardíaca </Text>
                                                <Text style={styles.titleTextTitulo}> ( bpm )</Text>
                                                <Text style={styles.textText} >{this.state.frequenciaCardiaca}</Text>

                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity >
                                        <View style={styles.cardBorder}>
                                            <View >
                                                {/* <Text style={styles.titleTextTitulo} > <FontAwesome5 name={"stethoscope"} size={30} color="navy" /> </Text> */}
                                                <Text style={styles.textTextDescricao} > Pressão arterial </Text>
                                                <Text style={styles.titleTextTitulo}> ( mmhg )</Text>
                                                <Text style={styles.textText}>{this.state.hiperTensao}/{this.state.hipoTensao}</Text>

                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "center" }}>

                                    <TouchableOpacity >
                                        <View style={styles.cardBorder}>
                                            <View >
                                                {/* <Text style={styles.titleTextTitulo} > <FontAwesome5 name={"tint"} size={30} color="navy" /> </Text> */}
                                                <Text style={styles.textTextDescricao} > Saturação do oxigênio </Text>
                                                <Text style={styles.titleTextTitulo}>( SpO2 % )</Text>
                                                <Text style={styles.textText} >{this.state.oxigenio}</Text>
                                                <Text style={styles.textTextDescricao} >{this.state.oxigenio > '90' ? "Normal" : "Atenção"}   </Text>

                                            </View>
                                        </View>
                                    </TouchableOpacity>


                                    <TouchableOpacity >
                                        <View style={styles.cardBorder}>
                                            <View >

                                                <Text style={styles.textTextDescricao} > Temperatura  </Text>
                                                <Text style={styles.titleTextTitulo}>( °C ) </Text>
                                                <Text style={styles.textText} >{this.state.temperatura}</Text>
                                                <Text style={styles.textTextDescricao} >{this.state.temperatura > '38' ? "Atenção" : "Normal"}   </Text>

                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                </View>

                                <View style={{ padding: 5 }}>
                                    {this.state.loadingMedicao &&
                                        <>
                                            <Text style={{ alignItems: 'center', alignContent: "center", margin: 10, paddingTop: 10, paddingLeft: 40, fontSize: 18 }}>
                                                <ActivityIndicator size={"large"} color="red" style={{ marginTop: 10, justifyContent: "center" }} />   {" "} Aguarde... </Text>
                                        </>
                                    }
                                </View>

                            </View>

                            <View style={{ alignItems: 'center', alignContent: "center", backgroundColor: "white", width: 90, marginTop: 30 }}>

                                <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", margin: 3, paddingTop: 1, paddingLeft: 0 }}
                                    onPress={this.fechaModal} >
                                    <FontAwesome5 name='sign-out-alt' color='navy' size={17} > Sair </FontAwesome5>
                                </TouchableOpacity>

                            </View>

                        </ScrollView>


                    </Modal>
                </View>



            </>
        );
    }
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height,
        paddingTop: 22
    },
    logoMedicao: {
        marginTop: 5,
        width: 200,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    textlogoMedicao: {
        fontSize: 15,
        color: "navy",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
        marginBottom: 20,
        fontWeight: "bold",
    },
    viewPrincipal: {
        //marginTop: window.height/7.9 ,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
    textText: {
        fontSize: 28,
        color: "navy",
        fontWeight: "bold",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
        marginTop: 12,
    },
    textTextDescricao: {
        fontSize: 12,
        color: "navy",
        fontWeight: "bold",
        marginTop: 10,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
        //fontWeight: "bold",
    },
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        paddingBottom: 10,
    },
    titleTextTitulo: {
        fontSize: 12,
        //fontWeight: "bold",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
        // marginTop: 10,
    },
    titleTextTituloID: {
        fontSize: 14,
        //fontWeight: "bold",
        // marginTop: 10,
    },
    titleTextBodyMenu: {
        fontSize: 14,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
        paddingTop: 9
    },
    cardBorder: {
        backgroundColor: "white",
        flex: 1,
        //padding: 10,
        //margin: 50, 
        marginRight: 10,
        marginBottom: 10,
        marginTop: 10,
        marginLeft: 10,

        width: 133,
        height: 160,

        borderColor: "gray",
        borderWidth: 1,

        borderRadius: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,

        borderBottomWidth: 0,
        shadowColor: 'yellow',
        shadowOffset: { width: 50, height: 50 },
        shadowOpacity: 3,
        shadowRadius: 10,
        elevation: 15,

        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
    },
    cardBorderMenu: {
        backgroundColor: "white",
        flex: 1,
        //padding: 10,
        //margin: 50, 
        marginRight: 10,
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 10,

        width: 115,
        height: 120,

        borderColor: "navy",
        borderWidth: 1,

        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,

        shadowColor: 'black',
        shadowOffset: { width: 50, height: 50 },
        shadowOpacity: 3,
        shadowRadius: 50,
        //elevation: 17,

        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
        textAlign: "center",
        textAlignVertical: "center",
    },
    cardBorderPersonal: {
        //borderTopRightRadius: 30,
        //borderTopLeftRadius: 30,
        //borderBottomRightRadius: 30,
        //borderBottomLeftRadius: 30,
        backgroundColor: 'white',
        //flex: 1,
        padding: 30,
        //margin: 10,
        borderColor: 'black',
        //borderBottomWidth: 1
    },
    tinyLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    tinyLogoMedicao: {
        width: 150,
        height: 150,
        borderRadius: 40,
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    sectionHeader: {
        //padding: 30,
        //margin: 10,
        paddingTop: 9,
        paddingLeft: 20,
        //paddingRight: 10,
        paddingBottom: 9,
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(247,247,247,1.0)',
        textDecorationColor: 'gray',
        color: 'navy'
    },
    item: {
        paddingLeft: 55,
        paddingBottom: 10,
        paddingTop: 10,
        fontSize: 16,
        height: 44,
    },
    modal: {
        backgroundColor: 'white',
        //margin: 30, // This is the important style you need to set
        marginBottom: 220,
        //marginTop: 5,
        //alignItems: undefined,
        //justifyContent: undefined,
    },
    modalPerfil: {
        backgroundColor: 'white',
        margin: 30, // This is the important style you need to set
        marginBottom: 80,
        //alignItems: undefined,
        //justifyContent: undefined,
    },
    modalMedicao: {
        //backgroundColor: '#F8F8FF',
        backgroundColor: 'white',
        //margin: window.width/2, // This is the important style you need to set
        marginTop: window.width / 15,
        //width: window.width,
        //height: window.height,
        //marginBottom: 1,
        //alignItems: undefined,
        //justifyContent: undefined,
        //flex: 1,
        //backgroundColor: 'transparent',
        justifyContent: 'center',
        //position: 'absolute'

    },
});

