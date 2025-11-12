import React from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';

export default function HomeScreen({ navigation, onLogout }) {
  const cerrarSesion = async () => {
    Alert.alert(
      '¿Cerrar sesión?',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, salir',
          onPress: async () => {
            try {
              await signOut(auth);
              onLogout(); // Regresa al login
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido 👋</Text>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Productos')}>
        <Text style={styles.navButtonText}>Ir a Productos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Clientes')}>
        <Text style={styles.navButtonText}>Ir a Clientes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Promedio')}>
        <Text style={styles.navButtonText}>Ir a Promedio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Empleados')}>
        <Text style={styles.navButtonText}>Ir a Empleados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Ciudades')}>
        <Text style={styles.navButtonText}>Ir a Ciudades</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Realtime')}>
        <Text style={styles.navButtonText}>Ir a ProductosRealtime</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('IMC')}>
        <Text style={styles.navButtonText}>Ir a FormularioIMC</Text>
      </TouchableOpacity>


      <View style={{ marginTop: 30 }}>
        <Button title="Cerrar sesión" color="#d9534f" onPress={cerrarSesion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30 },
  navButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});