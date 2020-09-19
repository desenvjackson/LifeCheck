import React from "react";
import { Text, View, ViewStyle, KeyboardAvoidingView, ScrollView, Alert, Image, StatusBar, TouchableHighlight, TextInput, AsyncStorage } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import AnimatedLoader from "react-native-animated-loader";
import Styles, { Variables } from "../styles";
//import api from "../services";

interface Props {
    navigation: NavigationScreenProp<any, any>;
    usaLoading?: boolean;
    loading?: boolean;
    lightStatusBar: boolean;
    style?: any;
    ignoraToken: boolean;
}

interface State {
}

export default class Screen extends React.Component<Props, State> {
    static defaultProps = {
        lightStatusBar: false,
        ignoraToken: false,
        usaLoading: true
    }

    componentDidMount = async () => {
     /*   if (!this.props.ignoraToken) {
            try {
                await api.get("usuario");
            } catch (err) {
                if (err.response) {
                    console.warn(err.response);

                    if (err.response.status === 401)
                        await this.props.navigation.navigate("Login");
                    else
                        alert(err.response.data);
                } else {
                    console.warn(err)
                }
            }
        }*/
    }

    render() {
        return (
            <KeyboardAvoidingView style={Styles.container} behavior={"height"}>
                <ScrollView style={[Styles.content, this.props.style]}>
                    {this.props.lightStatusBar &&
                        <StatusBar
                            animated={true}
                            translucent={false}
                            barStyle={'dark-content'}
                            backgroundColor={'#FFFFFF'}
                        />
                    }
                    {!this.props.lightStatusBar &&
                        <StatusBar
                            animated={true}
                            translucent={false}
                            barStyle={'light-content'}
                            backgroundColor={Variables.colors.primary}
                        />
                    }

                    {this.props.usaLoading &&
                        <AnimatedLoader
                            visible={this.props.loading}
                            overlayColor="rgba(255,255,255,1)"
                            source={require("./loader.json")}
                            animationStyle={Styles.lottie}
                            speed={1}
                        />
                    }

                    {this.props.children}
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}