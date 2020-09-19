import React, { PureComponent } from 'react';
import { NavigationScreenProp } from 'react-navigation';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    AppState,
    FlatList,
    Dimensions,
    SafeAreaView,
    NativeAppEventEmitter,
    AsyncStorage,
    Button,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Image
} from 'react-native';
import { Card } from 'react-native-elements';
import { BleManager } from 'react-native-ble-plx';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const window = Dimensions.get('window');
import Icon from 'react-native-vector-icons/FontAwesome';
import { stringToBytes } from "convert-string";
import { Buffer } from 'buffer';
import base64 from 'react-native-base64';
import { Col, Row, Grid } from "react-native-easy-grid";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import BleManagerX from 'react-native-ble-manager';

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

async function onBluetooth() {

    BleManagerX.enableBluetooth()
        .then(() => {
            // Success code
            console.log("The bluetooth is already enabled or the user confirm = OK");
        })
        .catch((error) => {
            // Failure code
            console.log("The user refuse to enable bluetooth = NOT");
        });


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
        };
    }

    componentDidMount = async () => {

        console.log("check bluetooth access permission...")
        await onBluetooth()

        console.log("check getBluetoothScanPermission access permission...")
        await getBluetoothScanPermission()

        console.log("check requestLocationPermission access permission...")
        await requestLocationPermission()

        /*
        BleManager.scan([], 30, true).then((results) => {
          console.log('Scanning...');
          this.setState({
            scanning: true
          });
          console.log("scanning... = OK")
        });
        */
    }


    UNSAFE_componentWillMount() {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                //this.scanAndConnect();
                subscription.remove();
            }
        }, true);
    }


    async scanAndConnect() {

        await this.setState({
            loading: true, scanning: true, dadosservicesMAP: new Map(), erro: false, dadosservices: [], dados: [], peripherals: new Map(),
            conectando: "Conectando ao seu INSTANT CHECK... " , corIconBluetooth: 'navy'
        });

        try {
            var peripherals = this.state.peripherals;
            manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    console.log("Error - startDeviceScan : " + error);
                    return
                }

                // Check if it is a device you are looking for based on advertisement data
                // or other criteria.
                if (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag') {
                    // Stop scanning as it's not necessary if you are scanning for one device.
                    manager.stopDeviceScan();
                    // Proceed with connection.
                }

                if (!device.name) {
                    device.name = 'SEM NOME';
                }
                peripherals.set(device.id, device);
                this.setState({ peripherals });
                const list = Array.from(this.state.peripherals.values());
                this.setState({ dados: list });

                setTimeout(() => {
                    manager.stopDeviceScan();
                    this.setState({ loading: false, scanning: false });
                }, 5000);

            });
        } catch (err) {
            // some error handling
            console.log("scanAndConnect" + err);
        }


        setTimeout(() => {
            this.setState({ conectando: "Conectado! Bem vindo." , corIconBluetooth: 'green'  });                
        }, 2000);
    
            
    }


    deviceconnect(device) {
        this.setState({ loading: true, dados: [] });
        try {
            device.connect()
                .then((device) => {
                    return device.discoverAllServicesAndCharacteristics()
                })
                .then((device) => {
                    // Do work on device with services and characteristics
                    return this.printAllServices(device);
                })
                .catch((error) => {
                    // Handle errors                    
                    console.log("deviceconnect : " + error);
                    this.setState({ erro: true, loading: false });
                });
        } catch (err) {
            // some error handling
            console.log("deviceconnect" + err);
        }
    }

    async setupNotifications(device) {

        // assuming the 'device' is already connected
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();

        console.log(" services : " + services);
        const list = Array.from(services.values());
        this.setState({ dadosservices: list });

    }


    async printAllServices(device) {
        await this.setState({ loading: true, scanning: true, dadosservicesMAP: new Map(), erro: false, dadosservices: [], dados: [] });

        const services = await device.services();
        try {
            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const characteristics = await service.characteristics();

                for (let j = 0; j < characteristics.length; j++) {
                    const char = characteristics[j];
                    this.setState({ loading: true });
                    this.readCharacteristic(device.id, `${char.serviceUUID}`, `${char.uuid}`);
                }
            }
            this.setState({ loading: false });
        } catch (err) {
            // some error handling
            console.log("printAllServices" + err);
        }
    }

    async readCharacteristic(device, service, characteristic) {
        try {

            const result = await manager.readCharacteristicForDevice(
                device,
                service,
                characteristic
            )

            /*    
            console.log(" > > > ");
            console.log("serviceUUID: " + result.serviceUUID);
            console.log("UUID: " + result.uuid);
            console.log("isNotifiable: " + result.isNotifiable);
            console.log("isNotifying: " + result.isNotifying);
            console.log("isReadable: " + result.isReadable);
            console.log("isWritableWithResponse: " + result.isWritableWithResponse);
            console.log("isWritableWithoutResponse: " + result.isWritableWithoutResponse);
            console.log("serviceID: " + result.serviceID);
            console.log("id: " + result.id);
            console.log("isIndicatable: " + result.isIndicatable);
            console.log("value: " + base64.decode(result.value));
            // console.log ( base64.decode(result.value) );
            */

            var peripherals = this.state.dadosservicesMAP;
            peripherals.set(result.id, result);
            this.setState({ peripherals });
            const list = Array.from(this.state.dadosservicesMAP.values());
            this.setState({ dadosservices: list });

            this.setState({ dados: [] });

        } catch (err) {
            // some error handling
            console.log("this.result.value" + err);
        }
    }


    retrieveConnected = async (deviceId = null) => {
        if (!deviceId) return false;
        const isConnected = await manager.isDeviceConnected(deviceId);
        if (isConnected) {
            console.log(`Device ${deviceId} is connected!`);
        } else {
            console.log(`Device ${deviceId} is NOT connected!`);
        }
        return isConnected;
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

                        <View style={{ paddingLeft: 0 }}  >
                            <Text style={styles.titleText} > </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.textTextDescricao} >Na guia  <FontAwesome5 name="bell" color="navy" size={12}></FontAwesome5> Alertas,
                                veja os avisos sobre suas condições.
                                </Text>
                            </View>
                        </View>


                        <View style={{ paddingLeft: 0 }}  >
                            <Text style={styles.titleText} > </Text>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.textTextDescricao} >Na guia  <FontAwesome5 name="cogs" color="navy" size={12}></FontAwesome5> Opções,
                                configure o Instant Check conforme suas necessidades.
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
        height: window.height
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
    }
});