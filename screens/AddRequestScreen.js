import React, { useEffect, useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.1.13:3000';
const STORAGE_KEY = '@requests_data';

export default function AddRequestScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } else {
        Alert.alert('Permissão de localização negada');
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão para acessar a câmera foi negada!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const addToLocalStorage = async (newItem) => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const data = existing ? JSON.parse(existing) : [];
      data.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao adicionar no AsyncStorage:', e);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('título', name);
    formData.append('description', description);

    if (image) {
      formData.append('photo', {
        uri: image.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
    }

    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }

    try {
      await fetch(`${API_URL}/requests`, {
        method: 'POST',
        body: formData,
        /*REMOVIDO o header Content-Type para o multipart funcionar no React Native
        // headers: { 'Content-Type': 'multipart/form-data' },
        headers: {
          'Content-Type': 'multipart/form-data',
        },*/
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados para a API');
      }

      const newRequest = await response.json();

      // Salva localmente também
      await addToLocalStorage(newRequest);

      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro ao salvar reclamação', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Título"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Descrição da Reclamação"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        mode="outlined"
        multiline
      />
      <Button
        mode="outlined"
        onPress={pickImage}
        style={styles.input}
        icon="camera"
      >
        Tirar Foto
      </Button>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: '100%', height: 200, marginBottom: 10, borderRadius: 8 }}
        />
      )}

      <Button mode="contained" onPress={handleSubmit}>
        Salvar
      </Button>
    </View>
  );
}
