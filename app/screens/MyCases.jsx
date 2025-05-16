import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { account, config, database } from '../../lib/appwrite'; // Import the account module
import BadgeComponent from '../components/Badge'; // Custom Badge component
import CardComponent from '../components/Card'; // Assuming CardComponent is in 'components' folder

const Cases = () => {
  const [cases, setCases] = useState([]);  // Stores the list of cases
  const [error, setError] = useState(null);  // Error state for displaying errors
  const [userID, setUserID] = useState(null); // Stores the user ID to fetch relevant cases

  // Fetch the user session when the component mounts
  useEffect(() => {
    fetchUserID();
  }, []);

  // Fetch the current user's ID and then retrieve their cases
  const fetchUserID = async () => {
    try {
      const session = await account.getSession('current');  // Fetch the current session
      setUserID(session.userId);  // Set the user ID state
      fetchCases(session.userId); // Fetch the cases associated with this user
    } catch (error) {
      setError("Error fetching user session."); // Set error if session fetching fails
    }
  };

  // Fetch the list of cases associated with the given user ID
  const fetchCases = async (userId) => {
    try {
      const { documents } = await database.listDocuments(config.db, config.col.crimes); // Retrieve crime cases
      const filteredCases = documents.filter(doc => doc.victimID === userId); // Filter by victim ID
      const formattedCases = filteredCases.map(doc => ({
        id: doc.$id,
        crimeTitle: doc.crime,
        crimeDescription: doc.description,
        crimeDate: doc.date,
        status: "Pending", // Default status until updated
      }));
      setCases(formattedCases); // Set the formatted cases to the state
    } catch (error) {
      setError(error.message); // Set error message if fetching cases fails
    }
  };

  // Function to determine badge color based on the status of the case
  const getStatusColor = (status) => {
    switch (status) {
      case "solved":
        return "#D1D5DB"; // Yellow
      case "In Progress":
        return "#EAB82C"; // Blue
      case "Pending":
        return "#FFD700"; // Gray
      default:
        return "#D1D5DB"; // Default color for unknown status
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cases</Text>
      {error && <Text style={styles.errorText}>{error}</Text>} {/* Show error message if there's an error */}
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id} // Use unique ID for key
        renderItem={({ item }) => (
          <CardComponent title={item.crimeTitle} description={item.crimeDescription}>
            <View style={styles.cardFooter}>
              <Text style={styles.dateText}>Filed: {String(item.crimeDate)}</Text>
              <BadgeComponent text={item.status} color={getStatusColor(item.status)} /> {/* Render badge with status color */}
            </View>
          </CardComponent>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 36, // Larger font size for the header
    fontWeight: 'bold',
    marginBottom: 50,
    backgroundColor: '#04445E', // Dark blue background
    color: 'white', // White text color for contrast
    paddingVertical: 40,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  cardFooter: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
});

export default Cases;
