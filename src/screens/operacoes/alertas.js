import React, { Component } from 'react';
import { Platform, View, Text, Image, StyleSheet , ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl  } from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';



export default class alertas extends Component {

  constructor() {
    super()
    this.state = { info: "", values: {} , loading: false , refreshing: false }

    //componentDidMount = async () => {
      //console.log('Tela de telemetrias');
    //}

    
  }

  carregaTelemetria = async () => {
    setInterval(this.cancelaTelemetria, 3000);
    await this.setState({ loading: true , refreshing: true  })

  }

  cancelaTelemetria = async () => {
        this.setState({  refreshing: false , loading: false  })
        clearInterval();
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


      <ScrollView style={{ padding:10 }}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this.carregaTelemetria} />
          }
      
      >    

      <View style={{ padding: 10 }}>
                {this.state.loading &&
                    <ActivityIndicator size={"large"} color="#999999" style={{ marginTop: 9, justifyContent: "center" }} />
                }            
      </View>
 
      <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"heartbeat"} size={40} color="red" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
                    <Text style={styles.titleText} >  Frequência cardíaca </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >  70 </Text> 
                      <Text style={styles.textTextDescricao}> bpm </Text>
                      <Text style={styles.textTextDescricao}> - NORMAL </Text>
                    </View>
                  </View>
        </View>
        </TouchableOpacity>

         <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"thermometer-half"} size={40} color="red" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
            <Text style={styles.titleText} >Temperatura corporal  {'\n'} </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >Sua temperatura corporal passou dos 38.2 °C  {'\n\n '}CUIDADO </Text>                       
                    </View>
                  </View>
        </View>
        </TouchableOpacity>


        </ScrollView>

      </>
    )
  }



}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: "Cochin"
  },
  titleText: {
    fontSize:18, 
    fontWeight: "bold"
  },
  textText: {
    fontSize:18, 
    color:"red",
    fontWeight: "bold"
  },
  textTextDescricao: {
    fontSize:14, 
    color:"gray",
    marginTop: "2%"    
  },
  cardBorder:{
      borderTopRightRadius: 80,
      borderBottomRightRadius: 80,
      //borderBottomLeftRadius: 50,
      backgroundColor: "white",
      flex: 1,
      padding: 20,
      margin: 5,
      borderColor: "black",
      // borderStyle: 'dashed',
      borderWidth: 1,
  }
});
