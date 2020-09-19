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
    ScrollView
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
            loading: false,
            scanning: false,
            erro: false,
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

       await this.setState({ loading: true, scanning: true, dadosservicesMAP: new Map() , erro: false, dadosservices: [], dados: [], peripherals: new Map()  });

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
                    console.log ( "deviceconnect : " + error  );
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
        await this.setState({ loading: true, scanning: true, dadosservicesMAP: new Map() , erro: false, dadosservices: [], dados: []  });

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
            console.log ( "this.result.value" + err );
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
        const btnScanTitle = 'Scan Bluetooth (' + (this.state.scanning ? 'on' : 'off') + ')';

        return (

            <View
                style={{
                    paddingTop: 40,
                    ...StyleSheet.absoluteFillObject,
                }}
            //style={StyleSheet.absoluteFillObject}
            >

                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor="gray"
                />

                <View style={{ margin: 10 }}>
                    <Button title={btnScanTitle} onPress={() => this.scanAndConnect()} />
                </View>

                {/*
                <View style={{ margin: 10 }}>
                    <Button title="Recuperar periféricos conectados" onPress={() => this.retrieveConnected()} />
                </View>
                */}


                {this.state.loading &&
                    <ActivityIndicator size={"small"} color="black" style={{ marginTop: 10 }} />
                }

                <ScrollView>
                    <View style={{ width: "100%", paddingTop: 20, paddingBottom: 10 }}  > 

                        {this.state.dados.map((item, index) => {
                            return (
                                <View>
                                    <Grid>
                                        <TouchableOpacity
                                            key={item.id}
                                            style={{
                                                borderWidth: 3,
                                                borderColor: "white",
                                                borderRadius: 20,
                                                margin: 10,
                                                padding: 15,
                                                paddingBottom: 30,
                                                flex: 1,
                                            }}
                                        >
                                            <>
                                                <Col style={{ flexDirection: 'row', paddingBottom: 5, flex: 1, }}>
                                                    <Text style={{ fontSize: 15, paddingBottom: 5, paddingLeft: 1, fontWeight: 'bold' }} >Descrição: {item.name}</Text>
                                                </Col>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }}> RSSI: {item.rssi} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }}> ID:  {item.id} </Text>
                                                </Row>

                                                <TouchableOpacity
                                                    key={item.id}
                                                    onPress={() => this.deviceconnect(item)}
                                                    style={{ justifyContent: 'flex-end', flexDirection: "row", alignItems: "flex-end" }}>

                                                    {item.connected ?
                                                        <FontAwesome5 name="check" size={25} color='green'></FontAwesome5> :
                                                        <FontAwesome5 name="bluetooth" size={25} color='navy'></FontAwesome5>
                                                    }

                                                    <Text style={{ color: 'gray', fontFamily: '', fontWeight: '400', textAlign: 'right', paddingLeft: 4 }}>
                                                        {item.connected ? 'Desconectar' : 'Conectar'}
                                                    </Text>

                                                </TouchableOpacity>

                                            </>
                                        </TouchableOpacity>
                                    </Grid>
                                </View>
                            );
                        })}

                        {this.state.erro &&
                            <View style={{ margin: 10 }}>
                                 <Text style={{ fontSize: 15, paddingBottom: 5, paddingLeft: 1, fontWeight: 'bold' }} > Sem dados. </Text>
                            </View>
                        }

                        {this.state.dadosservices.map((item, index) => {

                            <StatusBar
                                animated={true}
                                translucent={true}
                                barStyle={'light-content'}
                                backgroundColor="gray"
                            />

                            return (
                                <View>
                                    <Grid>
                                        <TouchableOpacity
                                            key={item.id}
                                            style={{
                                                borderWidth: 3,
                                                borderColor: "white",
                                                borderRadius: 20,
                                                margin: 10,
                                                padding: 15,
                                                paddingBottom: 30,
                                                flex: 1,
                                            }}
                                        >
                                            <>
                                                <Col style={{ flexDirection: 'row', paddingBottom: 5, flex: 1, }}>
                                                    <Text style={{ fontSize: 15, paddingBottom: 5, paddingLeft: 1, fontWeight: 'bold' }} >ID: {item.id}</Text>
                                                </Col>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> serviceUUID: </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} >  {item.serviceUUID} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> UUID: </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {item.uuid} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> isNotifiable (é notificável):   </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isNotifiable)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> isNotifying (está notificando):  </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isNotifying)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> isReadable (é legível): </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isReadable)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> é gravável com resposta:  </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isWritableWithResponse)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> é gravável sem resposta:  </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isWritableWithoutResponse)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> serviceID:  </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.serviceID)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> isIndicatable (é indicável): </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} > {String(item.isIndicatable)} </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12, fontWeight: 'bold' }}> value (valor): </Text>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} >  {String(base64.decode(item.value))}  </Text>
                                                </Row>
                                                <Row>
                                                    <Text style={{ textAlign: 'justify', fontSize: 12 }} >  {item.value}  </Text>
                                                </Row>
                                            </>
                                        </TouchableOpacity>
                                    </Grid>
                                </View>
                            );
                        })}


                    </View>
                </ScrollView>

            </View>

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
});