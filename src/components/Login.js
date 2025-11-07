import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const manejarLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa ambos campos');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home'); // ← redirige al HomeScreen
    } catch (error) {
      console.log(error);
      let mensaje = 'Error al iniciar sesión.';

      if (error.code === 'auth/invalid-email') {
        mensaje = 'Correo inválido.';
      } else if (error.code === 'auth/user-not-found') {
        mensaje = 'Usuario no encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        mensaje = 'Contraseña incorrecta.';
      }

      Alert.alert('Error', mensaje);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={manejarLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default Login;