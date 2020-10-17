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
