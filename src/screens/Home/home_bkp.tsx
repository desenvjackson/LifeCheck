import React, { PureComponent } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import {
    StyleSheet,
    Text,
    View,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    AppState,
    FlatList,
    Dimensions,
    SafeAreaView,
    NativeAppEventEmitter,
    Button,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Image, 
    SectionList
} from 'react-native';
import { Card } from 'react-native-elements';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const window = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import { stringToBytes } from "convert-string";


import { Col, Row, Grid } from "react-native-easy-grid";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import AsyncStorage from '@react-native-community/async-storage';

import {
    BleManager,
    BleError,
    Device,
    LogLevel,
    Characteristic,
  } from 'react-native-ble-plx';


import Modal from 'react-native-modal';

import base64 from 'base-64';
import utf8 from 'utf8'
import { Buffer } from 'buffer';




interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    marker: Array<any>,
    dados: Array<any>,
    dadosservices: Array<any>,
    dadosservicesMAP: any,
    peripherals: any,
    loading: boolean,
    scanning: boolean,
    erro: boolean,
    conectando: any,
    corIconBluetooth: any,
    modal: boolean,
    deviceDados: any,
    info: any,
}

const manager = new BleManager();


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





export default class HomeScreen extends PureComponent<Props, State> {

    static navigationOptions = ({ navigation }) => {
        return {
        }
    }

    constructor(props: Props) {
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
            info: '',
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

        this.setState({ loading: true, dados: [] , modal: false });
        console.log("Connecting to device :")

        // Verifica se o dipositivo tá conectado
        let isConnected = await device.isConnected()
        manager.stopDeviceScan();


        try {
            if (!isConnected) {
                device = await manager.connectToDevice(device.id)
                this.setState({ deviceDados: device }) 
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

        /*
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

        */

         // Ativando notificação de ECG+PPG HR
        let UART_SERVICE_ALL = "0000fff0-0000-1000-8000-00805f9b34fb"  // UART Service
        let TX_CHARACT_ALL = "0000fff7-0000-1000-8000-00805f9b34fb" // TX Characteristic (Property = Notify) - ALL

        try {
            let char = await manager.monitorCharacteristicForDevice(device.id,
                UART_SERVICE_ALL,
                TX_CHARACT_ALL,
                this.onUARTSubscriptionUpdate_ALL
            );
        } catch (err) {
            console.log(JSON.stringify(err))
        }

 
    }



    onUARTSubscriptionUpdate = async (error: any, characteristics: any) => {
        try {
            if (error) {
                console.log(JSON.stringify(error))
            } else if (characteristics) {

                let Geralbuff = Buffer.from(characteristics.value, 'base64');

                let buff = Buffer.from(characteristics.value, 'base64');
                const buff2 = buff[1];
                // {"data": [4, 101], "type": "Buffer"}

                //  console.log(' Batimento cardíaco - Received: ', buff)
                this.setState({ info: buff2 });          

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

                let codFinalizado = Geralbuff[0]
                let codSucesso = Geralbuff[1]

                let hrv = Geralbuff[2]
                let frequenciaCardiaca = Geralbuff[4]
                let estresse = Geralbuff[5]
                let hiperTensao = Geralbuff[6]
                let hipoTensao = Geralbuff[7]
                let humor = Geralbuff[8]
                let frequenciaRespiratoria = Geralbuff[9]

                console.log(' codFinalizado: ', codFinalizado + " hrv "  + hrv)
                console.log(' codSucesso: ', codSucesso +  " hiperTensao " + hiperTensao)

                await AsyncStorage.setItem("notificando", "1")

              if (codFinalizado === 156 && codSucesso === 3){

                   await AsyncStorage.setItem("hrv", hrv.toString())
                   await AsyncStorage.setItem("frequenciaCardiaca", frequenciaCardiaca.toString())
                   await AsyncStorage.setItem("estresse", estresse.toString())
                   await AsyncStorage.setItem("hiperTensao", hiperTensao.toString())
                   await AsyncStorage.setItem("hipoTensao", hipoTensao.toString())
                   await AsyncStorage.setItem("humor", humor.toString())
                   await AsyncStorage.setItem("frequenciaRespiratoria", frequenciaRespiratoria.toString())
                   await AsyncStorage.setItem("notificando", "0")

              }
         
                // AsyncStorage.setItem("heart" ,  ) 

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
        const btnScanTitle = 'Conectar Dispositivo (' + (this.state.scanning ? 'on' : 'off') + ')';

        return (
            <>

                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor="gray"
                />

                <View style={styles.container}>
                    <SectionList
                    sections={[
                        {title: 'D', data: ['Devin', 'Dan', 'Dominic']},
                        {title: 'J', data: ['Jackson', 'James', 'Jillian', 'Jimmy', 'Joel', 'John', 'Julie']},
                    ]}
                    renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
                    renderSectionHeader={({section}) => 
                        <Text style={styles.sectionHeader}>{section.title}</Text>
                    }
                        keyExtractor={(item, index) => index}
                    />
                </View>     


                <View
                    style={{
                        paddingTop: 25
                    }}

                >


                    
              




                    <View style={styles.cardBorderPersonal}>
                        <View style={{ height: 0 }}>
                            <Image
                                style={styles.tinyLogo}
                                source={{ uri: 'https://app-bueiro-limpo.s3-us-west-2.amazonaws.com/alas.png' }}
                            />
                        </View>
                        <View style={{ paddingLeft: 100, paddingTop: 12 }}  >
                            <Text style={styles.titleText} >Alas Jackson , bem vindo!  </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.textTextDescricao} >  </Text>
                            </View>
                        </View>



                        <View style={{ paddingLeft: 0 }}  >
                            <Text style={styles.titleText} > </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.textTextDescricao} >Na guia  <FontAwesome5 name="file-medical-alt" color="navy" size={12}></FontAwesome5> Medições,
                                veja suas condições atuais.
                                </Text>
                            </View>
                        </View>

             

                    </View>




                    <TouchableOpacity onPress={() => this.scanAndConnect()} >
                        <View style={styles.cardBorder}>
                            <View style={{ height: 0 }}>
                                <FontAwesome5 name={"bluetooth"} size={40} color={this.state.corIconBluetooth} />
                            </View>
                            <View style={{ paddingLeft: "15%" }}  >
                                <Text style={styles.titleText} > Instant Check </Text>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={styles.textTextDescricao} > Clique para conectar o dispositivo </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>


                    {this.state.loading &&
                        <View style={{ paddingLeft: 50, paddingTop: -80 }}  >
                            <Text style={styles.titleText} > </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.textTextDescricao} >{this.state.conectando}
                                </Text>
                            </View>
                        </View>
                    }
                    
                        <View style={{ margin: 10 }}>
                                    <Text>{this.state.info}</Text>
                                    <Button color="#079F39" title="Desconectar" onPress={() => this.desconectar(this.state.deviceDados)} />
                        </View>



                </View>

                <ScrollView>
                    <Modal
                        isVisible={this.state.modal}
                        animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modal: false })}
                        style={{
                            backgroundColor: '#fff', flex: 1 , width: 200, height: 50 , 
                        }}
                    >



                        {this.state.dados.map((item, index) => {
                            return (
                                <Grid>
                                   
                                        <> 

                                                <TouchableOpacity
                                                    key={item.name}
                                                    onPress={() => this.deviceconnect(item)}
                                                    >

                                                 <Text style={{ fontSize: 15, paddingBottom: 5, paddingLeft: 1 }} >{item.name}</Text>

                                                    {item.connected ?
                                                        <FontAwesome5 name="check" size={25} color='green'></FontAwesome5> :
                                                        <FontAwesome5 name="bluetooth" size={25} color='navy'></FontAwesome5>
                                                    }

                                                    <Text style={{ color: 'gray', fontFamily: '', fontWeight: '400', textAlign: 'right', paddingLeft: 4 }}>
                                                        {item.connected ? 'Desconectar' : 'Conectar'}
                                                    </Text>

                                                </TouchableOpacity>

                                            


                                        </>
                                    
                                </Grid>                                
                            );
                        })}

                                                        {this.state.loading &&
                                                            <ActivityIndicator size={"small"} color="black" style={{ marginTop: 10 }} />
                                                        }


                    </Modal>
                </ScrollView>


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
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
    textText: {
        fontSize: 18,
        color: "red",
        fontWeight: "bold"
    },
    textTextDescricao: {
        fontSize: 14,
        color: "gray",
        marginTop: "2%"
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold"
    },
    cardBorder: {
        borderTopRightRadius: 80,
        borderBottomRightRadius: 80,
        backgroundColor: 'white',
        padding: 30,
        margin: 10,
        borderColor: 'black',
        borderWidth: 1,
    },
    cardBorderPersonal: {
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        backgroundColor: 'white',
        //flex: 1,
        padding: 30,
        margin: 10,
        borderColor: 'black',
        borderWidth: 1,
    },
    tinyLogo: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    sectionHeader: {
        paddingTop: 2,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 2,
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(247,247,247,1.0)',
      },
      item: {
        padding: 10,
        fontSize: 18,
        height: 44,
      },
});

 