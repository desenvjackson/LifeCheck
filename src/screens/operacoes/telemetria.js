import React, { Component } from 'react';
import { Platform, View, Text, Image, StyleSheet , ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl  } from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';



export default class telemetria extends Component {

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
                      <Text style={styles.textText} >  89 </Text> 
                      <Text style={styles.textTextDescricao}> bpm </Text>
                    </View>
                  </View>
        </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"stethoscope"} size={40} color="blue" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
                    <Text style={styles.titleText} >  Pressão arterial </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >  131/98 </Text> 
                      <Text style={styles.textTextDescricao}> mmhg </Text>
                    </View>
                  </View>
        </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"file-medical-alt"} size={40} color="black" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
                    <Text style={styles.titleText} >  ECG </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >  Normal </Text> 
                      <Text style={styles.textTextDescricao}>   </Text>
                    </View>
                  </View>
        </View>
        </TouchableOpacity>
 
        <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"tint"} size={40} color="gray" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
                    <Text style={styles.titleText} >  Oxigénio </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >  90% </Text> 
                      <Text style={styles.textTextDescricao}>   </Text>
                    </View>
                  </View>
        </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.carregaTelemetria}>
        <View style={styles.cardBorder}>
                  <View style={{ height:0 }}>
                        <FontAwesome5 name={"thermometer-half"} size={40} color="green" />
                  </View>
                  <View style={{ paddingLeft:"15%" }}  >
                    <Text style={styles.titleText} >  Temperatura corporal </Text>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.textText} >  35.7 ªc </Text> 
                      <Text style={styles.textTextDescricao}>   </Text>
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
      borderTopRightRadius: 40,
      borderBottomLeftRadius: 30,
      backgroundColor: "white",
      flex: 1,
      padding: 20,
      margin: 5,
  }
});
