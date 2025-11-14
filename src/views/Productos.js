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
import * as DocumentPicker from "expo-document-picker";

// 🔧 Convertir ArrayBuffer a base64
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

  const generarExcelProductos = async () => {
    try {
      const snapshot = await getDocs(collection(db, "productos"));
      const productos = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          nombre: typeof data.nombre === "string" ? data.nombre : "",
          precio: typeof data.precio === "number" ? data.precio : "",
          descripcion: typeof data.descripcion === "string" ? data.descripcion : "",
        };
      });

      if (!productos || productos.length === 0) {
        throw new Error("No hay datos en la colección 'productos'");
      }

      const response = await fetch("https://hk3ic9ldi0.execute-api.us-east-2.amazonaws.com/generarexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: productos }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.documentDirectory + "reporte_productos.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Descargar Reporte de Productos",
        });
      } else {
        Alert.alert("Compartir no disponible.");
      }

      Alert.alert("Excel de productos generado y listo para compartir.");
    } catch (error) {
      console.error("Error generando Excel:", error);
      Alert.alert("Error: " + error.message);
    }
  };

 const extraerYGuardarMascotas = async () => {
  try {
    // Abrir selector de documentos para elegir archivo Excel
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
      return;
    }

    const { uri, name } = result.assets[0];
    console.log(`Archivo seleccionado: ${name} en ${uri}`);

    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Enviar a Lambda para procesar
    const response = await fetch("https://2fab9azndg.execute-api.us-east-2.amazonaws.com/extraerexcel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ archivoBase64: base64 }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP en Lambda: ${response.status}`);
    }

    const body = await response.json();
    const { datos } = body;

    if (!datos || !Array.isArray(datos) || datos.length === 0) {
      Alert.alert("Error", "No se encontraron datos en el Excel o el archivo está vacío.");
      return;
    }

    console.log("Datos extraídos del Excel:", datos);

    // Guardar cada fila en la colección 'mascotas'
    let guardados = 0;
    let errores = 0;

    for (const mascota of datos) {
      try {
        // Columnas: 'nombre', 'edad', 'raza' (ajusta si los headers son diferentes)
        await addDoc(collection(db, "mascotas"), {
          nombre: mascota.nombre || "",
          edad: parseInt(mascota.edad) || 0,
          raza: mascota.raza || "",
        });
        guardados++;
      } catch (err) {
        console.error("Error guardando mascota:", mascota, err);
        errores++;
      }
    }

    Alert.alert(
      "Éxito",
      `Se guardaron ${guardados} mascotas en la colección. Errores: ${errores}.`,
      [{ text: "OK" }]
    );

  } catch (error) {
    console.error("Error en extraerYGuardarMascotas:", error);
    Alert.alert("Error", `Error procesando el Excel: ${error.message}`);
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
        <Button title="Generar Excel de Productos" onPress={generarExcelProductos} />
      </View>
      <View style={{ marginVertical: 10 }}>
        <Button title="Extraer Mascotas desde Excel" onPress={extraerYGuardarMascotas} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default Productos;