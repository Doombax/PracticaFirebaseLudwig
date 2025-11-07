import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, Button } from "react-native";
import { db } from "../database/firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

// 🔧 Función auxiliar para convertir ArrayBuffer a base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const Productos = () => {
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    hora: "",
  });

  const [productos, setProductos] = useState([]);
  const [modEdicion, setModEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarProducto = async () => {
    try {
      const p = nuevoProducto;
      if (p.nombre && p.descripcion && p.precio && p.stock) {
        await addDoc(collection(db, "productos"), {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: parseFloat(p.precio),
          stock: parseFloat(p.stock),
          hora: parseFloat(p.hora),
        });
        setNuevoProducto({
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          hora: "",
        });
        cargarDatos();
      } else {
        Alert.alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar producto:", error);
    }
  };

  const actualizarProducto = async () => {
    try {
      const p = nuevoProducto;
      if (p.nombre && p.descripcion && p.precio && p.stock) {
        await updateDoc(doc(db, "productos", productoId), {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: parseFloat(p.precio),
          stock: parseFloat(p.stock),
          hora: parseFloat(p.hora),
        });
        setNuevoProducto({
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          hora: "",
        });
        setModEdicion(false);
        setProductoId(null);
        cargarDatos();
      } else {
        Alert.alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener documentos: ", error);
    }
  };

  const editarProducto = (item) => {
    setNuevoProducto({
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio.toString(),
      stock: item.stock.toString(),
      hora: item.hora?.toString() || "",
    });
    setProductoId(item.id);
    setModEdicion(true);
  };

  // ✅ Exportar todas las colecciones como .txt
  const exportarTodoFirestoreComoTxt = async () => {
    try {
      const colecciones = ["productos", "clientes", "empleados", "ciudades"];
      let textoFinal = "";

      for (const nombre of colecciones) {
        const snapshot = await getDocs(collection(db, nombre));
        const documentos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        textoFinal += `=== ${nombre.toUpperCase()} ===\n`;

        documentos.forEach((doc) => {
          Object.entries(doc).forEach(([key, value]) => {
            textoFinal += `${key}: ${value}\n`;
          });
          textoFinal += "---\n";
        });

        textoFinal += "\n";
      }

      await Clipboard.setStringAsync(textoFinal);
      console.log("Datos copiados al portapapeles.");

      const fileUri = FileSystem.cacheDirectory + "todoFirestore.txt";
      await FileSystem.writeAsStringAsync(fileUri, textoFinal, {
        encoding: "utf8",
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Compartir datos Firestore (.txt)",
        });
      } else {
        Alert.alert("Compartir no disponible.");
      }

      Alert.alert("Archivo .txt generado y listo para compartir.");
    } catch (error) {
      console.error("Error al exportar todas las colecciones:", error);
      Alert.alert("Error: " + error.message);
    }
  };

  // ✅ Generar Excel desde la colección "ciudades"
  const generarExcelCiudades = async () => {
    try {
      const snapshot = await getDocs(collection(db, "ciudades"));
      const ciudades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (!ciudades || ciudades.length === 0) {
        throw new Error("No hay datos en la colección 'ciudades'");
      }

      const response = await fetch("https://v15dwab3ve.execute-api.us-east-1.amazonaws.com/generarexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: ciudades }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.documentDirectory + "reporte_ciudades.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Clipboard.setStringAsync("Excel generado con datos de ciudades.");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Descargar Reporte de Ciudades",
        });
      } else {
        Alert.alert("Compartir no disponible.");
      }

      Alert.alert("Excel generado y listo para compartir.");
    } catch (error) {
      console.error("Error generando Excel:", error);
      Alert.alert("Error: " + error.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modEdicion={modEdicion}
      />
      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar TODO (.txt)" onPress={exportarTodoFirestoreComoTxt} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel de Ciudades" onPress={generarExcelCiudades} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;