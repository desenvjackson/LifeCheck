import React, { Component } from 'react';
import { Platform, View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {
  BleManager,
  BleError,
  Device,
  LogLevel,
  Characteristic,
} from 'react-native-ble-plx';

import AsyncStorage from '@react-native-community/async-storage';


const manager = new BleManager();

export default class telemetria extends Component {

  constructor() {
    super()
    this.state = { info: "", values: {}, loading: false, refreshing: false, device: "" }
    this.state = { hrv: "", frequenciaCardiaca: "", estresse: "", hiperTensao: "", hipoTensao: "" }
    this.state = { humor: "", frequenciaRespiratoria: "" }

    //componentDidMount = async () => {
    //console.log('Tela de telemetrias');
    //}


  }

  componentDidMount = async () => {
    await AsyncStorage.setItem("notificando", "0")
    this.carregaTelemetria();
  }

  carregaTelemetria = async () => {
    // setInterval(this.cancelaTelemetria, 1500);
    let notificando = await AsyncStorage.getItem("notificando")

    this.timer = setTimeout(() => {
        this.carregaTelemetria();
    }, 1000);

    // console.log ( " ######################################################################################### ") 

    let hrv = await AsyncStorage.getItem("hrv")
    let frequenciaCardiaca = await AsyncStorage.getItem("frequenciaCardiaca")
    let estresse = await AsyncStorage.getItem("estresse")
    let hiperTensao = await AsyncStorage.getItem("hiperTensao")
    let hipoTensao = await AsyncStorage.getItem("hipoTensao")
    let humor = await AsyncStorage.getItem("humor")
    let frequenciaRespiratoria = await AsyncStorage.getItem("frequenciaRespiratoria")    

    //tratamento do nivel de HRV

    await this.setState({ hrv: hrv, frequenciaCardiaca: frequenciaCardiaca, estresse: estresse, hiperTensao: hiperTensao, hipoTensao: hipoTensao })
    await this.setState({ humor: humor, frequenciaRespiratoria: frequenciaRespiratoria })

    //await this.setState({ loading: true, refreshing: true })

    if (notificando === "1"){   
      this.setState({ loading: true })
    }else{
      this.setState({ loading: false })
    }
    

  }

  cancelaTelemetria = async () => {
    this.setState({ refreshing: false, loading: false })
    clearInterval();
  }

  carregaFrequenciaCardiaca = async () => {

    // assuming the 'device' is already connected
    //const device = await AsyncStorage.getItem('TASKS'); 
    await device.discoverAllServicesAndCharacteristics();
    const services = await device.services();

    // Ativa Monitoramento Cardiaco
    let UART_SERVICE = "0000180d-0000-1000-8000-00805f9b34fb" // UART Service
    let TX_CHARACT = "00002a37-0000-1000-8000-00805f9b34fb" // TX Characteristic (Property = Notify) - "Heart Rate Measurement"

    try {
      let char = await manager.monitorCharacteristicForDevice(device.id,
        UART_SERVICE,
        TX_CHARACT,
        this.onUARTSubscriptionUpdate
      );
    } catch (err) {
      console.log(JSON.stringify(err))


    }
  }



  render() {
    return (
      <>

        <StatusBar
          animated={true}
          translucent={true}
          barStyle={'light-content'}
          backgroundColor="gray"
        />

<View
                    style={{
                        paddingTop: 10,
                        backgroundColor: "white"
                    }}

                >


        <ScrollView style={{ padding: 10 }}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.carregaTelemetria} />
          }

        >

          <View style={{ padding: 10 }}>
            {this.state.loading &&
              <ActivityIndicator size={"large"} color="#999999" style={{ marginTop: 9, justifyContent: "center" }} />
            }
          </View>

          <TouchableOpacity onPress={this.carregaFrequenciaCardiaca}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"heartbeat"} size={30} color="red" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} >Frequência cardíaca : <Text style={styles.textText} > { this.state.frequenciaCardiaca } </Text> <Text style={styles.textTextDescricao}>bpm </Text> </Text>
                <View style={{ flexDirection: "row" }}>
                  
                  
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.carregaTelemetria}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"stethoscope"} size={30} color="black" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} >Pressão: <Text style={styles.textText} >  { this.state.hiperTensao } / { this.state.hipoTensao } <Text style={styles.textTextDescricao}> mmhg </Text> </Text>  </Text>
                <View style={{ flexDirection: "row" }}>
                  
                  
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.carregaTelemetria}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"file-medical-alt"} size={30} color="black" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} >E.C.G: <Text style={styles.textText} >  Normal </Text> </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.carregaTelemetria}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"smile"} size={30} color="black" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} >Estresse: <Text style={styles.textText} >  { this.state.estresse } </Text> </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.carregaTelemetria}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"heart"} size={30} color="red" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} > HRV: <Text style={styles.textText} > { this.state.hrv }</Text> </Text>
              </View>
            </View>
          </TouchableOpacity>


          <TouchableOpacity onPress={this.carregaTelemetria}>
            <View style={styles.cardBorder}>
              <View style={{ height: 0 }}>
                <FontAwesome5 name={"thermometer"} size={30} color="black" />
              </View>
              <View style={{ paddingLeft: "15%" }}  >
                <Text style={styles.titleText} >Temperatura:  <Text style={styles.textText} >  36.5 °C </Text>  </Text>
              </View>
            </View>
          </TouchableOpacity>


        </ScrollView>

        </View>    

      </>
    )
  }



}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin"
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  textText: {
    fontSize: 16,
    color: "gray",
    //fontWeight: "bold"
  },
  textTextDescricao: {
    fontSize: 12,
    color: "gray",
    marginTop: "2%"
  },
  cardBorder: {
    //borderTopRightRadius: 80,
    //borderBottomRightRadius: 30,
    //borderBottomLeftRadius: 50,
    backgroundColor: "white",
    flex: 1,
    padding: 20,
    margin: 5,
    borderColor: "gray",
    // borderStyle: 'dashed',
    borderWidth: 0.3,
  }
});
