import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

import { ref, set, push, onValue } from "firebase/database";
import { realtimeDB } from "../database/firebaseConfig";

const FormularioIMC = () => {
  const [nombre, setNombre] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [registrosIMC, setRegistrosIMC] = useState([]);

  const guardarIMC = async () => {
    if (!nombre || !peso || !altura) {
      alert("Completa todos los campos");
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (isNaN(pesoNum) || isNaN(alturaNum) || alturaNum <= 0) {
      alert("Peso y altura deben ser números válidos");
      return;
    }

    const imc = pesoNum / (alturaNum * alturaNum);
    const resultado = imc.toFixed(2);

    try {
      const referencia = ref(realtimeDB, "registros_imc");
      const nuevoRef = push(referencia);

      await set(nuevoRef, {
        nombre,
        peso: pesoNum,
        altura: alturaNum,
        imc: resultado,
        fecha: new Date().toISOString(),
      });

      setNombre("");
      setPeso("");
      setAltura("");

      alert(`IMC registrado correctamente: ${resultado}`);
    } catch (error) {
      console.log("Error al guardar IMC:", error);
    }
  };

  const leerIMC = () => {
    const referencia = ref(realtimeDB, "registros_imc");

    onValue(referencia, (snapshot) => {
      if (snapshot.exists()) {
        const dataObj = snapshot.val();
        const lista = Object.entries(dataObj).map(([id, datos]) => ({
          id,
          ...datos,
        }));
        setRegistrosIMC(lista);
      } else {
        setRegistrosIMC([]);
      }
    });
  };

  useEffect(() => {
    leerIMC();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Formulario IMC</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={(t) => setNombre(t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={(t) => setPeso(t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Altura (m)"
        keyboardType="numeric"
        value={altura}
        onChangeText={(t) => setAltura(t)}
      />

      <Button title="Calcular y Guardar IMC" onPress={guardarIMC} />

      <Text style={styles.subtitulo}>Registros IMC:</Text>

      {registrosIMC.length === 0 ? (
        <Text>No hay registros aún</Text>
      ) : (
        registrosIMC.map((r) => (
          <Text key={r.id}>
            {r.nombre} - IMC: {r.imc}
          </Text>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitulo: { fontSize: 18, marginTop: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default FormularioIMC;
