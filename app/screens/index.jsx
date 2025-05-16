import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { config, database, account } from '../../lib/appwrite';  // Import the account module to interact with Appwrite services
import * as Location from "expo-location";  // Import the location module to access device location
import Ionicons from 'react-native-vector-icons/Ionicons';  // Import Ionicons for icon usage

const IndexScreen = () => {
  const [crimes, setCrimes] = useState([]);  // State to hold the list of crimes
  const [error, setError] = useState(null);  // State to hold error information
  const [crimeTitle, setCrimeTitle] = useState('');  // State to hold the title of the crime being reported
  const [crimeDescription, setCrimeDescription] = useState('');  // State to hold the description of the crime
  const [crimeDate, setCrimeDate] = useState('');  // State to hold the date of the crime incident
  const [location, setLocation] = useState(null);  // State to store the location coordinates
  const [region, setRegion] = useState(null);  // State to store the region information (latitude/longitude)
  const [user, setUser] = useState({ name: "Friend" });  // State to hold user information (replace with actual user data)

  useEffect(() => {
    init();  // Initialize the component and fetch data when it loads
  }, []);

  const init = async () => {
    getData();  // Fetch crime data from the database when the component mounts
  };

  // Function to fetch crime data from the database
  const getData = async () => {
    try {
      const { documents, total } = await database.listDocuments(config.db, config.col.crimes);  // Get list of crimes from the database
      setCrimes(documents);  // Store the fetched crimes in the state
      console.log(documents);  // Log the fetched documents for debugging
    } catch (error) {
      setError(error);  // Handle any errors while fetching data
    }
  };

  // Function to fetch the current user's ID from the Appwrite session
  const getUserID = async () => {
    try {
      const session = await account.getSession('current');  // Get the current session from Appwrite
      return session.userId;  // Return the user ID from the session
    } catch (error) {
      console.error("Error fetching user ID:", error);  // Log error if unable to fetch user ID
      return null;
    }
  };

  // Function to request location permissions and get the current location
  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();  // Request permission to access location
    if (status !== "granted") {
      Alert.alert("Permission denied", "Enable location services to use this feature.");  // Show an alert if permission is denied
      return;
    }

    const location = await Location.getCurrentPositionAsync({});  // Get the current location coordinates
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,  // Set the region boundaries for the map
      longitudeDelta: 0.05,
    });
    setLocation(location.coords);  // Store the location coordinates
  };

  // Function to handle the crime report submission
  const handleSubmit = async () => {
    if (!crimeTitle || !crimeDescription || !crimeDate || !location) {
      Alert.alert("Error", "Please fill in all fields before submitting.");  // Alert if any required fields are missing
      return;
    }

    const userId = await getUserID();  // Get the authenticated user's ID
    if (!userId) {
      Alert.alert("Error", "Could not fetch user ID.");  // Alert if unable to get user ID
      return;
    }

    try {
      const response = await database.createDocument(  // Create a new crime report document in the database
        config.db,
        config.col.crimes,
        'unique()',  // Generate a unique ID for the new document
        {
          crime: crimeTitle,
          description: crimeDescription,
          date: crimeDate,
          latitude: location.latitude,  // Store the latitude of the location
          longitude: location.longitude,  // Store the longitude of the location
          victimID: userId,  // Store the user ID as the victim's ID
        }
      );

      Alert.alert("Success", "Your crime report has been submitted. Our team will review it and get back to you.");  // Show success message
      setCrimeTitle('');  // Clear the form fields after submission
      setCrimeDescription('');
      setCrimeDate('');
      setLocation(null);
      getData();  // Refresh the data to show the new report

    } catch (error) {
      Alert.alert("Error", "Failed to submit crime report.");  // Show error message if submission fails
      console.error(error);  // Log the error for debugging
    }
  };

  return (
    <View style={styles.container}>
      {/* Blue banner */}
      <View style={styles.banner}>
        <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}</Text>  {/* Display the welcome message with the user's name */}
      </View>

      {/* Report a Crime Section with custom icon */}
      <View style={styles.reportSection}>
        <Image source={require('../../assets/images/Figma/Vector (5).png')} style={styles.icon} />  {/* Crime report icon */}
        <Text style={styles.reportTitle}>Report a Crime</Text>
      </View>

      {/* Form Box for submitting crime reports */}
      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Crime Title"
          value={crimeTitle}
          onChangeText={setCrimeTitle}  // Update state when text changes
        />
        <TextInput
          style={[styles.input, styles.description]}
          placeholder="Describe the crime"
          multiline
          value={crimeDescription}
          onChangeText={setCrimeDescription}  // Update state when description changes
        />
        <TextInput
          style={styles.input}
          placeholder="Date of Incident (YYYY-MM-DD)"
          value={crimeDate}
          onChangeText={setCrimeDate}  // Update state when date changes
        />

        {/* Add Location Button with Icon */}
        <TouchableOpacity style={styles.locationButton} onPress={getUserLocation}>
          <Ionicons name="location-outline" size={20} color="#fff" style={styles.icon} />  {/* Location icon */}
          <Text style={styles.locationButtonText}>Add Location</Text>  {/* Button text */}
        </TouchableOpacity>

        {location && (
          <Text style={styles.locationText}>
            Location added: Latitude: {location.latitude}, Longitude: {location.longitude}  {/* Display the added location */}
          </Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  banner: {
    backgroundColor: "#04445E",  // Blue banner color
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: "#EAB82C",  // Yellow text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  reportTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#04445E',  // Blue color for the text
  },
  formBox: {
    backgroundColor: "#04445E",  // Blue form box color
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#8F8E8E',  // Gray background color for inputs
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  description: {
    height: 120,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#EAB82C',  // Yellow button color
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    flexDirection: 'row',  // Align icon and text in a row
    marginBottom: 10,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,  // Space between the icon and the text
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#fff',  // White submit button color
    padding: 18,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#04445E',  // Blue text color
  },
});

export default IndexScreen;
