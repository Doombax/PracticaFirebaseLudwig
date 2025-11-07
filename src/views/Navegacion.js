import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../components/Login';
import HomeScreen from './HomeScreen';
import Productos from './Productos';
import Clientes from './Clientes';
import Promedio from './Promedio';
import Empleados from './Empleado';

const Stack = createStackNavigator();

export default function Navegacion() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ title: 'Inicio de sesión' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="Productos" component={Productos} options={{ title: 'Productos' }} />
        <Stack.Screen name="Clientes" component={Clientes} options={{ title: 'Clientes' }} />
        <Stack.Screen name="Promedio" component={Promedio} options={{ title: 'Promedio' }} />
        <Stack.Screen name="Empleados" component={Empleados} options={{ title: 'Empleados' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}