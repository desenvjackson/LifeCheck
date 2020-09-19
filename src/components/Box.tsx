import React from "react";
import { ViewStyle, TouchableHighlight, Text, TextStyle, View } from "react-native";
import Styles, { Variables } from "../styles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

interface Props {
    children?: any;
    padding?: number;
    style?: any;
}

interface State {

}

export class Box extends React.Component<Props, State> {
    static defaultProps = {
        padding: 10
    }

    render() {
        return (
            <View
                style={[
                    {
                        padding: this.props.padding,
                        marginBottom: 10,
                        backgroundColor: "#FFF",
                        borderRadius: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 1
                    },
                    this.props.style
                ]}
            >
                {this.props.children}
            </View>
        )
    }
}