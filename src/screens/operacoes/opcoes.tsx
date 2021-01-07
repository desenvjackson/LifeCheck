import React, { PureComponent, Fragment, } from 'react';
import { Switch, View, TouchableOpacity, ScrollView, Text, StatusBar, AsyncStorage, Linking, Dimensions, StyleSheet, SectionList, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Styles, { Variables } from '../../styles';

//import Styles, { Variables } from '../../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const window = Dimensions.get('window');

export default class OpcoesScreen extends PureComponent {

    state = {
        url: 'https://rnyapi.com.br/icns/#/Measurement'
    };

    loadInBrowser = () => {
        Linking.openURL(this.state.url).catch(err => console.error("Couldn't load page", err));
    };

    acceptNotificationWhatsapp = async () =>{

        Alert.alert(" Notificações ",
        "Deseja receber notificações via Whatsapp sobre suas medições ?" +
        "\n\n\nCaso sim. Você será redirecionado para o seu whatsapp, basta enviar o código que aparece na tela e seguir com os procedimentos solicitados.\n\n" 
        ,
        [
            {
                text: 'Sair',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            { text: 'Sim', onPress: () =>   Linking.openURL('whatsapp://send?text=%23net&phone=553197804455')  }
        ],
        { cancelable: false }
    );

      


    }

    render() {

        return (
            <>
                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor={"gray"}
                />

                <View
                    style={{
                        paddingTop: 1,
                        backgroundColor: "white"
                    }}

                >
                    <Text style={styles.sectionHeader}> </Text>

                    <View style={{ flexDirection: "row", paddingLeft: 15, margin: 1, borderWidth:1, borderBottomWidth:0,  borderColor:"gray" }}>
                        <TouchableOpacity
                            onPress={this.loadInBrowser} style={styles.item}
                        >
                            <Text style={styles.item}>
                                <FontAwesome5 name={"clipboard-list"} size={20} color={Variables.colors.black} /> Dashboard </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: "row",  paddingLeft: 15, margin: 1, borderWidth:1, borderColor:"gray" }}>
                        <TouchableOpacity
                            onPress={this.acceptNotificationWhatsapp} style={styles.item}
                        >
                            <Text style={styles.item}>
                                <FontAwesome5 name={"whatsapp"} size={20} color={Variables.colors.black} /> Receber notificações via Whatsapp </Text>
                        </TouchableOpacity>
                    </View>
                    </View>

                    <View style={{  marginTop: 30, backgroundColor: "white"  }}>
                    <View style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate("Login")}
                            style={styles.item}
                        >
                            <Text style={styles.item}>
                                <FontAwesome5 name="sign-out-alt" size={20} color="red"></FontAwesome5> Desconectar </Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                
            </>
        );
    }
}


export const styles = StyleSheet.create({
    sectionHeader: {
        paddingTop: 3,
        paddingLeft: 30,
        paddingBottom: 3,
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(247,247,247,1.0)',
        textDecorationColor: 'gray',
    },
    item: {
        fontSize: 14,
        margin: 10,
    },

});