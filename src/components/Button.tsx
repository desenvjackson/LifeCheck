import React from "react";
import { ViewStyle, TouchableHighlight, Text, TextStyle, View } from "react-native";
import Styles, { Variables } from "../styles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

interface Props {
    onClick: any;
    title: string;
    disabled: boolean;
    style?: any;
    styleTitle?: any;
    icon?: string;
    light?: boolean;
    transparent?: boolean;
}

interface State {

}

export class Button extends React.Component<Props, State> {
    static defaultProps = {
        disabled: false,
        light: false,
        transparent: false
    }

    render() {
        var backgroundColor = Variables.colors.secondary;

        if (this.props.disabled)
            backgroundColor = Variables.colors.primaryLight;

        if (this.props.light)
            backgroundColor = "#FFF";

        if (this.props.transparent)
            backgroundColor = "transparent";

        return (
            <TouchableHighlight
                style={[
                    styles.button,
                    this.props.light ? styles.buttonLight : {},
                    {
                        backgroundColor,
                    },
                    this.props.style
                ]}
                disabled={this.props.disabled}
                underlayColor={
                    this.props.light ? Variables.colors.gray : Variables.colors.primaryDark
                }
                onPress={this.props.onClick}
            >
                <View>
                    {!this.props.icon &&
                        <Text style={[
                            styles.buttonText,
                            this.props.light ? styles.buttonLightText : {},
                            this.props.styleTitle
                        ]}>{this.props.title}</Text>
                    }

                    {this.props.icon &&
                        <FontAwesome5 name={this.props.icon} size={20} color={"#FFF"} />
                    }
                </View>
            </TouchableHighlight>
        )
    }
}

const styles = {
    button: {
        marginTop: 5,
        padding: 10,
        borderRadius: 40,
        alignItems: 'center',
        backgroundColor: Variables.colors.secondary
    } as ViewStyle,
    buttonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold"
    } as TextStyle,
    buttonLight: {
        backgroundColor: "#FFF",
        borderColor: Variables.colors.primary,
        borderWidth: 1,
        padding: 5,
        marginTop: 5
    } as ViewStyle,
    buttonLightText: {
        color: Variables.colors.primary
    } as TextStyle,
}