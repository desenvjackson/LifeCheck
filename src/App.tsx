import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import cadastrodRoutes from './rotas/Principal';
import LoginScreen from './screens/Login/index';
import novoUsuarioScreen from './screens/Login/novousuario';

const Stack = createStackNavigator();


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen name="Scan" component={cadastrodRoutes} options={{
          title: '',
          headerShown: false,
        }} />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: '',
            headerShown: false,
          }}
        />

        <Stack.Screen name="Cadastro de Usuário" component={novoUsuarioScreen} options={{
          title: 'Cadastro de Usuário',
          headerShown: true,
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: "tahoma",
            fontSize: 15,
          },
        }} />
      

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;