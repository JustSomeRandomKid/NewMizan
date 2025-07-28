import axios from "axios";
import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { db } from "../../firebaseConfig.js"; // Adjust the path if needed

const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("police");
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);

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

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Resources"));
        const resourceList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setResources(resourceList);
      } catch (error) {
        console.error("Error fetching resources:", error);
        Alert.alert("Error", "Failed to load resources.");
      }
    };

    fetchResources();
  }, []);

  const fetchPlaces = async (category) => {
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${category}&format=json&countrycodes=IL&limit=50`;
      const response = await axios.get(url);
      const allResults = response.data;

      const formattedPlaces = allResults.map((place) => ({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        name: place.display_name.split(",")[0],
        address: place.display_name,
      }));

      setPlaces(formattedPlaces);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", "Failed to fetch locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchPlaces(category);
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

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Scrollable Resources List */}
      <View style={styles.resourcesContainer}>
        <FlatList
          data={resources}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <View style={styles.resourceCard}>
              <Text style={styles.resourceTitle}>{item.name}</Text>
              <Text style={styles.resourceType}>Type: {item.type}</Text>
              <Text style={styles.resourceLocation}>Location: {item.location}</Text>
              <Text style={styles.resourceHours}>Hours: {item.hours}</Text>
              {item.description ? (
                <Text style={styles.resourceDescription}>{item.description}</Text>
              ) : null}
            </View>
          )}
        />
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
    zIndex: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
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
  resourcesContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 2,
  },
  resourceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    minWidth: 200,
    elevation: 3,
  },
  resourceTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 14,
    color: "#333",
  },
  resourceLocation: {
    fontSize: 13,
    color: "#444",
  },
  resourceHours: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  resourceDescription: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  directoryContainer: {
    position: "absolute",
    bottom: 20,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 8,
    zIndex: 2,
  },
  directoryText: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: "center",
  },
});

export default PlacesMap;
