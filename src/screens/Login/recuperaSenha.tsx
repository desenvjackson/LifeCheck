import React from 'react';
import { View, ViewStyle, Alert, Image, TextInput, ActivityIndicator, AsyncStorage, TouchableOpacity, Text, StatusBar } from 'react-native';
import { NavigationScreenProp, StackActions, NavigationActions } from 'react-navigation';
import TextInputMask from 'react-native-text-input-mask';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Styles, { Variables } from '../../styles';
//import Screen from '../Screen';

interface Props {
    navigation: NavigationScreenProp<any, any>;
}

interface State {
   
}
export default class recuperaSenhaScreen extends React.Component<Props, State> {

    private inputs = [];

    static navigationOptions = {
        title: "Recuperar  senha  "
    }

    constructor(props: Props) {
        super(props);

        // Cria o state do componente
        this.state = {
          
        }
    }
    render() {
        return (
            <Screen
                {...this.props}
                usaLoading={false}
                style={{
                    backgroundColor: Variables.colors.primary,
                    padding: 20
                }}
            >
                <StatusBar
                    animated={true}
                    translucent={true}
                    barStyle={'light-content'}
                    backgroundColor={Variables.colors.grayDark}
                />
        
            </Screen>

        );
    }
}

