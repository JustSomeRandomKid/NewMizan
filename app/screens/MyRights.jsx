import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { db } from "../../firebaseConfig.js";

const { width } = Dimensions.get("window");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const openInMaps = (lat, lon) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  Linking.openURL(url);
};

const CATEGORY_COLORS = {
  hospital: '#e26f6f',
  Shelter: 'grey',
  LeagalAid: '#2596be',
};

const PlacesMap = () => {
  const [places, setPlaces] = useState([]);
  const [region, setRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(selectedCategory);
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

  const fetchPlaces = async (category) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, category));
      const formattedPlaces = snapshot.docs.map((doc) => {
        const data = doc.data();
        const loc = data.loc;
        return {
          name: doc.id,
          loc: {
            latitude: loc.latitude,
            longitude: loc.longitude,
          },
          crimeTypes: data.crimeTypes || [],
          image: data.image || "https://via.placeholder.com/400x200",
          status: data.status || "Open",
          closeTime: data.closeTime || "8:00 PM",
          isNew: data.isNew || false,
          category,
        };
      });
      setPlaces(formattedPlaces);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", `Failed to fetch ${category} locations.`);
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
      <View style={styles.headerPill}>
        <Text style={styles.headerText}>Nearby Resources</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleCategorySelect("hospital")}
          style={[
            styles.categoryButtonWrap,
            { backgroundColor: CATEGORY_COLORS.hospital },
          ]}
        >
          <Text style={styles.categoryButton}>Hospitals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleCategorySelect("Shelter")}
          style={[
            styles.categoryButtonWrap,
            { backgroundColor: CATEGORY_COLORS.Shelter },
          ]}
        >
          <Text style={styles.categoryButton}>Shelters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleCategorySelect("Leagal Aid")}
          style={[
            styles.categoryButtonWrap,
            { backgroundColor: CATEGORY_COLORS.LeagalAid },
          ]}
        >
          <Text style={styles.categoryButton}>Police</Text>
        </TouchableOpacity>
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
              coordinate={place.loc}
              title={place.name}
              onPress={() => {
                const distance = calculateDistance(
                  region.latitude,
                  region.longitude,
                  place.loc.latitude,
                  place.loc.longitude
                );
                setSelectedPlace({ ...place, distance });
              }}
              pinColor={CATEGORY_COLORS[place.category]}
            />
          ))}
        </MapView>
      ) : (
        <Text style={styles.loadingText}>Loading map...</Text>
      )}

      {loading && <ActivityIndicator size="large" color="#ffd02b" style={styles.loader} />}

      {selectedPlace && (
        <View style={styles.card}>
          {selectedPlace.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
          <Image source={require('../../assets/images/hadassah_ek.jpg')} style={styles.cardImage}/>
          <View style={styles.cardContent}>
            <Text style={styles.resourceTitle}>{selectedPlace.name}</Text>
            <Text style={styles.status}>{selectedPlace.status} • Closes {selectedPlace.closeTime}</Text>
            <Text style={styles.distance}>{selectedPlace.distance}km away</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.mapsButton} onPress={() => openInMaps(selectedPlace.loc.latitude, selectedPlace.loc.longitude)}>
              <Text style={styles.mapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#100c24",
  },
  headerPill: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "#ffd02b",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 10,
    elevation: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#100c24",
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    position: "absolute",
    top: 100,
    zIndex: 5,
  },
  categoryButtonWrap: {
    width:110,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginLeft: 5,
    marginRight: 5
  },
  categoryButton: {
    color: "#100c24",
    fontWeight: "600",
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    color: "#fff",
    alignSelf: "center",
    marginTop: 20,
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
    left: 16,
    right: 16,
    backgroundColor: "#0b2836",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffd02b",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4caf50",
    marginTop: 4,
  },
  distance: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mapsButton: {
    backgroundColor: "#ffd02b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  mapsButtonText: {
    color: "#100c24",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "transparent",
    borderColor: "#ffd02b",
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#ffd02b",
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ff4081",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 15,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PlacesMap;
