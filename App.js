import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, FlatList, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [locationCoords, setLocationCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Inicjalizacja aplikacji...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    initializeAppFeatures();
  }, []);

  const initializeAppFeatures = async () => {
    setIsLoading(true);
    setIsError(false);
    setStatusMessage('Sprawdzanie uprawnień GPS...');

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setIsError(true);
        setStatusMessage('🚨 Brak uprawnień! Aplikacja wymaga dostępu do GPS, aby pobrać pogodę.');
        setIsLoading(false);
        return;
      }

      setStatusMessage('Pobieranie współrzędnych geograficznych...');
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setLocationCoords({ latitude, longitude });

      setStatusMessage('Łączenie z serwerem meteorologicznym...');
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,precipitation&hourly=temperature_2m,precipitation_probability&forecast_days=2`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Serwer pogodowy zwrócił niepoprawny status HTTP.');
      }

      const data = await response.json();
      setWeatherData(data);
      setStatusMessage('Dane zaktualizowane pomyślnie.');
    } catch (error) {
      setIsError(true);
      setStatusMessage(`🚨 Błąd sieci: ${error.message || 'Nie udało się pobrać danych.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getHourlyForecastList = () => {
    if (!weatherData || !weatherData.hourly) return [];
    
    const times = weatherData.hourly.time || [];
    const temps = weatherData.hourly.temperature_2m || [];
    const probs = weatherData.hourly.precipitation_probability || [];

    return times.slice(0, 24).map((time, index) => {
      const hourLabel = time.substring(11, 16);
      return {
        id: index.toString(),
        hour: hourLabel,
        temp: temps[index],
        rainProb: probs[index],
      };
    });
  };

  const renderHourlyItem = ({ item }) => (
    <View style={styles.hourlyCard}>
      <Text style={styles.hourlyTimeText}>{item.hour}</Text>
      <Text style={styles.hourlyTempText}>{item.temp}°C</Text>
      <Text style={styles.hourlyRainText}>💧 {item.rainProb}%</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.mainScrollView}>
        
        <Text style={styles.mainAppHeaderTitle}>🌤️ Pogoda „Tu i Teraz”</Text>
        <Text style={styles.mainAppHeaderSubtitle}>Projekt oparty o lokalizację GPS urządzenia</Text>

        {isLoading ? (
          <View style={styles.infoBoxContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusInfoText}>{statusMessage}</Text>
          </View>
        ) : isError ? (
          <View style={[styles.infoBoxContainer, styles.errorBoxBorder]}>
            <Text style={styles.errorTextMain}>{statusMessage}</Text>
            <Pressable style={styles.refreshAppButton} onPress={initializeAppFeatures}>
              <Text style={styles.refreshAppButtonText}>🔄 Spróbuj ponownie</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.weatherContentWrapper}>
            
            <View style={styles.dataCardView}>
              <Text style={styles.cardHeaderTitleText}>📍 Twoje położenie</Text>
              <Text style={styles.coordinatesLabelText}>Szerokość (Lat): {locationCoords?.latitude.toFixed(4)}</Text>
              <Text style={styles.coordinatesLabelText}>Długość (Lon): {locationCoords?.longitude.toFixed(4)}</Text>
            </View>

            {weatherData?.current && (
              <View style={[styles.dataCardView, styles.currentWeatherHighlight]}>
                <Text style={styles.currentWeatherBigNumber}>
                  {weatherData.current.temperature_2m}°C
                </Text>
                <Text style={styles.currentWeatherMetaInfo}>
                  💨 Wiatr: {weatherData.current.wind_speed_10m} km/h  |  🌧️ Opad: {weatherData.current.precipitation} mm
                </Text>
              </View>
            )}

            <Pressable style={styles.refreshAppButton} onPress={initializeAppFeatures}>
              <Text style={styles.refreshAppButtonText}>🔄 Odśwież stan pogody</Text>
            </Pressable>

            <Text style={styles.hourlySectionTitle}>📅 Prognoza na najbliższe 24 godziny</Text>
            <FlatList
              data={getHourlyForecastList()}
              keyExtractor={(item) => item.id}
              renderItem={renderHourlyItem}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalFlatListLayout}
            />

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f1f3f5',
  },
  mainScrollView: {
    padding: 16,
    paddingBottom: 32,
  },
  mainAppHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c7ed6',
    textAlign: 'center',
    marginTop: 10,
  },
  mainAppHeaderSubtitle: {
    fontSize: 13,
    color: '#868e96',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBoxContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    marginVertical: 10,
  },
  errorBoxBorder: {
    borderColor: '#fa5252',
    borderWidth: 1,
  },
  statusInfoText: {
    marginTop: 12,
    color: '#495057',
    fontSize: 14,
    textAlign: 'center',
  },
  errorTextMain: {
    color: '#e03131',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  weatherContentWrapper: {
    width: '100%',
  },
  dataCardView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeaderTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 8,
  },
  coordinatesLabelText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 2,
  },
  currentWeatherHighlight: {
    backgroundColor: '#e7f5ff',
    borderColor: '#a5d8ff',
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  currentWeatherBigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1c7ed6',
  },
  currentWeatherMetaInfo: {
    fontSize: 13,
    color: '#495057',
    marginTop: 8,
  },
  refreshAppButton: {
    backgroundColor: '#1c7ed6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshAppButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  hourlySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  horizontalFlatListLayout: {
    paddingVertical: 4,
  },
  hourlyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  hourlyTimeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#868e96',
    marginBottom: 6,
  },
  hourlyTempText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  hourlyRainText: {
    fontSize: 11,
    color: '#1c7ed6',
  },
});
