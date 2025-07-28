import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../../firebaseConfig'; // Import your firebase config

const ReportCrime = () => {
  const [crime, setCrime] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [victimID, setVictimID] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchUserID();
  }, []);

  const fetchUserID = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setVictimID(currentUser.uid);
      } else {
        Alert.alert('Error', 'No user session found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get user session.');
    }
  };

  const handleAddLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  const handleReportCrime = async () => {
    if (!crime || !description || !date) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      // Create document in Firestore
      await addDoc(collection(db, 'crimes'), {
        crime,
        description,
        date,
        victimID,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
        createdAt: new Date(),
        status: 'pending' // You can add additional fields
      });
      
      Alert.alert('Success', 'Crime reported successfully!');
      
      // Reset form
      setCrime('');
      setDescription('');
      setDate('');
      setLocation(null);
    } catch (error) {
      console.error('Error reporting crime:', error);
      Alert.alert('Error', 'Failed to report crime. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <FontAwesome5 name="shield-alt" size={24} color="#EEBA2B" style={styles.icon} />
          <Text style={styles.title}>Report a Crime</Text>
        </View>

        <Text style={styles.label}>Type of Crime</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="report" size={20} color="#04445F" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={crime}
            onChangeText={setCrime}
            placeholder="e.g., Theft, Assault"
            placeholderTextColor="#ccc"
          />
        </View>

        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputRow, styles.multilineRow]}>
          <MaterialIcons name="description" size={20} color="#04445F" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Provide detailed information"
            placeholderTextColor="#ccc"
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="calendar-today" size={20} color="#04445F" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#ccc"
          />
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleAddLocation}>
          <Text style={styles.secondaryButtonText}>Add Location</Text>
        </TouchableOpacity>

        {location && (
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleReportCrime}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#04445F',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EEBA2B',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  multilineRow: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#EEBA2B',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#04445F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    color: '#04445F',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ReportCrime;