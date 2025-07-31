import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  keyExtractor,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

const ReportCrime = ({ navigation }) => {
  const [crime, setCrime] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [victimID, setVictimID] = useState('');
  const [location, setLocation] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const crimeOptions = [
    'Domestic Violence',
    'Sexual Harassment / Assault',
    'Police Misconduct',
    'LGBTQ+ Harassment',
    'Hate Crime',
    'Violent Crime',
    'Other',
  ];
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isMediaModalVisible, setMediaModalVisible] = useState(false);

  useEffect(() => {
    fetchUserID();
    setDate(getTodayDate());  // Set date to today on load
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = today.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

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

  const renderAttachments = ({ item, index }) => (
    <View style={styles.noFilesContainer}>
      <MaterialIcons
        name= 'photo'
        size={18}
        color="#FFD93B"
      />
      <Text>{item.name}</Text>
      <Pressable onPress={() => removeAttachment(index)}>
      <MaterialIcons name="cancel" size={20} color="grey" />
    </Pressable>
    </View>
  )

        const removeAttachment = (indexToRemove) => {
          setAttachments((prev) =>
        prev.filter((_, index) => index !== indexToRemove)
      );
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
  const handleOpenCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if(status !== 'granted'){
      Alert.alert('Unable to open camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if(!result.canceled) {
      const asset = result.assets[0];
      setAttachments([...attachments, { uri: asset.uri, name: asset.fileName || asset.uri.split('/').pop() }])
    }

  };

  const handleOpenGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if ( status !== 'granted') {
      Alert.alert('Unable to open gallery.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ selectionLimit: 0});
    if (!result.canceled){
      const asset = result.assets[0];
      setAttachments([...attachments, {uri: asset.uri, name: asset.fileName || asset.uri.split('/').pop() }]);
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
      Vibration.vibrate();
      navigation.navigate('MyCases');
      setCrime('');
      setDescription('');
      setDate(getTodayDate()); 
      setLocation(null);
      setDropdownOpen(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to report crime. Please try again.');
    }

  };

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#022D3A' }}>
      <View>
        <TouchableOpacity onPress={navigation.navigate("Home")} style={styles.backButton}>
          <MaterialIcons
          name="arrow-back"
          size={40}
          color="grey"
          />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.outer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
        <View style={styles.headerWrap}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="shield-alt" size={28} color="#FFD93B" />
          </View>
          <Text style={styles.pageTitle}>Report a Crime</Text>
          <Text style={styles.pageSubtitle}>
            Your report helps us make a difference. Please fill out the details
            below.
          </Text>
        </View>
        <View style={styles.card}>
          {/* --- TYPE OF CRIME --- */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Type of Crime</Text>
            <View
              style={[styles.inputRow, { justifyContent: 'space-between' }]}
            >
              <MaterialIcons
                name="report"
                size={22}
                color="#FFD93B"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={styles.simpleDropdown}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !crime && { color: '#B5B9C7' },
                  ]}
                >
                  {crime || 'Select a category...'}
                </Text>
                <MaterialIcons
                  name={dropdownOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
                  size={24}
                  color="#FFD93B"
                />
              </TouchableOpacity>
            </View>

            {dropdownOpen && (
              <View style={styles.dropdownList}>
                {crimeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCrime(option);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* --- DESCRIPTION --- */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputRow, styles.multilineRow]}>
              <MaterialIcons
                name="description"
                size={22}
                color="#FFD93B"
                style={styles.inputIcon}
              />
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
              <MaterialIcons
                name="calendar-today"
                size={20}
                color="#FFD93B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#B5B9C7"
              />
            </View>
          </View>
          <View style={styles.buttonsParent}>
            {/* --- LOCATION BUTTON --- */}
            <TouchableOpacity
              style={[
                styles.locationButton,
                !!location && { backgroundColor: '#FFD93B' },
              ]}
              onPress={() => setLocationModalVisible(true)}
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
            <TouchableOpacity style={styles.attachmentsButton} onPress={() => setMediaModalVisible(true)}>
              <MaterialIcons name="upload"
              size={18}
              color='#FFD93B'
              style={{ marginRight: 8 }} 
              />
                <Text style={styles.attachmentsButtonText}>Add Files</Text>
            </TouchableOpacity>
          </View>
          {location && (
            <Text style={styles.locationPill}>
              {`Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`}
            </Text>
          )}

          {/* --- SUBMIT BUTTON --- */}
          <TouchableOpacity
  onPress={handleReportCrime}
  activeOpacity={0.92}
  style={{
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
  }}
>

            <Text style={{ color: '#002949', fontSize: 18, fontWeight: '900' }}>Submit Report</Text>

          </TouchableOpacity>
        </View>
      </ScrollView>
          {/* Modal for uploading media*/}
      <Modal
        visible={isMediaModalVisible}
        transparent
        animationType= 'fade'
        onRequestClose={()=>setMediaModalVisible(false)}
      >
        <View style={styles.mediaModalOverlay}>
          <View style={styles.mediaModalContent}>
            {/* Add actual flatlist for displaying uploaded files*/}
            <FlatList 
            data={attachments}
            renderItem={renderAttachments}
            keyExtractor={keyExtractor}
            horizontal={false}
            ListEmptyComponent={() => <View style={styles.noFilesContainer}><Image source={require('../../assets/images/case.png')} style={styles.noFilesIcon}/><Text> No files added</Text></View>}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} /> } 
            
            />
            <View style={styles.modalOptionButtons}>
              <TouchableOpacity style={[styles.optionButton, {marginRight: 20}]} onPress={handleOpenCamera} >
      <Text style={styles.optionText}>Camera</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.optionButton}  onPress={handleOpenGallery} >
      <Text style={styles.optionText}>Gallery</Text>
    </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.cancelButton} onPress={()=> setMediaModalVisible(false)}>
      <Text style={styles.cancelText}>Done</Text>
    </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLocationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => {
                setLocationModalVisible(false);
                setAddressInput('');
              }}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1,
                padding: 5,
              }}
            >
              <Text style={{ fontSize: 18, color: '#444' }}>✖</Text>
            </TouchableOpacity>


            <Text style={styles.modalTitle}>Choose Location Method</Text>
            <TouchableOpacity
              style={[styles.optionButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
              onPress={async () => {
                setLocationModalVisible(false);
                try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required.');
                    return;
                  }
                  const currentLocation = await Location.getCurrentPositionAsync({});
                  setLocation(currentLocation.coords);
                } catch (error) {
                  Alert.alert('Error', 'Failed to get current location.');
                }
              }}
            >
              <Text style={styles.optionButtonText}>My Location</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Enter address"
              placeholderTextColor="#888"
              style={styles.addressInput}
              value={addressInput}
              onChangeText={setAddressInput}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={async () => {
                if (!addressInput.trim()) {
                  Alert.alert('Please enter an address.');
                  return;
                }
                try {
                  const results = await Location.geocodeAsync(addressInput);
                  if (results.length > 0) {
                    const coords = results[0];
                    setLocation({ latitude: coords.latitude, longitude: coords.longitude });
                    setLocationModalVisible(false);
                    setAddressInput('');
                  } else {
                    Alert.alert('Address not found.');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to geocode address.');
                }
              }}
            >
              <Text style={styles.submitButtonText}>submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 10,
    ...Platform.select({
      ios: { shadowColor: '#FFD93B', shadowOpacity: 0.09, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  simpleDropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002949',
  },
  dropdownList: {
    backgroundColor: '#FDFDFD',
    borderRadius: 12,
    marginTop: 5,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#FFD93B',
    shadowColor: '#FFD93B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#002949',
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
  multilineRow: {
    alignItems: 'flex-start',
    paddingTop: 10,
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
  buttonsParent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  attachmentsButton: {
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
    marginLeft: 10,
    alignSelf: 'center',
  },
  attachmentsButtonText: {
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
  mediaModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // semi‑transparent dark backdrop
    justifyContent: 'center',               // vertically center
    alignItems: 'center',                   // horizontally center
  },
  mediaModalContent: {
    width: '90%',               // box covers ~80% of screen width
    padding: 20,
    backgroundColor: '#FFF',    // white background for contrast
    borderRadius: 12,
    alignItems: 'stretch',      // children take full width
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00465B',
  },
  optionButton: {
    width: '100%',
    backgroundColor: '#007B8A',
    paddingVertical: 50,
    borderRadius: 100,
    marginBottom: 100,
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#FFD93B',
    fontSize: 16,
    fontWeight: '600',
    alignItems: 'center',

  },
  addressInput: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#00465B',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFD93B',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ccc',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionButton: {
    width: 140,
    paddingVertical: 12,
    marginVertical: 4,
    backgroundColor: '#022D3A',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    color: '#FFD93B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFilesIcon: {
    height: 25,
    width: 25
  },
  noFilesContainer: {
    flexDirection: 'row'
  },
  backButton: {
    position: 'absolute',
    marginTop: 30,
    marginLeft: 20,
    borderRadius: 20
  }

});

export default ReportCrime;
