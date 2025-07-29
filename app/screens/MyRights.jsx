import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { db } from "../../firebaseConfig.js"; // Adjust the path if needed

const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("hospital");
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

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

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "hospital"));
      const formattedPlaces = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          name: doc.id,
          address: `Hospital: ${doc.id}`,
        };
      });

      setPlaces(formattedPlaces);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error fetching hospital locations:", error);
      Alert.alert("Error", "Failed to fetch hospital locations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    if (category === "hospital") {
      setSelectedCategory(category);
      fetchPlaces();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Resources in Your Area</Text>
      </View>

      {/* Hospital Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleCategorySelect("hospital")}>
          <Text style={styles.categoryButton}>🏥 Hospitals Nearby</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
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
              onPress={() => setSelectedPlace(place)}
              pinColor={
                selectedCategory === "hospital" ? "red" : "green"
              }
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      {/* Loading spinner */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Floating info box for selected place */}
      {selectedPlace && (
        <View style={styles.floatingBox}>
          <Text style={styles.resourceTitle}>{selectedPlace.name}</Text>
          <Text style={styles.resourceLocation}>{selectedPlace.address}</Text>
          <TouchableOpacity onPress={() => setSelectedPlace(null)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
  buttonContainer: {
    position: "absolute",
    top: 100,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 3,
    elevation: 3,
  },
  categoryButton: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 14,
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
  floatingBox: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  resourceTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  resourceLocation: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default PlacesMap;
