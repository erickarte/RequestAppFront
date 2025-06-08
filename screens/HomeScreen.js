import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import {  FAB as Fab, Card, Text } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';

const API_URL = 'http://192.168.1.13:3000';
const STORAGE_KEY = '@requests_data';

export default function HomeScreen() {
  const [requests, setRequests] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchData = async () => {
    
    try {
      const res = await fetch(`${API_URL}/requests`);
      const data = await res.json();
      console.log('Dados recebidos:', data);

      setRequests(data);

      // Armazenar localmente
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao buscar reclamação:', error);

      // Em caso de erro, tenta carregar do AsyncStorage
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          setRequests(JSON.parse(storedData));
          Alert.alert('Aviso', 'Dados carregados do armazenamento local.');
        }
      } catch (storageError) {
        console.error('Erro ao carregar do AsyncStorage:', storageError);
      }
    }      

  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge">{item.name}</Text>
              <Text variant="bodyMedium">{item.description}</Text>
            </Card.Content>
            {item.photo && (
              <Card.Cover
              source={{ uri: `${API_URL}/${item.photo.replace(/\\/g, '/')}` }}
              style={styles.image}
              />
            )}
          </Card>
        )}
      />
      <Fab icon="plus" style={styles.fab} onPress={() => navigation.navigate('Adicionar Reclamação')} />
      <Fab icon="map" style={styles.mapButton} onPress={() => navigation.navigate('Mapa')} />
    </View>
  );
}

