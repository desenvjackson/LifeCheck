import React, { PureComponent, Fragment, } from 'react';
import { Switch, View, TouchableOpacity, ScrollView, Text, StatusBar, AsyncStorage, Linking, Dimensions, StyleSheet, SectionList } from 'react-native';
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
                    <Text style={styles.sectionHeader}>SEU APP</Text>

                    <View style={{ flexDirection: "row", paddingLeft: 15, margin: 1 }}>
                        <TouchableOpacity
                            onPress={this.loadInBrowser} style={styles.item}
                        >
                            <Text style={styles.item}>
                                <FontAwesome5 name={"clipboard-list"} size={20} color={Variables.colors.black} /> Dashboard</Text>
                        </TouchableOpacity>
                    </View>

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