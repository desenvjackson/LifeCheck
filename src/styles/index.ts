import Variables from './Variables';
import { ViewStyle, StyleSheet } from 'react-native';

export { Variables };

export default StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        backgroundColor: Variables.colors.primary,
        padding: 10
    },
    button: {
        alignItems: 'center',
        backgroundColor: Variables.colors.secondary,
        padding: 5,
        borderRadius: 20
    },
    buttonLight: {
        alignItems: 'center',
        color: Variables.colors.primary,
        padding: 5,
        borderRadius: 20
    },
    buttonView: {
        alignItems: 'center',
    },
    buttonText: {
        color: "white",
        fontSize: 16
    },
    modalButton: {
        width: 100,
        marginTop: 15,
        borderWidth: 1,
        borderColor: Variables.colors.primary,
        backgroundColor: "#FFF"
    },
    modalButtonText: {
        color: Variables.colors.primary
    },
    textInput: {
        backgroundColor: "transparent",
        height: 40,
        padding: 0,
        color: Variables.colors.gray,
        fontSize: 20,
        marginHorizontal: 10,
    },
    h1: {
        fontSize: 30
    },
    h2: {
        fontSize: 24
    },
    h3: {
        fontSize: 20
    },
    h4: {
        fontSize: 16
    },
    h5: {
        fontSize: 14
    },
    scrollContainer: {
        backgroundColor: "#E9E9E9",
    },
    scrollContainerContent: {
        padding: 10,
    },
    lottie: {
        width: 200,
        height: 200
    }
})