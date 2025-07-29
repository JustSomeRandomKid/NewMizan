import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

const ReportCrime = ({ navigation }) => {
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
      Alert.alert('All fields are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'crimes'), {
        crime,
        description,
        date,
        victimID,
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : null,
        createdAt: new Date(),
        status: 'pending',
      });
      Alert.alert('Success', 'Crime reported successfully!');
      navigation.navigate('MyCases');
      setCrime('');
      setDescription('');
      setDate('');
      setLocation(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to report crime. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.outer}>
        <View style={styles.headerWrap}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="shield-alt" size={28} color="#FFD93B" />
          </View>
          <Text style={styles.pageTitle}>Report a Crime</Text>
          <Text style={styles.pageSubtitle}>
            Your report helps us make a difference. Please fill out the details below.
          </Text>
        </View>
        <View style={styles.card}>
          {/* --- TYPE OF CRIME --- */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Type of Crime</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="report" size={22} color="#FFD93B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={crime}
                onChangeText={setCrime}
                placeholder="e.g. Theft, Assault"
                placeholderTextColor="#B5B9C7"
              />
            </View>
          </View>
          {/* --- DESCRIPTION --- */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputRow, styles.multilineRow]}>
              <MaterialIcons name="description" size={22} color="#FFD93B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details (What happened? Where? How?)"
                placeholderTextColor="#B5B9C7"
                multiline
                numberOfLines={4}
              />
            </View>
            <Text style={styles.helperText}>Be as specific as you can.</Text>
          </View>
          {/* --- DATE --- */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="calendar-today" size={20} color="#FFD93B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#B5B9C7"
              />
            </View>
          </View>
          {/* --- LOCATION BUTTON --- */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              !!location && { backgroundColor: '#FFD93B' },
            ]}
            onPress={handleAddLocation}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name="place"
              size={18}
              color={location ? '#002949' : '#FFD93B'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.locationButtonText,
                location && { color: '#002949', fontWeight: 'bold' },
              ]}
            >
              {location ? 'Location Added' : 'Add Location'}
            </Text>
          </TouchableOpacity>
          {location && (
            <Text style={styles.locationPill}>
              {`Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`}
            </Text>
          )}
          {/* --- SUBMIT BUTTON --- */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleReportCrime}
            activeOpacity={0.92}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#022D3A',
  },
  outer: {
    flexGrow: 1,
    padding: 26,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    backgroundColor: '#002949',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 5,
    shadowColor: '#FFD93B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD93B',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 14.5,
    color: '#99A3B0',
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    backgroundColor: 'rgba(4, 68, 95, 0.97)',
    borderRadius: 25,
    paddingVertical: 28,
    paddingHorizontal: 18,
    width: '100%',
    shadowColor: '#FFD93B',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  inputBlock: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 5,
    marginLeft: 2,
    color: '#FFD93B',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 0,
    paddingHorizontal: 10,
    // subtle shadow for depth
    ...Platform.select({
      ios: { shadowColor: '#FFD93B', shadowOpacity: 0.09, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  multilineRow: {
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 7,
    opacity: 0.9,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#002949',
    paddingVertical: 13,
    backgroundColor: 'transparent',
    borderRadius: 0,
    fontWeight: '500',
  },
  multilineInput: {
    height: 92,
    textAlignVertical: 'top',
    paddingTop: 4,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: '#B5B9C7',
    marginTop: 5,
    marginLeft: 3,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#FFD93B',
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 2,
    marginBottom: 4,
    alignSelf: 'center',
  },
  locationButtonText: {
    color: '#FFD93B',
    fontSize: 15.6,
    fontWeight: '700',
  },
  locationPill: {
    backgroundColor: 'rgba(255, 217, 59, 0.09)',
    color: '#FFD93B',
    borderRadius: 13,
    paddingVertical: 5,
    paddingHorizontal: 15,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 13,
    alignSelf: 'center',
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  submitButton: {
    backgroundColor: '#FFD93B',
    borderRadius: 23,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#FFD93B',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#002949',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.25,
  },
});

export default ReportCrime;
