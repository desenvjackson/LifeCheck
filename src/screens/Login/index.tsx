
import React from 'react';
import { View, ViewStyle, Alert, Image, TextInput, ActivityIndicator, TouchableOpacity, Text, ScrollView, StatusBar } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Styles, { Variables } from '../../styles';
import { Button } from '../../components/Button';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services';
import { UsuarioModel } from '../../models';

import Screen from '../Screen';
const leftOculto = '210%';
const left = '130%';
const botao = '38%';

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
    loading: any;
    usuario: string;
    senha: string;
    error: string;
    login: string;
    mSenha: boolean;
}




// Tela em que o login é realizado.
// A tela exibe os campos de usuário e senha, e o retono
// é um token que será armazenado em memória local no aparelho
// para que todas as outras telas subsequentes utilizem o esquema de segurança.
//
// Para mais informações, seguem links sobre o JWT:
//
// https://jwt.io/
// https://medium.com/tableless/entendendo-tokens-jwt-json-web-token-413c6d1397f6
// https://www.devmedia.com.br/como-o-jwt-funciona/40265
export default class LoginScreen extends React.Component<Props, State> {

    private inputs = [];

    static navigationOptions = {
        headerShown: false
    }

    constructor(props: Props) {
        super(props);

        // Cria o state do componente
        this.state = {
            loading: true,
            usuario: "",
            senha: "",
            error: '',
            login: "",
            mSenha: true,
        }
    }

    focusNextField = (id: string) => {
        this.inputs[id].focus();
    };

    login = async () => {

        // this.props.navigation.navigate("Scan");         

        if (this.state.usuario.trim() === "") {
            Alert.alert("Alerta!", "Campo vazio não permitido! ");
            this.focusNextField('usuario');
        }
        else if (this.state.senha.trim() === "") {
            Alert.alert("Alerta!", "Campo vazio não permitido! ");
            this.focusNextField('senha');
        }

        else {
            this.setState({ loading: false })

            try {

                // Monta o objeto UsuarioModel para enviar para a API
                var usuario = new UsuarioModel();
                usuario.email = this.state.usuario;
                usuario.password = this.state.senha;

                // Executa o método "login" na controller "usuario" na API
                var { data: token } = await api.post("login/acesso", "dados=" + JSON.stringify(usuario));

                console.log ( JSON.stringify(token["dados"][0]["nome"]) )

                //Passando o status da consulta, em caso de SUCESSO ou ERRO
                if (token["status"] === 'sucesso') {

                    // Atribundo valor de retorno da consulta JSON para uma GLOBAL
                     await AsyncStorage.setItem("email", JSON.stringify(token["dados"][0]["email"]));
                     await AsyncStorage.setItem("nome", JSON.stringify(token["dados"][0]["nome"]));
                     await AsyncStorage.setItem("id_firm", JSON.stringify(token["dados"][0]["id_firm"]));
                     await AsyncStorage.setItem("id_patient", JSON.stringify(token["dados"][0]["id_patient"]));

                    this.props.navigation.navigate("Scan");

                } else {
                    Alert.alert('Acesso', 'Dados incorretos !')
                }

                // Desabilitando o loading
                this.setState({ loading: true })

            } catch (err) {
                if (err.response)
                    Alert.alert(err.response.data);
                else
                    alert(err);
            }
            //resetando os campos caso o usuario volte para tela login.
            this.setState({
                senha: '',
                usuario: '',
                mSenha: true
            })
        }
        
    }

    novoUsuario = async () => {
        this.props.navigation.navigate("novoUsuario");
    }

    novaSenha = async () => {
        this.props.navigation.navigate("recuperaSenha");
    }

    mSenha = async () => {
        this.setState({ mSenha: false });
    }

    vSenha = async () => {
        this.setState({ mSenha: true })
    }

    componentDidMount = async () =>{
    }

    render() {
        return (
            <Screen
                {...this.props}
                style={{
                    backgroundColor: Variables.colors.primary,
                    paddingLeft: 20,
                    paddingRight: 20,
                    flex:1
                }}
            >

                <ScrollView>
                    <View style={loginStyles.header}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={loginStyles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={{

                        paddingLeft: 14,
                        borderWidth: 3,
                        borderColor: Variables.colors.gray,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10
                    }}>

                        <FontAwesome5 name={"envelope"} size={20} color={Variables.colors.black} />
                        <TextInput
                            style={[

                                {
                                    paddingLeft: 14,
                                    opacity: 0.7,
                                    color: Variables.colors.black,
                                    flex: 1,
                                }
                            ]}
                            placeholderTextColor={Variables.colors.black}
                            returnKeyType="next" blurOnSubmit={false}
                            placeholder="Usuário"
                            autoCapitalize='none'
                            value={this.state.usuario}
                            onSubmitEditing={() => { this.focusNextField('senha'); }}
                            onChangeText={value => this.setState({ usuario: value })}
                            ref={input => { this.inputs['usuario'] = input; }}
                            keyboardType={'email-address'}
                            maxLength={80} />
                    </View>

                    <View style={{

                        paddingLeft: 14,
                        borderWidth: 3,
                        borderColor: Variables.colors.gray,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10
                    }}>

                        <FontAwesome5 name={"key"} size={20} color={Variables.colors.black} />
                        <View style={{
                            flexDirection: 'row',
                            flex: 1
                        }} >
                            <TextInput
                                style={[

                                    {
                                        paddingLeft: 14,
                                        opacity: 0.7,
                                        color: Variables.colors.black,
                                        flex: 1,
                                    }
                                ]}
                                placeholderTextColor={Variables.colors.black}
                                returnKeyType="done"
                                placeholder="Senha"
                                autoCapitalize='none'
                                value={this.state.senha}
                                onChangeText={value => this.setState({ senha: value })}
                                ref={input => { this.inputs['senha'] = input; }}
                                maxLength={15}
                                secureTextEntry={this.state.mSenha}
                                keyboardType='default'
                            />

                            {this.state.senha.length > 0 &&
                                <View>
                                    {this.state.mSenha &&
                                        <View style={{ width: 50, height: 50, bottom: 1 }}  >
                                            <TouchableOpacity onPress={this.mSenha}
                                                style={{ position: 'absolute', alignItems: 'flex-end', bottom: 10, left: 10, right: 10 }}
                                            >
                                                <FontAwesome5
                                                    name={"eye-slash"} size={20} color={Variables.colors.black} />
                                            </TouchableOpacity>
                                        </View>
                                    }

                                    {!this.state.mSenha &&
                                        <View style={{ width: 50, height: 50, bottom: 1, }}>
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
                        </View>
                    </View>


                    <View style={{ alignItems: 'center' }}  >

                        {this.state.loading &&
                            <TouchableOpacity
                                onPress={this.login}
                                style={{ alignItems: 'center', marginTop: 50, marginBottom: 20, width: 80 }}    >
                                <FontAwesome5 name="power-off" size={50} color={Variables.colors.black}></FontAwesome5>
                                <Text style={{ fontSize: 12 }} >Conecte-se </Text>
                            </TouchableOpacity>
                        }
                    </View>


                    {!this.state.loading &&
                        <ActivityIndicator size={"large"} color={Variables.colors.black} style={{ marginTop: 20, marginBottom: 20 }} />
                    }
                    
                    <StatusBar
                        animated={true}
                        translucent={true}
                        barStyle={'light-content'}
                        backgroundColor={Variables.colors.grayDark}
                    />
                </ScrollView>

            </Screen>

        );
    }
}

export const loginStyles = {
    label: {
        color: "#FFF"
    },
    content: {
        padding: 20,
        paddingBottom: 10
    },
    header: {
        alignItems: "center",
        marginBottom: 100,
        marginTop: 20

    } as ViewStyle,
    logo: {
        width: 250,
    }
}

