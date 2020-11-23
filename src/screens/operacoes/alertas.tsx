import React, { PureComponent } from 'react';
import { Linking, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Styles, { Variables } from '../../styles';



export default class alertas extends PureComponent {


  state = {
    url: 'https://rnyapi.com.br/icns/#/Measurement'
  }
  componentDidMount = async () => {
    console.log('oi')

  }
  loadInBrowser = () => {
    Linking.openURL(this.state.url).catch(err => console.error("Couldn't load page", err));
  };


  render() {
    return (
      <View style={{ backgroundColor: 'white', alignItems: 'center', padding: 10, flex: 1, justifyContent: 'center' }}>

        <Text style={{ textAlign: 'justify' }}>
          {"\n"}
          O INSTANT CHECK é um serviço de monitoramento remoto, que utiliza um braclete inteligente, com sensores biométricos que medem os principais sinais fisiológicos do usuário.
        {"\n"} {"\n"}
          Estes sinais são utilizados, como refêrencia e apenas para fins informativos, não substituindo os métodos tradicionais de diagnósticos ou tratamento por um profissional de saúde qualificado.
          {"\n"} {"\n"}
          Não é portanto, um dispositivo médico e não se distina a curar, sugerir ou indicar medicamentos e tratamentos.
        </Text>

      </View>
    )
  }



}

