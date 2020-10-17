import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,TouchableOpacity,ScrollView,FlatList
  } from 'react-native';
import {
    BleManager,
    BleError,
    Device,
    LogLevel,
    Characteristic,
} from 'react-native-ble-plx';
import { Avatar, Card, IconButton, Title, Paragraph, ProgressBar, Colors } from 'react-native-paper';




import TeamItem from '../operacoes/TeamItem';


const manager = new BleManager();

const countries = [
    { key: 'Alemanha' },
    { key: 'Arábia Saudita' }
];



class ModalDispositivos extends Component {

    constructor() {
        super();
        this.manager = new BleManager()
        this.manager.setLogLevel(LogLevel.Verbose)
        this.state = { info: "", values: {} }
        this.deviceDados = "",
            this.dados = new Map(),
            this.peripherals = new Map()
    }

    componentDidMount = async () => {
        this.scanAndConnect()
    }

    scanAndConnect = async () => {

        await this.setState({
            loading: true, scanning: true, dadosservicesMAP: new Map(), erro: false, dadosservices: [],
            dados: [], peripherals: new Map(),
            conectando: "Conectando ao seu INSTANT CHECK... ", corIconBluetooth: 'navy',
            modal: true,
            dados: new Map(),
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

                this.setState({ dadosservices: Array.from(this.state.peripherals.values()) })
                let lista = this.state.dadosservices.filter((index) => index.name != 'SEM NOME');
                this.setState({ dados: lista });

                setTimeout(() => {
                    manager.stopDeviceScan();
                    this.setState({ loading: false, scanning: false });
                }, 5000);

            });
        } catch (err) {
            console.log("scanAndConnect" + err);
        }
    }



    render() {
        return (
            <>
                <View>
                    <Card>
                        <Card.Content>
                            <Title>MODAL _ Dispositivos</Title>
                            <Paragraph>Conecte-se ao seu Instant Check</Paragraph>
                        </Card.Content>
                    </Card>
                </View>
             

                <FlatList
                    data={this.state.dados}
                    numColumns={1}
                    renderItem={({ item }) => <TeamItem item={item} />}
                />

            </>
        );
    }
}

export default ModalDispositivos;