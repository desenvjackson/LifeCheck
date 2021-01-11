import React, { PureComponent } from 'react';
import { Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import api from '../services/index'
import Styles, { Variables } from "../../styles";
import Modal from 'react-native-modal';

import AsyncStorage from '@react-native-community/async-storage';



export default class telemetria extends PureComponent {

  state = {
    carregarDataSoucer: false,
    modalMedicao: false,
    dataSource: [],
    frequenciaCardiaca: "",
    oxigenio: "",
    hipoTensao: "",
    hipoTensao: "",
    temperatura: "",
    nome: "",
    sobrenome: "",
    data: "",
    cor: "",
    avatar: ""
  };
  componentDidMount = async () => {
    let avatar = await AsyncStorage.getItem("avatar")
    if (avatar != null) {
      this.setState({
        avatar: avatar
      })
    }

    this.meusRegistros()
  }


  meusRegistros = async () => {
    let id = await AsyncStorage.getItem('id_patient')

    this.setState({
      carregarDataSoucer: true
    })
    try {

      const data = {
        id_patient: id,
      }

      var { data: token } = await api.post("monitoring/listMonitoringForFirm", "data=" + JSON.stringify(data))

      if (token["status"] === 'sucesso') {

        console.log(token)
        this.setState({
          dataSource: token["dados"],
        });
        console.log(JSON.stringify(this.state.dataSource))
        this.setState({
          carregarDataSoucer: false
        })
      } else {
        this.setState({
          carregarDataSoucer: false,
        })

      }

    } catch (err) {

      alert(err);

    }
  }

  abrirModal = async (frequenciacardiaca, oxigenio, hipertensao, hipotensao, temperatura, nome, sobrenome, date_monitor) => {
    await this.setState({
      modalMedicao: true,
      frequenciaCardiaca: frequenciacardiaca,
      oxigenio: oxigenio,
      hiperTensao: hipertensao,
      hipoTensao: hipotensao,
      temperatura: temperatura,
      nome: nome,
      sobrenome: sobrenome,
      data: date_monitor
    })
    console.log(frequenciacardiaca, oxigenio, hipertensao, hipotensao, temperatura, nome, sobrenome, date_monitor)
  }
  fechaModal = async () => {
    await this.setState({
      modalMedicao: false,
      frequenciaCardiaca: "",
      oxigenio: "",
      hiperTensao: "",
      hipoTensao: "",
      temperatura: "",
      data: ""
    })
  }

  render() {
    return (

      <ScrollView style={{
        width: "100%", backgroundColor: Variables.colors.grayDark, flex: 1
      }}  >
        {this.state.carregarDataSoucer &&
          <View style={{ alignItems: 'center', marginTop: '50%' }}>
            <ActivityIndicator size={"small"} color={Variables.colors.black} style={{ padding: 40 }} />
            <Text>Carregando... </Text>

          </View>

        }
        {!this.state.carregarDataSoucer &&

          <View style={{ width: "100%", paddingTop: 20, paddingBottom: 10 }}  >
            {this.state.dataSource.map((op) => {
              return (
                <>
                  < TouchableOpacity
                    onPress={() => this.abrirModal(op.frequenciacardiaca, op.oxigenio, op.hipertensao, op.hipotensao, op.temperatura, op.nome, op.sobrenome, op.date_monitor)}
                    style={{
                      width: '97%',
                      height: 120,
                      backgroundColor: "white",
                      borderBottomWidth: 1,
                      // justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 9,
                      marginLeft: 5,
                      flexDirection: "row",
                      borderColor: Variables.colors.grayLight,
                      //borderRadius: 0,
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: 5,
                    }}>
                    <View style={{ paddingBottom: 10, paddingRight: 15, paddingLeft: 15 }}>
                        <Image
                        source={require('../../assets/medicoes.png')}
                        style={{
                          marginLeft:4
                        }} />
                    </View>
                    <View style={{ paddingBottom: 15 }}>
                      {op.temperatura < 37 && op.oxigenio > 89 && op.frequenciacardiaca < 120 && op.hipertensao < 140 && op.hipotensao < 90 ?
                        <Text style={{ fontSize: 24, color: "green", opacity: 0.6, paddingTop: 5 }} >BOM</Text>
                        :
                        <Text style={{ fontSize: 24, color: "#D16406", opacity: 0.6, paddingTop: 5 }} >ATENÇÃO</Text>
                      }
                      <Text style={{ fontSize: 12, color: "gray", opacity: 0.6, paddingTop: 5 }}>Dia: {op.data}. Horário: {op.hora}h</Text>
                    </View>
                  </TouchableOpacity>
                </>
              );
            })}
          </View>
        }

        <Modal
          isVisible={this.state.modalMedicao}
          animationIn={"slideInLeft"}
          onBackButtonPress={() => this.fechaModal}
          style={{ backgroundColor: 'white', marginTop: 110, marginBottom: 110 }}
        >
          <ScrollView>

            <View >
              <View style={styles.textlogoMedicao}>
                <View style={{ paddingBottom: 20, paddingRight: 15, paddingLeft: 15 }}>
                  {this.state.avatar ?
                    <Image
                      source={{ uri: this.state.avatar }}
                      style={{
                        width: 70, height: 70, borderRadius: 100, borderColor: Variables.colors.gray, borderWidth: 3,
                      }}
                    />
                    :
                    <Image
                      source={require('../../assets/user.png')}
                      style={{
                        width: 70, height: 70, borderRadius: 100, borderColor: Variables.colors.gray, borderWidth: 3,
                      }} />
                  }
                </View>
                <View style={{ paddingBottom: 37 }}>
                  <Text style={{ fontSize: 20, color: "black" }} >
                    {this.state.nome} {this.state.sobrenome}
                  </Text>

                  <Text style={{ fontSize: 12, color: "gray", opacity: 0.6, paddingTop: 10 }} >
                    {this.state.data}
                  </Text>
                </View>
              </View>

              <View>

                <View style={styles.bodyModal}>
                  <FontAwesome5 name={"heartbeat"} size={25} color="navy" />
                  <Text style={styles.textModalstate}> {this.state.frequenciaCardiaca}</Text>
                  <Text style={styles.textModalinfo}> ( bpm )</Text>
                  <Text style={styles.textModalinfo}> Frequência Cardíaca </Text>
                </View>


                <View style={styles.bodyModal}>
                  <FontAwesome5 name={"stethoscope"} size={25} color="navy" />
                  <Text style={styles.textModalstate}> {this.state.hiperTensao}/{this.state.hipoTensao}</Text>
                  <Text style={styles.textModalinfo}> ( mmhg )</Text>
                  <Text style={styles.textModalinfo}> Pressão arterial </Text>
                </View>

                <View style={styles.bodyModal}>
                  <FontAwesome5 name={"tint"} size={25} color="navy" />
                  <Text style={styles.textModalstate}> {this.state.oxigenio}</Text>
                  <Text style={styles.textModalinfo}> ( SpO2 % )</Text>
                  <Text style={styles.textModalinfo}> Saturação do oxigênio</Text>
                </View>

                <View style={styles.bodyModal}>
                  <FontAwesome5 name={"thermometer-half"} size={25} color="navy" />
                  <Text style={styles.textModalstate}> {this.state.temperatura}</Text>
                  <Text style={styles.textModalinfo}> ( °C )</Text>
                  <Text style={styles.textModalinfo}> Temperatura</Text>

                </View>
              </View>

            </View>

            <TouchableOpacity style={{ alignItems: 'center', alignContent: "center", marginTop: 20 }}
              onPress={this.fechaModal} >
              <FontAwesome5 name='sign-out-alt' color='navy' size={17} > Sair </FontAwesome5>
            </TouchableOpacity>


          </ScrollView>
        </Modal>
      </ScrollView >
    )
  }

}

const styles = StyleSheet.create({

  textlogoMedicao: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    width: '100%'

  },


  textText: {
    fontSize: 28,
    color: "navy",
    fontWeight: "bold",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    textAlign: "center",
    textAlignVertical: "center",
    marginTop: 12,
  },
  textTextDescricao: {
    fontSize: 12,
    color: "navy",
    fontWeight: "bold",
    marginTop: 10,
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    textAlign: "center",
    textAlignVertical: "center",
    //fontWeight: "bold",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  titleTextTitulo: {
    fontSize: 12,
    //fontWeight: "bold",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    textAlign: "center",
    textAlignVertical: "center",
    // marginTop: 10,
  },


  cardBorder: {
    backgroundColor: "white",
    flex: 1,
  },
  bodyModal: {
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: "row",
    padding: 5,
    width: '100%',
    backgroundColor: Variables.colors.gray,
  },

  textModalstate: {
    color: "navy",
    fontSize: 25
  },
  textModalinfo: {
    color: "gray"
  }


});
