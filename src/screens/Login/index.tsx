
import React, { PureComponent } from 'react';
import { View, ViewStyle, Alert, Image, TextInput, ActivityIndicator, TouchableOpacity, Text, ScrollView, StatusBar, Platform } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import Styles, { Variables } from '../../styles';
import { Button } from '../../components/Button';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services';
import { UsuarioModel } from '../../models';

import BackgroundFetch from "react-native-background-fetch";

import Screen from '../Screen';

const leftOculto = '210%';
const left = '130%';
const botao = '38%';

export default class LoginScreen extends PureComponent {

    private inputs = [];

    static navigationOptions = {
        headerShown: false
    }



    // Cria o state do componente
    state = {
        loading: true,
        usuario: "",
        senha: "",
        error: '',
        login: "",
        mSenha: true,
        avatar: null,
        nome: null
    }


    focusNextField = (id: string) => {
        this.inputs[id].focus();
    };
    componentDidMount = async () => {
        let avatar = await AsyncStorage.getItem("avatar")
        if (avatar != null) {
            this.setState({
                avatar: avatar
            })
        }

        let nome = await AsyncStorage.getItem("nome")
        nome = nome.replace(/[\\"]/g, '')

        if (nome != null) {
            this.setState({
                nome: nome
            })
        }
        console.log('avatar' + this.state.nome)

        var loginAuto = await AsyncStorage.getItem("loginAuto")

        if (loginAuto == 'true') {
            this.loginautomatico()
        }
    }
    loginautomatico = async () => {

        this.setState({
            usuario: await AsyncStorage.getItem("login"),
            senha: await AsyncStorage.getItem("senha")
        })

        this.login()

    }

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

                console.log(JSON.stringify(token["dados"][0]["nome"]))

                //Passando o status da consulta, em caso de SUCESSO ou ERRO
                if (token["status"] === 'sucesso') {
                    console.log(token)
                    // Atribundo valor de retorno da consulta JSON para uma GLOBAL
                    await AsyncStorage.setItem("email", JSON.stringify(token["dados"][0]["email"]));
                    await AsyncStorage.setItem("nome", JSON.stringify(token["dados"][0]["nome"]));
                    await AsyncStorage.setItem("id_firm", JSON.stringify(token["dados"][0]["id_firm"]));
                    await AsyncStorage.setItem("id_patient", JSON.stringify(token["dados"][0]["id_patient"]));
                    await AsyncStorage.setItem("login", this.state.usuario);
                    await AsyncStorage.setItem("senha", this.state.senha);
                    if (token["dados"][0]["avatar"] != null) {
                        await AsyncStorage.setItem("avatar", token["dados"][0]["avatar"])
                    } else {
                        await AsyncStorage.setItem("avatar", "")
                    }
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
                mSenha: true,
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



    render() {
        return (
            <View
                {...this.props}
                style={{
                    backgroundColor: Variables.colors.primary,
                    paddingLeft: 20,
                    paddingRight: 20,
                    flex: 1
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
                    <View style={{alignItems:'center', paddingBottom: 20 }}>

                        {this.state.avatar ?
                            <Image
                                source={{ uri: this.state.avatar }}
                                style={{
                                    width: 110, height: 110, borderRadius: 100, borderColor: Variables.colors.gray, borderWidth: 3,
                                }}
                            />
                            :
                            <Image
                                source={require('../../assets/user.png')}
                                style={{
                                    width: 110, height: 110, borderRadius: 100, borderColor: Variables.colors.gray, borderWidth: 3,
                                }} />
                        }

                        <Text style={{
                            fontSize: 14,
                            color: 'gray',
                            paddingTop:2
                        }}>{this.state.nome}</Text>

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


                    <View>

                        {this.state.loading &&
                            <TouchableOpacity
                                onPress={this.login}
                                style={{
                                    width: '97%',
                                    height: 40,
                                    backgroundColor: "#007bff",
                                    borderBottomWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 9,
                                    flexDirection: "row",
                                    borderColor: "#007bff",
                                    //borderRadius: 0,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                    borderBottomLeftRadius: 5,
                                    borderBottomRightRadius: 5,
                                    padding: 10
                                }}>
                                <FontAwesome5 name="power-off" size={20} color={Variables.colors.white}></FontAwesome5>
                                <Text style={{ fontSize: 12, color: Variables.colors.white }} > Conecte-se </Text>
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

            </View>

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
        marginBottom: 40,
        marginTop: 70

    } as ViewStyle,
    logo: {
        width: 250,
    }
}

