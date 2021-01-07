import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Styles, { Variables } from '../styles';

const Tab = createBottomTabNavigator();

import Scan from '../screens/Home/index';
import Medicao from '../screens/operacoes/medicao';
import Telemetria from '../screens/operacoes/telemetria';
// import Opcoes from '../screens/operacoes/opcoes';
import Alertas from '../screens/operacoes/alertas';


export default function cadastrodRoutes() {
    return (

        <Tab.Navigator initialRouteName="Home"
            tabBarOptions={{
                activeTintColor: '#fff',
                labelPosition: 'below-icon', // Coloca a descrição dos botões abaixo
                keyboardHidesTabBar: true, //Oculta a barra de menus
                labelStyle: {
                    fontSize: 12,
                },
                tabStyle: {
                    marginTop: 0,
                    paddingTop: 41,
                    borderRightWidth: 0,
                    borderRightColor: ''
                },
                style: {
                    backgroundColor: '#273574',
                    height: 55

                },
            }}

        >


            {/* <Tab.Screen
                name="Histórico"
                component={Telemetria}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="history" style={{ paddingBottom: 30 }} size={25} color="black"></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />
*/}

            <Tab.Screen
                name="HOME"
                component={Scan}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="home" style={{ paddingBottom: 30 }} size={30} color="#fff"></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />
            <Tab.Screen
                name="INFOS"
                component={Alertas}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="info-circle" style={{ paddingBottom: 30 }} size={30} color="#fff"></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />

            {/*
            <Tab.Screen
                name="Opções"
                component={Opcoes}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="user-cog" style={{ paddingBottom: 30 }} size={25} color={Variables.colors.black}></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />
            */}
        </Tab.Navigator>

    );
}