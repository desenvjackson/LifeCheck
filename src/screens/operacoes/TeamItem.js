import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,TouchableOpacity,ScrollView, Card
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';




const TeamItem = ({ item }) =>  

<>

{/* <Text style={styles.item}>{item.name}</Text>   */}

<View>
<ScrollView>
                 <TouchableOpacity
                    key={item.name}
                    onPress={() => deviceconnect(item)}
                >
                    <Card.Title
                        title={item.name}
                        subtitle={item.connected ? 'Desconectar' : 'Conectar'}
                        left={() => <FontAwesome5 name={"bluetooth"} size={25} />}
                        //right={() => <FontAwesome5 name={"bluetooth"} size={40} color={this.state.corIconBluetooth} /> }
                    />
                </TouchableOpacity>
     
</ScrollView>
</View>

</>

 

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    flex: 1,
    marginBottom: 10,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default TeamItem;

