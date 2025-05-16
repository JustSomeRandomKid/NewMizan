import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("police");
  const [loading, setLoading] = useState(false); // Loading state for fetching places

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location services to use this feature.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    };

    getUserLocation();
  }, []);

  const fetchPlaces = async (category) => {
    setLoading(true); // Set loading to true when fetching starts
    let allResults = [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${category}&format=json&countrycodes=IL&limit=50`;
      const response = await axios.get(url);
      allResults = response.data;

      const formattedPlaces = allResults.map((place) => ({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        name: place.display_name.split(",")[0], // Shorten name
        address: place.display_name,
      }));

      setPlaces(formattedPlaces);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", "Failed to fetch locations. Please try again.");
    } finally {
      setLoading(false); // Set loading to false once the fetch is complete
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchPlaces(category); // Fetch places based on selected category
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Resources in Your Area</Text>
      </View>

      {region ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={region}
          showsUserLocation
          showsMyLocationButton
        >
          {places.map((place, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: place.lat, longitude: place.lon }}
              title={place.name}
              pinColor={
                selectedCategory === "police"
                  ? "blue"
                  : selectedCategory === "hospital"
                  ? "red"
                  : "green"
              }
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      <View style={styles.directoryContainer}>
        <TouchableOpacity onPress={() => handleCategorySelect("police")}>
          <Text style={[styles.directoryText, { color: "blue" }]}>Police</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleCategorySelect("hospital")}>
          <Text style={[styles.directoryText, { color: "red" }]}>Hospital</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleCategorySelect("shelter")}>
          <Text style={[styles.directoryText, { color: "green" }]}>Shelter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    borderRadius: 8,
    zIndex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  directoryContainer: {
    position: "absolute",
    bottom: 20,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 2,
  },
  directoryText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
  map: {
    flex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default PlacesMap;
