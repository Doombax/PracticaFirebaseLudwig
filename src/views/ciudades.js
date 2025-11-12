import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../database/firebaseConfig';

const Ciudades = () => {
  useEffect(() => {
    ejecutarConsultas();
  }, []);

  const ejecutarConsultas = async () => {
    console.clear();
    console.log('INICIANDO CONSULTAS FIRESTORE...\n');

    await consulta1();
    await consulta2();
    await consulta3();
    await consulta4();
    await consulta5();
    await consulta6();
    await consulta7();
    await consulta8();

    console.log('\nCONSULTAS COMPLETADAS');
  };

  const imprimirResultados = (snapshot, titulo) => {
    console.log(`\n${titulo}`);
    if (snapshot.empty) return console.log("   → Sin resultados");
    snapshot.forEach(doc => {
      const d = doc.data();
      console.log(`   • ${d.nombre} | ${d.poblacion}k | ${d.pais} | ID: ${doc.id}`);
    });
  };

  const consulta1 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("pais", "==", "Guatemala"),
        orderBy("poblacion", "desc"),
        limit(2)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "1. Top 2 Guatemala (población desc)");
    } catch (e) {
      console.error("Error 1:", e.message);
    }
  };

  const consulta2 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("pais", "==", "Honduras"),
        limit(3)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "2. Honduras (limit 3)");
    } catch (e) {
      console.error("Error 2:", e.message);
    }
  };

  const consulta3 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("pais", "==", "El Salvador"),
        limit(2)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "3. El Salvador (limit 2)");
    } catch (e) {
      console.error("Error 3:", e.message);
    }
  };

  const consulta4 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("poblacion", "<=", 300),
        limit(4)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "4. ≤300k (limit 4)");
    } catch (e) {
      console.error("Error 4:", e.message);
    }
  };

  const consulta5 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("poblacion", ">", 900),
        limit(3)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "5. >900k (limit 3)");
    } catch (e) {
      console.error("Error 5:", e.message);
    }
  };

  const consulta6 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("pais", "==", "Guatemala"),
        orderBy("poblacion", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "6. Guatemala (población desc, limit 5)");
    } catch (e) {
      console.error("Error 6:", e.message);
    }
  };

  const consulta7 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        where("poblacion", ">=", 200),
        limit(5)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "7. ≥200k (limit 5)");
    } catch (e) {
      console.error("Error 7:", e.message);
    }
  };

  const consulta8 = async () => {
    try {
      const q = query(
        collection(db, "ciudades"),
        orderBy("poblacion", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      imprimirResultados(snapshot, "8. Top 5 por población");
    } catch (e) {
      console.error("Error 8:", e.message);
    }
  };

  return (
    <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 10 }}>
        Agita el celular → "Open JS Debugger" para ver resultados
      </Text>
      <Button title="Ejecutar Consultas Manualmente" onPress={ejecutarConsultas} />
    </View>
  );
};

export default Ciudades;