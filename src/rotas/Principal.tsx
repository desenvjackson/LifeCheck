import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Styles, { Variables } from '../styles';

const Tab = createBottomTabNavigator();

import Scan from '../screens/Home/index';
import Medicao from '../screens/operacoes/medicao';
import Telemetria from '../screens/operacoes/telemetria';
import Opcoes from '../screens/operacoes/opcoes';


export default function cadastrodRoutes() {
    return (

        <Tab.Navigator initialRouteName="Devices"
            tabBarOptions={{
                activeTintColor: 'red',
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
                    backgroundColor: '#fff',
                    height: 55

                },
            }}

        >

            <Tab.Screen
                name="Devices"
                component={Scan}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="bluetooth" style={{ paddingBottom: 30 }} size={25} color="navy"></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />

            <Tab.Screen
                name="Medições"
                component={Telemetria}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="file-medical-alt" style={{ paddingBottom: 30 }} size={25} color="navy"></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />

            <Tab.Screen
                name="Alertas"
                component={Medicao}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="bell" style={{ paddingBottom: 30 }} size={25} color={Variables.colors.black}></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />

            <Tab.Screen
                name="Opções"
                component={Opcoes}
                options={{

                    tabBarIcon: ({ }) => (
                        <FontAwesome5 name="cogs" style={{ paddingBottom: 30 }} size={25} color={Variables.colors.black}></FontAwesome5>
                    ),
                    unmountOnBlur: true
                }}
            />


        </Tab.Navigator>

    );
}