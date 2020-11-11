import React from 'react';
import { View, ViewStyle, Alert, Image, TextInput, ActivityIndicator, AsyncStorage, TouchableOpacity, Text, StatusBar } from 'react-native';
import { NavigationScreenProp, StackActions, NavigationActions } from 'react-navigation';
import TextInputMask from 'react-native-text-input-mask';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Styles, { Variables } from '../../styles';
//import Screen from '../Screen';
//import * as EmailValidator from 'email-validator';
//import cep from 'cep-promise'
//import { Grid, Row, Col } from 'react-native-easy-grid';

//const leftOculto = '10%';
//const left = '10%';

//const { cpf } = require('cpf-cnpj-validator');
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: "Login" })],
});
interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    retornocep: any;
    senha: string;
    email: string;
    error: string;
    cpf: any;
    cep: string;
    mSenha: any;
    Vcpf: any;
    Vemail: any;
    enderecoCompleto: any;
    mudaicon: any;
    icon: any;
    mudacep: any;
    mostraEnd: any;
    retornoapi: any;
}
export default class novoUsuarioScreen extends React.Component<Props, State> {

    private inputs = [];

    static navigationOptions = {
        title: "Cadastro de Usuário "
    }

    constructor(props: Props) {
        super(props);

        // Cria o state do componente
        this.state = {
            retornocep: true,
            senha: "",
            error: '',
            email: "",
            cpf: "",
            cep: "",
            mSenha: true,
            Vcpf: false,
            Vemail: false,
            enderecoCompleto: "",
            mudaicon: true,
            icon: true,
            mudacep: true,
            mostraEnd: false,
            retornoapi: ""
        }
    }

    focusNextField = (id: string) => {
        this.inputs[id].focus();
    };

    validaCpf = async () => {
        // verifica o cpf
        const resultCpf = await cpf.isValid(this.state.cpf);

        if (resultCpf === true) {

            this.mostraBotao();

        } else {
            alert('CPF inválido !')
        }

    }


    validaEmail = async () => {
        const email = await EmailValidator.validate(this.state.email);

        if (email === true) {
            this.mostraBotao();
        } else {
            alert('E-mail inválido !')
        }

    }

    validaCep = async () => {
        cep(this.state.cep).catch(alert)
        var response = await cep(this.state.cep).then();

        this.setState({
            retornocep: await response
        })

        // alert ( JSON.stringify ( this.state.retornocep ))

        if (this.state.retornocep["cep"].toString().length > 7) {

            var returncep = this.state.retornocep["cep"].toString()
            var returnstate = this.state.retornocep["state"].toString()
            var returncity = this.state.retornocep["city"].toString()
            var returnneighborhood = this.state.retornocep["neighborhood"].toString()
            var returnstreet = this.state.retornocep["street"].toString()

            var enderecoCompleto = returnstreet + ", " + returnneighborhood + ", " + returncity + ", " + returnstate + ", " + returncep

            //alert(enderecoCompleto);
            this.setState({
                enderecoCompleto: enderecoCompleto,

            })
            this.mostraBotao();
        } else {
            alert("CEP não localizado!")
        }

    }

    validaSenha = async () => {
        var lenghtsenha = this.state.senha.length;

        if (this.state.senha.trim() === "" || lenghtsenha < 5) {
            Alert.alert("Alerta!", "Campo senha invalido ");
            //    this.focusNextField('senha');
        }
        else {
            this.mostraBotao();
        }

    }

    mostraBotao = async () => {

        if (this.state.cep.length > 8 && this.state.cpf.length > 13 && this.state.senha.length > 4 && this.state.email.length > 4) {
            this.setState({
                mudaicon: false,
                mudacep: false,
                mostraEnd: true
            })

        } else {
            return
        }

    }

    POST = async () => {
        await this.setState({ icon: false })
        // await this.validacoes();
        // Limpando variaveis (preciocismo para evitar duplicadas...)
        var Senha = '';
        var Email = '';
        var cpf = '';
        var enderecocompleto = '';

        try {

            Senha = await this.state.senha.toString()
            Email = await this.state.email.toString()
            cpf = await this.state.cpf.trim()
            enderecocompleto = await this.state.enderecoCompleto.toString()

            Email = await Email.trim()
            Email = Email.toLowerCase()
            Senha = await Senha.trim()
            Senha = Senha.toLowerCase()

            await fetch('http://renovy.myscriptcase.com/scriptcase9/app/apiws/ws_inserirnovousuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',

                },
                body: "login=" + Email + "&pswd=" + Senha + "&documento=" + cpf + "&enderecocompleto=" + enderecocompleto,


            }).then((response) => response.json())
                .then((responseJson) => {
                    var retorno = (JSON.stringify(responseJson))
                    this.setState({
                        retornoapi: retorno
                    })
                });

        } catch (err) {
            //alert(this.state.erro)
            alert(err);
            this.setState({ error: "POST:  " + err })
        }
        await this.setState({
            icon: true,
            mudaicon: true,
            mudacep: true,
            mostraEnd: false
        })
    }

    salvarDados = async () => {

        try {
            //###  CHAMA FUNCAO PARA SALVAR DADOS  
            await this.POST()

            // Retorno final - 
            var resultadoError = this.state.retornoapi
            if (resultadoError === "1") {

                Alert.alert(
                    'Cadastro  do usuario, inserido com sucesso ! ',
                    ' Acesse seu email para ativar sua conta !',
                    [
                        //{ text: 'Novo cadastro ?', onPress: () => this.props.navigation.navigate("Tipodeoperacao") },
                        {
                            text: 'Tela HOME',
                            onPress: () => this.props.navigation.dispatch(resetAction),
                            style: 'cancel',

                        },
                        //{text: 'OK', onPress: () => console.log('OK Pressed')},
                    ],
                    { cancelable: false },
                );
                this.zerarState();
            } else if (resultadoError === "2") {
                alert("Dados obrigatorios inválidos !")
            }
            else if (resultadoError === "3") {
                alert("Email ja cadastrado, Por  favor  utilize  outro !")
            }


        } catch (err) {
            console.warn(err);
            alert(err);
        }

    }

    zerarState = async () => {
        this.setState({
            email: '',
            senha: '',
            cpf: '',
            cep: '',
            enderecoCompleto: ''
        })
    }

    mSenha = async () => {
        this.setState({ mSenha: false });
    }
    vSenha = async () => {
        this.setState({ mSenha: true })
    }

    render() {
        return (
            <View
                {...this.props}
                style={{
                    backgroundColor: Variables.colors.primary,
                    padding: 20
                }}
            >
                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor={Variables.colors.grayDark}
                />

                <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                
                    <Text style={loginStyles.text} > <FontAwesome5 name={"envelope"} size={15} color={Variables.colors.black} /> E-mail:</Text>
                    <TextInput
                        style={loginStyles.textInput}
                        placeholderTextColor={Variables.colors.black}

                        returnKeyType="next" blurOnSubmit={false}
                        placeholder=""
                        autoCapitalize='none'
                        value={this.state.email}
                        onSubmitEditing={() => { this.focusNextField('senha'); }}
                        onChangeText={value => this.setState({ email: value })}
                        ref={input => { this.inputs['email'] = input; }}
                        keyboardType={'email-address'}
                        onBlur={() => this.validaEmail()}
                        maxLength={100}


                    />
                </View>

                
                    <Text style={loginStyles.text} > <FontAwesome5 name={"key"} size={15} color={Variables.colors.black} /> Senha:</Text>
                    
                    <TextInput
                        style={loginStyles.textInput}
                        placeholderTextColor={Variables.colors.black}

                        returnKeyType="next" blurOnSubmit={false}
                        placeholder=""
                        autoCapitalize='none'
                        value={this.state.senha}
                        onSubmitEditing={() => { this.focusNextField('senha'); }} onChangeText={value => this.setState({ senha: value })}
                        ref={input => { this.inputs['senha'] = input; }}
                        maxLength={8}
                        secureTextEntry={this.state.mSenha} />
                        {this.state.senha.length > 0 &&
                        <View>
                            {this.state.mSenha &&
                                <View style={{ width: 50, height: 50, bottom: 55, right: -260 , borderColor: '', borderWidth: 0, flex: 1 }}>
                                    <TouchableOpacity onPress={this.mSenha}
                                        style={{ position: 'absolute', alignItems: 'flex-end', bottom: 10, left: 10, right: 10 }}
                                    >
                                        <FontAwesome5
                                            name={"eye-slash"} size={20} color={Variables.colors.black} />
                                    </TouchableOpacity>
                                </View>
                            }

                            {!this.state.mSenha &&
                                <View style={{ width: 50, height: 50, bottom: 55, right: -270 , borderColor: '', borderWidth: 0, flex: 1 }}>
                                    <TouchableOpacity onPress={this.vSenha}
                                        style={{ position: 'absolute', alignItems: 'flex-end', bottom: 10, left: 10, right: 10 }}
                                    >
                                        <FontAwesome5
                                            name={"eye"} size={20} color={Variables.colors.black} />
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        }

                <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                    <Text style={loginStyles.text} > <FontAwesome5 name={"address-card"} size={15} color={Variables.colors.black} />  CPF:</Text>
                    <TextInputMask
                        style={loginStyles.textInput}
                        placeholderTextColor={Variables.colors.black}

                        returnKeyType="next" blurOnSubmit={false}
                        placeholder=""
                        autoCapitalize='none'
                        value={this.state.cpf}
                        onSubmitEditing={() => { this.focusNextField('cep'); }}
                        onChangeText={value => this.setState({ cpf: value })}
                        //ref={input => { this.inputs['CPF'] = input; }}
                        refInput={ref => { this.inputs['CPF'] = ref }}
                        mask={"[000].[000].[000]-[00]"}
                        keyboardType={'numeric'}
                        maxLength={14}
                        onBlur={() => this.validaCpf()}
                    />

                </View>
                <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                    <Text style={loginStyles.text} > <FontAwesome5 name={"mail-bulk"} size={15} color={Variables.colors.black} /> CEP:</Text>
                    <TextInputMask
                        style={loginStyles.textInput}
                        placeholderTextColor={Variables.colors.black}
                        returnKeyType="done"
                        placeholder=""
                        autoCapitalize='none'
                        value={this.state.cep}
                        //ref={input => { this.inputs['cep'] = input; }}
                        refInput={ref => { this.inputs['cep'] = ref }}
                        onChangeText={value => this.setState({ cep: value })}
                        mask={"[00000]-[000]"}
                        keyboardType={'numeric'}
                        maxLength={9}
                        onBlur={() => this.validaCep()}
                    />
                </View>

                {this.state.icon &&
                    <View>
                        {this.state.mudaicon &&
                            <View>
                                <TouchableOpacity
                                    disabled={true}
                                    style={{ alignItems: 'center', marginTop: 50, opacity: 0.9 }}    >
                                    <FontAwesome5 name="user-plus" size={50} color={Variables.colors.gray}></FontAwesome5>
                                    <Text style={{ fontSize: 12, opacity: 0.9, color: '#f1f1f1' }} >Finalizar Cadastro </Text>
                                </TouchableOpacity>
                            </View>
                        }

                        {!this.state.mudaicon &&

                            <View>
                                <TouchableOpacity
                                    onPress={this.salvarDados}
                                    style={{ alignItems: 'center', marginTop: 50 }}    >
                                    <FontAwesome5 name="user-plus" size={50} color={Variables.colors.black}></FontAwesome5>
                                    <Text style={{ fontSize: 12 }} >Finalizar Cadastro </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                }
                {!this.state.icon &&
                    <ActivityIndicator size={"large"} color={Variables.colors.black} style={{ marginTop: 40 }} />
                }
                
            </View>

        );
    }
}

export const loginStyles = {

    textInput: {
        borderBottomWidth: 4,
        borderBottomColor: Variables.colors.gray,
        opacity: 0.6,
        color: Variables.colors.black,
        fontSize: 17
    },
    text: {
        opacity: 0.5
    }
}