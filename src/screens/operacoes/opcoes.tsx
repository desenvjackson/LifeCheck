import React, { PureComponent, Fragment, } from 'react';
import { Switch, View, TouchableOpacity, ScrollView, Text, StatusBar, AsyncStorage, Button } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

//import Styles, { Variables } from '../../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default class OpcoesScreen extends PureComponent {

    state = {
        mostraCadastro: false,
        switchValue: false,
        switchValue1: false,
        switchValue2: false,
        date: '',
        isDatePickerVisible: false,
        valorInicioMonitoramento: '',
    };

    componentDidMount = async () => {

        var loginAuto = await AsyncStorage.getItem("loginAuto")
        if (loginAuto == 'false') {
            this.setState({
                switchValue: true
            })
        } else {
            this.setState({
                switchValue: false
            })
        }



        var emp = await AsyncStorage.getItem("empcod")
        var idgestor = await AsyncStorage.getItem("idGestor")
        console.log(emp + ' <- emp  /gestor ->' + idgestor)

        if (emp > '1' && idgestor > '0') {

            this.setState({
                mostraCadastro: true
            })
        }

    }
    telaCadastroOperario = async () => {
        console.log("EditaPerfil");
        // this.props.navigation.navigate("cadastroOperador")

    }

    telaPerfil = async () => {
        console.log("EditaPerfil");
        // this.props.navigation.navigate("Perfil")

    }
    telaLogin = async () => {
        this.props.navigation.navigate("Login")

    }
    telaAlerta = async () => {
        //this.props.navigation.navigate("Alerta")
        console.log("Alerta");
    }
    telaPesquisa = async () => {
        this.props.navigation.navigate("PesquisaMonitoramento")
    }
    telaAtraso = async () => {
        this.props.navigation.navigate("Monitoramento pedentes")
    }
    toggleSwitch = async (value) => {
        this.setState({ switchValue: value })
        await AsyncStorage.setItem("loginAuto", this.state.switchValue.toString());
    }
    toggleSwitch1 = async (value) => {
        this.setState({ switchValue1: value })
    }
    toggleSwitch2 = async (value) => {
        this.setState({ switchValue2: value })
    }
    ativaTime = async () => {
        this.setState({ isDatePickerVisible: true })
    }
    ativaTimeSalvaValor = async (time) => {
        this.setState({ valorInicioMonitoramento: time.time })
        this.hideDatePicker();
    }
    hideDatePicker = async () => {
        this.setState({ isDatePickerVisible: false })
    };

    render() {

        return (
            <ScrollView style={{ paddingTop: 20 }}>
                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor={"gray"}
                />

                <View style={loginStyles.touchableOpacityCard}>
                    <View style={{ paddingRight: 8 }}>
                        <FontAwesome5 name="file-medical-alt" size={20} color="red"></FontAwesome5>
                    </View>
                    <Text>{this.state.switchValue ? 'Verificação automática - Ativado ' : 'Verificação automática - Desativado'}</Text>
                    <Switch
                        style={{ paddingBottom: 20 }}
                        onValueChange={this.toggleSwitch}
                        value={this.state.switchValue} />
                </View>


                <TouchableOpacity onPress={this.ativaTime} style={loginStyles.touchableOpacityCard}>
                    <View style={{ paddingRight: 8 }}>
                        <FontAwesome5 name="calendar" size={20} color="black"></FontAwesome5>
                    </View>
                    <View>
                        <DateTimePickerModal
                            isVisible={this.state.isDatePickerVisible}
                            mode="time"
                            onConfirm={this.ativaTimeSalvaValor}
                            onCancel={this.hideDatePicker}
                            locale="en_GB" // Use "en_GB" here
                            date={new Date()}
                        />
                    </View>
                    <Text>Monitoramento: Inicio as 08hs Fim as 22hs. </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.telaAlerta} style={loginStyles.touchableOpacityCard}>
                    <View style={{ paddingRight: 8 }}>
                        <FontAwesome5 name="clock" size={20} color="black"></FontAwesome5>
                    </View>
                    <Text>Tempo de verificação: A cada 3 horas.</Text>
                </TouchableOpacity>

                <View style={loginStyles.touchableOpacityCard}>
                    <View style={{ paddingRight: 8 }}>
                        <FontAwesome5 name="bell" size={20} color="red"></FontAwesome5>
                    </View>
                    <Text>{this.state.switchValue2 ? 'Avisos automático - Ativado ' : 'Avisos automático- Desativado'}</Text>
                    <Switch
                        style={{ paddingBottom: 20 }}
                        onValueChange={this.toggleSwitch2}
                        value={this.state.switchValue2} />
                </View>

                <View style={{ marginTop: 13 , borderTopWidth: 0.5, borderTopColor: "gray" }}>

                    <View style={loginStyles.touchableOpacityCard}>
                        <View style={{ paddingRight: 8 }}>
                            <FontAwesome5 name="sync" size={20} color="black"></FontAwesome5>
                        </View>

                        <Text>{this.state.switchValue1 ? 'Login automático - Ativado' : 'Login automático - Desativado'}</Text>
                        <Switch
                            style={{ paddingLeft: 15 }}
                            onValueChange={this.toggleSwitch1}
                            value={this.state.switchValue1} />
                    </View>

                    <TouchableOpacity

                        onPress={this.telaLogin} style={loginStyles.touchableOpacityCard}>

                        <View style={{ paddingRight: 8 }}>
                            <FontAwesome5 name="sign-out-alt" size={20} color="black"></FontAwesome5>
                        </View>

                        <Text>Desconectar</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this.telaPerfil}
                        style={loginStyles.touchableOpacityCard}
                    >
                        <View style={{ paddingRight: 8 }}>
                            <FontAwesome5 name="user-edit" size={20} color="black"></FontAwesome5>
                        </View>
                        <Text>Editar  Perfil</Text>

                    </TouchableOpacity>

                </View>

            </ScrollView>

        );
    }
}

export const loginStyles = {

    touchableOpacityCard: {
        height: 49,
        flex: 1,
        alignItems: "center",
        flexDirection: 'row',
        marginTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: "gray",
        borderBottomWidth: 2,
        borderBottomColor: "gray",
        marginBottom: 4

    }
}

