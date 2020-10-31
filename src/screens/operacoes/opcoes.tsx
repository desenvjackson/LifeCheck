import React, { PureComponent, Fragment, } from 'react';
import { Switch, View, TouchableOpacity, ScrollView, Text, StatusBar, AsyncStorage, Button, Dimensions, StyleSheet, SectionList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

//import Styles, { Variables } from '../../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const window = Dimensions.get('window');

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
            <>

                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor={"gray"}
                />

                <View
                    style={{
                        paddingTop: 1,
                        backgroundColor: "white"
                    }}

                >


                    <SectionList
                        sections={[
                            { title: '', data: [] }
                        ]}
                        renderItem={({ item }) =>
                            <Text style={styles.sectionHeader}></Text>
                        }
                        renderSectionHeader={({ section }) =>
                            <Text style={styles.sectionHeader}></Text>
                        }
                        keyExtractor={(item, index) => index}
                    />



                    <Text style={styles.sectionHeader}>GERENCIAR</Text>
                    
                    <View  style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>
                    <Text style={styles.item} > 
                             <FontAwesome5 style={styles.item} name="file-medical-alt" size={20} color="red"> </FontAwesome5>
                             {this.state.switchValue ? 'Verificação automática - Ativado ' : 'Verificação automática - Desativado'}
                    </Text>        
                        <Switch
                            style={{ paddingLeft: 10 }}
                            onValueChange={this.toggleSwitch1}
                            value={this.state.switchValue1} />                           
                    </View>


                    <View  style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>      
                    <TouchableOpacity onPress={this.ativaTime}>                               
                                <DateTimePickerModal
                                    isVisible={this.state.isDatePickerVisible}
                                    mode="time"
                                    onConfirm={this.ativaTimeSalvaValor}
                                    onCancel={this.hideDatePicker}
                                    locale="en_GB" // Use "en_GB" here
                                    date={new Date()}
                                />
                            <Text style={styles.item} > 
                                <FontAwesome5 style={styles.item} name="calendar" size={20} color="black">  Monitoramento: Inicio: 08hs Fim: 22hs. 
                                </FontAwesome5> 
                                </Text>
                        </TouchableOpacity>
                    </View>


                    <View style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>   
                    <TouchableOpacity onPress={this.telaAlerta}>                            
                            <Text style={styles.item} >
                                <FontAwesome5 style={styles.item}  name="clock" size={20} color="black"> Tempo de verificação: A cada 3 horas.
                                </FontAwesome5> 
                                </Text>
                        </TouchableOpacity>
                    </View>    


                    <View  style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>                               
                            <Text style={styles.item} > 
                                <FontAwesome5 name="bell" size={20} color="red"></FontAwesome5>
                                {this.state.switchValue2 ? ' Avisos automático - Ativado ' : ' Avisos automático- Desativado'}</Text>
                            <Switch
                                style={{ paddingLeft: 33}}
                                onValueChange={this.toggleSwitch2}
                                value={this.state.switchValue2} />
                    </View>   


                    <Text style={styles.sectionHeader}>SEU APP</Text>

                    <View  style={{ flexDirection: "row", paddingLeft: 15, margin: 1}}>   
                    <TouchableOpacity
                                onPress={this.telaPerfil}
                                style={styles.item}
                            >                              
                               <Text style={styles.item}>
                                   <FontAwesome5 name="user-edit" size={20} color="black"></FontAwesome5> Editar  Perfil</Text>
                            </TouchableOpacity>
                    </View>   

 

                </View>
            </>
        );
    }
}
 

export const styles = StyleSheet.create({
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
        fontSize: 14,
        margin: 15,
    },
 
});