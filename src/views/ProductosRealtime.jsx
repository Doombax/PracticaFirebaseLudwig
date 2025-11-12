import react, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

import { ref, set, push, onValue } from "firebase/database";
import { realtimeDB } from "../database/firebaseConfig";
import { snapshotEqual } from "firebase/firestore";

const ProductosRealtime = () => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [productosRT, setProductosRT] = useState("");

  const guardarEnRT = async () => {
    if (!nombre || !precio) {
      alert("Rellena ambos campos");
      return;
    }

    try {
      const referencia = ref(realtimeDB, "productos_rt");
      const nuevoRef = push(referencia); // Crea ID automatico

      await set(nuevoRef, {
        nombre,
        precio: Number(precio),
      });

      setNombre("");
      setPrecio("");

      alert("Producto guardado en Realtime(creo vv)");
    } catch (error) {
      console.log("Error al guardar esa monda:", error);
    }
  };

  const leerRT = () => {
    const referencia = ref(realtimeDB, "productos_rt");

    onValue(referencia, (snapshot) => {
      if (snapshot.exists()) {
        // snapshot.val() devuelve un objeto {id:{data}}
        const dataObj = snapshot.val();

        //Convertir ese objeto en un array limpio
        const lista = Object.entries(dataObj).map(([id, datos]) => ({
          id,
          ...datos,
        }));

        setProductosRT(lista);
      } else {
        setProductosRT([]);
      }
    });
  };

  useEffect(() => {
    leerRT(); //Se conecta a los cambios en tiempo real
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Prueba Realtime Database</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre producto"
        value={nombre}
        onChangeText={(t) => setNombre(t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        keyboardType="numeric"
        value={precio}
        onChangeText={(t) => setPrecio(t)}
      />

      <Button title="Guardar en Realtime" onPress={guardarEnRT} />

      <Text style={styles.subtitulo}>Productos en RT:</Text>

      {productosRT.length === 0 ? (
        <Text>No hay productos registrados</Text>
      ) : (
        productosRT.map((p) => (
          <Text key={p.id}>
            {p.nombre} - ${p.precio}
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

export default ProductosRealtime;
