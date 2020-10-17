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
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
    ScrollView,
    Image,
    SectionList
} from 'react-native';

import { Avatar, Card, IconButton, Title, Paragraph, ProgressBar, Button, TextInput, Switch } from 'react-native-paper';


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
    connected: boolean;
    modalPerfil: boolean,
    modalSaude: boolean,
    email: any, nome: any, idade: any, peso: any, altura: any,
    outros: any,
    switchValueCardiaco: boolean, switchValuePressao: boolean, switchValueDiabete: boolean,
    switchValue1: boolean
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

    private inputs = []

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
        this.setState({ conectando: "Conectando...", corIconBluetooth: 'navy' });
        console.log("Connecting to device :")

        // Verifica se o dipositivo tá conectado
        let isConnected = await device.isConnected()
        manager.stopDeviceScan();


        try {
            if (!isConnected) {
                device = await manager.connectToDevice(device.id)
                this.setState({ deviceDados: device })
                setTimeout(() => {
                    this.setState({ conectando: "Conectado! Bem vindo.", corIconBluetooth: 'green' , connected: true });
                }, 1000);

            } else {
                this.setState({ conectando: "Desconectado", corIconBluetooth: 'gray' });
            }
        } catch (err) {
            // some error handling
            console.log("deviceconnect" + err);
            this.setState({ conectando: "Desconectado", corIconBluetooth: 'gray' });
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

                let codFinalizado = Geralbuff[0]
                let codSucesso = Geralbuff[1]

                let hrv = Geralbuff[2]
                let frequenciaCardiaca = Geralbuff[4]
                let estresse = Geralbuff[5]
                let hiperTensao = Geralbuff[6]
                let hipoTensao = Geralbuff[7]
                let humor = Geralbuff[8]
                let frequenciaRespiratoria = Geralbuff[9]

                console.log(' codFinalizado: ', codFinalizado + " hrv " + hrv)
                console.log(' codSucesso: ', codSucesso + " hiperTensao " + hiperTensao)

                await AsyncStorage.setItem("notificando", "1")

                if (codFinalizado === 156 && codSucesso === 3) {

                    await AsyncStorage.setItem("hrv", hrv.toString())
                    await AsyncStorage.setItem("frequenciaCardiaca", frequenciaCardiaca.toString())
                    await AsyncStorage.setItem("estresse", estresse.toString())
                    await AsyncStorage.setItem("hiperTensao", hiperTensao.toString())
                    await AsyncStorage.setItem("hipoTensao", hipoTensao.toString())
                    await AsyncStorage.setItem("humor", humor.toString())
                    await AsyncStorage.setItem("frequenciaRespiratoria", frequenciaRespiratoria.toString())
                    await AsyncStorage.setItem("notificando", "0")

                }

            }
        } catch (err) {
            console.log(JSON.stringify(err))
        }
    };


    desconectar = async (device: any) => {
        if (device) {
            await manager.cancelDeviceConnection(device.id);
            console.log("Desconectando ... ");
            this.setState({ conectando: "Desconectado.", corIconBluetooth: 'gray', connected: false  });
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

        if (msg.item === "Nova medição") {
            this.novaMedicao(this.state.deviceDados)
        }

        console.log(msg.item);
    }

    fechaModal = async () => {
        await this.setState({
            modal: false, modalPerfil: false, modalSaude: false
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

    novaMedicao = async (device) => {

        if (device) {
            const services = await device.services();

            let UART_SERVICE = "0000fff0-0000-1000-8000-00805f9b34fb"  // UART Service
            let TX_CHARACT = "0000fff7-0000-1000-8000-00805f9b34fb" // TX Characteristic (Property = Notify) 
            let RX_CHARACT = "0000fff6-0000-1000-8000-00805f9b34fb" // RX Characteristic (Property = Write without response e READ )

            try {
                let charX = await manager.monitorCharacteristicForDevice(device.id,
                    UART_SERVICE, TX_CHARACT, this.onUARTSubscriptionUpdate
                );
            } catch (err) {
                console.log(JSON.stringify(err))
            }

            let eu = "mQAAAAAAAAAAAAAAAAAAmQ=="
            await manager.writeCharacteristicWithResponseForDevice(device.id,
                UART_SERVICE, RX_CHARACT,
                eu
            )
                .then(characteristic => {
                    this.props.navigation.navigate("Medições")
                })
                .catch(err => {
                    console.log(" valores > " + err)
                })
        } else {
            Alert.alert("Instant Check:", "Sem dispositivo conectado");
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
                        backgroundColor: "white"
                    }}

                >

                    <View style={styles.cardBorderPersonal}>
                        <View style={{ height: 0 }}>
                            <Image
                                style={styles.tinyLogo}
                                source={{ uri: 'https://app-bueiro-limpo.s3-us-west-2.amazonaws.com/alas.png' }}
                            />
                        </View>
                        <View style={{ paddingLeft: 100, paddingTop: 10 }}  >
                            <Text style={styles.titleText} >Alas Jackson  </Text>
                            <TouchableOpacity onPress={() => this.scanAndConnect()} >
                                <View style={{ flexDirection: "row", paddingTop: 5 }}>

                                    {this.state.connected ?
                                        <FontAwesome5 name="bluetooth" size={15} color='green'> Conectado ! </FontAwesome5> :
                                        <FontAwesome5 name="bluetooth" size={15} color={this.state.corIconBluetooth}> </FontAwesome5>
                                    }

                                    <Text style={{ color: 'gray', fontFamily: '', fontWeight: '400', textAlign: 'right', paddingLeft: 4 }}>
                                        {this.state.connected ? '' : 'Desconectado'}
                                    </Text>

                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>



                    <SectionList
                        sections={[
                            { title: 'MEUS DADOS:', data: ['Perfil', 'Saúde e bem-estar'] },
                            { title: 'INDICADORES:', data: ['Nova medição', 'Alertas', 'Histórico'] },
                        ]}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => this.abreModal({ item })} >
                                <Text style={styles.item}><FontAwesome5 name="cog" size={12} color='gray'></FontAwesome5> {item}</Text>
                            </TouchableOpacity>
                        }
                        renderSectionHeader={({ section }) =>
                            <Text style={styles.sectionHeader}>{section.title}</Text>
                        }
                        keyExtractor={(item, index) => index}
                    />


                    <Text style={styles.sectionHeader}>GERENCIAR</Text>

                    <View style={{ flexDirection: "row", paddingLeft: 30, margin: 12 }}>
                        <FontAwesome5 name="sync" size={15} color="black"></FontAwesome5>
                        <Text style={{ paddingLeft: 9 }}>{this.state.switchValue1 ? 'Login automático - Ativado' : 'Login automático - Desativado'}</Text>
                        <Switch
                            style={{ paddingLeft: 50 }}
                            onValueChange={this.toggleSwitch1}
                            value={this.state.switchValue1} />
                    </View>

                    <TouchableOpacity
                        onPress={() => this.desconectar(this.state.deviceDados)} >
                        <View style={{ flexDirection: "row", paddingLeft: 30, margin: 12 }}>

                            <FontAwesome5 name="sign-out-alt" size={20} color="red"></FontAwesome5>
                            <Text style={{ paddingLeft: 9 }}>Desconectar dispositivo </Text>
                        </View>
                    </TouchableOpacity>




                </View>

                <View>
                    <Modal
                        isVisible={this.state.modal}
                        animationIn={"slideInLeft"}
                        onBackButtonPress={() => this.setState({ modal: false })}

                        style={styles.modal}
                    >

                        <TouchableOpacity style={{ alignItems: 'flex-end', paddingRight: 10, paddingTop: 10 }} onPress={this.fechaModal}>
                            <FontAwesome5 name='times' color='red' size={15} ></FontAwesome5>
                        </TouchableOpacity>

                        <Card>
                            <Card.Content>
                                <Title>Dispositivos</Title>
                                <Paragraph>Conecte-se ao seu Instant Check</Paragraph>
                            </Card.Content>
                        </Card>


                        <ScrollView>
                            {this.state.dados.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        key={item.name}
                                        onPress={() => this.deviceconnect(item)}
                                    >
                                        <Card.Title
                                            title={item.name}
                                            subtitle={item.connected ? 'Desconectar' : 'Conectar'}
                                            left={() => <FontAwesome5 name={"bluetooth"} size={25} color={this.state.corIconBluetooth} />}
                                        //right={() => <FontAwesome5 name={"bluetooth"} size={40} color={this.state.corIconBluetooth} /> }
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {this.state.loading &&
                            <>
                                <Text><ActivityIndicator size={"small"} color="red" style={{ marginTop: 10 }} /> Pesquisando... </Text>
                            </>
                        }

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
        color: "#87CEFA",
        //fontWeight: "bold",
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
        borderWidth: 0,
    },
    tinyLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    sectionHeader: {
        //padding: 30,
        //margin: 10,
        paddingTop: 3,
        paddingLeft: 30,
        //paddingRight: 10,
        paddingBottom: 3,
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(247,247,247,1.0)',
        textDecorationColor: 'gray',
    },
    item: {
        paddingLeft: 30,
        paddingBottom: 10,
        paddingTop: 10,
        fontSize: 15,
        height: 44,
    },
    modal: {
        backgroundColor: 'white',
        margin: 30, // This is the important style you need to set
        marginBottom: 250,
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
});

