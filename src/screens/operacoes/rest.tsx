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
    AsyncStorage,
    Button,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Modal
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
    idDevice: any,
    pendingDataReceive: any,
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
            idDevice: "",
            pendingDataReceive:"",
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
                if (device.name === 'T1S' || device.name === 'T1S') {
                    // Stop scanning as it's not necessary if you are scanning for one device.
                      manager.stopDeviceScan();

                      peripherals.set(device.id, device);
                      this.setState({ peripherals });
                      const list = Array.from(this.state.peripherals.values());
                      this.setState({ dados: list });
                      this.setState({ loading: false, scanning: false });

                }

                // manager.stopDeviceScan();

                // console.log (device.name);

               // if (!device.name) {
                //    device.name = 'SEM NOME';
               // }               

                setTimeout(() => {
                    manager.stopDeviceScan();
                    this.setState({ loading: false, scanning: false });
                }, 9000);
                

            });
        } catch (err) {
            // some error handling
            console.log("scanAndConnect" + err);
        }
    }


    deviceconnect = async (device) => {
        this.setState({ loading: true, dados: [] });
        try {
            device.connect()
                .then((device) => {
                    return device.discoverAllServicesAndCharacteristics();      
                })
                .then((device) => {
                    // Do work on device with services and characteristics
                    return this.printAllServices(device);                    
                })
                .catch((error) => {
                    // Handle errors                    
                    console.log ( "deviceconnect : " + error  );
                    this.setState({ erro: true, loading: false, idDevice: device });
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
                    console.log(`Characteristic UUID: ${char.uuid}, Service UUID: ${char.serviceUUID}`);
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

            /*
            const result = await manager.readCharacteristicForDevice(
                device,
                service,
                characteristic
            )
*/


            var S1 = "00001800-0000-1000-8000-00805f9b34fb";    
            var C1 = "00002a00-0000-1000-8000-00805f9b34fb";
            var C2 = "00002a01-0000-1000-8000-00805f9b34fb";
            var C3 = "00002a04-0000-1000-8000-00805f9b34fb";
            var C4 = "00002a05-0000-1000-8000-00805f9b34fb";

            var HEART_RATE = "00001812-0000-1000-8000-00805f9b34fb";
            var HEART_RATE_MEASUREMENT = "00002a37-0000-1000-8000-00805f9b34fb";
           
      
            
            const result = await manager.readCharacteristicForDevice(
                  device,
                  S1,
                  C1
            )
    

            /*      

            console.log("0000fec9-0000-1000-8000-00805f9b34fb base64: " + base64.decode(result.value));
            console.log("0000fec9-0000-1000-8000-00805f9b34fb: " + result.value);

            const result1 = await manager.readCharacteristicForDevice(
                device,
                "0000fee7-0000-1000-8000-00805f9b34fb",
                "0000fea1-0000-1000-8000-00805f9b34fb"
            )

            console.log("0000fea1-0000-1000-8000-00805f9b34fb base64: " + base64.decode(result1.value));
            console.log("0000fea1-0000-1000-8000-00805f9b34fb: " + result1.value);

            const result2 = await manager.readCharacteristicForDevice(
                device,
                "0000fee7-0000-1000-8000-00805f9b34fb",
                "0000fea2-0000-1000-8000-00805f9b34fb"
            )

            console.log("0000fea2-0000-1000-8000-00805f9b34fb base64: " + base64.decode(result2.value));
            console.log("0000fea2-0000-1000-8000-00805f9b34fb: " + result2.value);
    
            */    


            

             // PEGA TODOS OS SERVIÇOS
               // const resultX = await manager.servicesForDevice(device);
               // console.log (resultX) ;
            
               //const resultCH = await manager.discoverAllServicesAndCharacteristicsForDevice(device);            
              // console.log (" resultCH : " + resultCH ) ;

            //  console.log("value: " + base64.decode(result.value));

          

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


    subscribeToDevice({ deviceID }) {

        console.log (" ENTROU no subscribeToDevice "); 
        
        const SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
        const CHARACTERISTIC_UUID = "00002a37-0000-1000-8000-00805f9b34fb";
        const CHARACTERISTIC_TRANSACTION_ID = "HEART MONITOR";

        manager.monitorCharacteristicForDevice(            
          deviceID,
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          (error, characteristic) => {
            if (error) {
              console.error("Error at receiving data from device", error);
              return;
            } else {

              console.log (" Passou pelo ERRO no subscribeToDevice ");
              const response = Buffer.from(characteristic.value, "base64");
              const isLastChunk = response[response.length - 1] === 0;
    
              const clearResponse = response.slice(3);
    
              if (isLastChunk) {
                this.setState({ pendingDataReceive: this.state.pendingDataReceive + clearResponse.slice(0, clearResponse.length - 1).toString("utf8")});
                let readyJSON;
                try {
                  readyJSON = JSON.parse(this.state.pendingDataReceive);
                  console.log (" JSON no subscribeToDevice " + readyJSON);
                } catch (e) {
                  console.log("ERROR WHILE PARSING JSON", this.state.pendingDataReceive);
                }
                this.setState({ pendingDataReceive: "" });
              } else {
                this.setState({ pendingDataReceive: this.state.pendingDataReceive + clearResponse.toString("utf8") });
                //this.state.pendingDataReceive = this.state.pendingDataReceive + clearResponse.toString("utf8");
                console.log (" clearResponse no subscribeToDevice " + this.state.pendingDataReceive );
              }
            }
          },
          CHARACTERISTIC_TRANSACTION_ID
        );
      }





 

    retrieveConnected2(){
        BleManagerX.getConnectedPeripherals([]).then((results) => {
          if (results.length == 0) {
            console.log('No connected peripherals')
          }
          console.log(results);
          var peripherals = this.state.peripherals;
          for (var i = 0; i < results.length; i++) {
            var peripheral = results[i];
            peripheral.connected = false;
            peripherals.set(peripheral.id, peripheral);
            this.setState({ peripherals });
            manager.cancelDeviceConnection(peripheral.id);
          }
        });
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

                
                <View style={{ margin: 10 }}>
                    <Button title="Recuperar periféricos conectados" onPress={() => this.retrieveConnected2()} />
                </View>
                


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