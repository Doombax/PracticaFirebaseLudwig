import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { getDatabase } from 'firebase/database';


const { extra } = Constants.expoConfig;

// Configuración Web de Firebase  
const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN, 
  projectId: extra.FIREBASE_PROJECT_ID,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
  databaseURL: extra.FIREBASE_DATABASE_URL,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const realtimeDB = getDatabase(app);

export { app, auth, db, realtimeDB };