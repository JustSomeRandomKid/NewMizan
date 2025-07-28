import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import BadgeComponent from '../components/Badge';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch the user session when the component mounts
  useEffect(() => {
    fetchUserID();
  }, []);

  // Fetch the current user's ID and then retrieve their cases
  const fetchUserID = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserID(currentUser.uid);
        fetchCases(currentUser.uid);
      } else {
        setError("No user session found."); // Set error if no user is logged in
      }
    } catch (error) {
      setError("Error fetching user session."); // Set error if session fetching fails
    }
  };

  // Fetch the list of cases associated with the given user ID
  const fetchCases = async (userId) => {
    try {
      setError(null); // Clear any previous errors
      
      // Create a query to get documents where victimID equals the current user's ID
      const crimesRef = collection(db, 'crimes');
      const q = query(crimesRef, where('victimID', '==', userId));
      
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      // Format the documents
      const formattedCases = querySnapshot.docs.map(doc => ({
        id: doc.id,
        crimeTitle: doc.data().crime,
        crimeDescription: doc.data().description,
        crimeDate: doc.data().date,
        status: doc.data().status || "Pending", // Use status from Firestore or default to "Pending"
        location: doc.data().location,
      }));
      
      // Sort cases by date (newest first)
      formattedCases.sort((a, b) => new Date(b.crimeDate) - new Date(a.crimeDate));
      
      setCases(formattedCases); // Set the formatted cases to the state
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError("Failed to fetch cases. Please try again."); // Set error message if fetching cases fails
    }
  };

  // Function to determine badge color based on the status of the case
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "solved":
        return "#10B981"; // Green
      case "in progress":
        return "#3B82F6"; // Blue
      case "pending":
        return "#F59E0B"; // Amber
      case "closed":
        return "#6B7280"; // Gray
      default:
        return "#F59E0B"; // Default amber color
    }
  };

  // Function to refresh cases
  const onRefresh = async () => {
    setRefreshing(true);
    if (userID) {
      await fetchCases(userID);
    }
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderCaseItem = ({ item }) => (
    <View style={styles.caseCard}>
      <View style={styles.caseHeader}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="report-problem" size={20} color="#FFD700" />
          <Text style={styles.caseTitle}>{item.crimeTitle}</Text>
        </View>
        <BadgeComponent text={item.status} color={getStatusColor(item.status)} />
      </View>
      
      <Text style={styles.caseDescription} numberOfLines={3}>
        {item.crimeDescription}
      </Text>
      
      <View style={styles.caseFooter}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-today" size={16} color="#B0C4DE" />
          <Text style={styles.dateText}>Filed: {formatDate(item.crimeDate)}</Text>
        </View>
        {item.location && (
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color="#B0C4DE" />
            <Text style={styles.locationText}>Location recorded</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="folder-open" size={80} color="#4A5568" />
      <Text style={styles.emptyTitle}>No Cases Found</Text>
      <Text style={styles.emptyDescription}>
        You haven't filed any reports yet. Your submitted cases will appear here.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <MaterialIcons name="refresh" size={20} color="#0a2836" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cases</Text>
        <Text style={styles.headerSubtitle}>
          {cases.length} {cases.length === 1 ? 'case' : 'cases'} on file
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={renderCaseItem}
        ListEmptyComponent={!error ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a2836',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B0C4DE',
    fontWeight: '400',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  caseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  caseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#B0C4DE',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#0a2836',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Cases;