import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { db } from "../../firebaseConfig.js"; // Adjust the path if needed


const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // distance in km
};

const openInMaps = (lat, lon) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  Linking.openURL(url);
};


const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("hospital");
  const [loading, setLoading] = useState(false);
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
          crimeTypes: data.crimeTypes || [],
          image: data.image || "https://via.placeholder.com/400x200",
          status: data.status || "Open",
          closeTime: data.closeTime || "8:00 PM",
          isNew: data.isNew || false,
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
      {/* Header Pill */}
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>Resources Near You</Text>
      </View>

      {/* Category Button */}
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
              onPress={() => {
                const distance = calculateDistance(
                  region.latitude,
                  region.longitude,
                  place.lat,
                  place.lon
                );
                setSelectedPlace({ ...place, distance });
              }}
              pinColor={selectedCategory === "hospital" ? "red" : "green"}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      {/* Loading Spinner */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {/* Floating Card */}
      {selectedPlace && (
        <View style={styles.card}>
          {selectedPlace.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedPlace.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.resourceTitle}>{selectedPlace.name}</Text>
            <Text style={styles.status}>
              {selectedPlace.status} · Closes {selectedPlace.closeTime}
            </Text>
            <Text style={styles.distance}>
              {selectedPlace.distance} km away
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openInMaps(selectedPlace.lat, selectedPlace.lon)}
            style={styles.mapsButton}
          >
            <Text style={styles.mapsButtonText}>Open in Maps</Text>
          </TouchableOpacity>
          
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
  headerPill: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 3,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
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
  card: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  imageContainer: {
    width: "100%",
    height: 150,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: 16,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  status: {
    color: "green",
    fontWeight: "600",
    fontSize: 14,
  },
  distance: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: "#eee",
    alignSelf: "flex-end",
    margin: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "green",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 15,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PlacesMap;
