import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import BadgeComponent from '../components/Badge';

const Cases = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [cases, setCases] = useState([]);
  const [userID, setUserID] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchUserID = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserID(user.uid);
        fetchCases(user.uid);
      }
    };
    fetchUserID();
  }, []);

  const fetchCases = async (uid) => {
    const crimesRef = collection(db, 'crimes');
    const q = query(crimesRef, where('victimID', '==', uid));
    const querySnapshot = await getDocs(q);

    const formattedCases = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCases(formattedCases);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userID) {
      await fetchCases(userID);
    }
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "solved": return "#10B981";
      case "in progress": return "#3B82F6";
      case "pending": return "#F59E0B";
      case "closed": return "#6B7280";
      default: return "#F59E0B";
    }
  };

  const filteredCases = cases.filter(c => c.status?.toLowerCase() === selectedTab);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {["pending", "solved"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.segmentButton, selectedTab === tab && styles.segmentButtonActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.segmentText, selectedTab === tab && styles.segmentTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {filteredCases.length === 0 ? (
          <View style={styles.emptyState}>
            <Image source={require('../../assets/images/case.png')} style={styles.folderIcon} />
            <Text style={styles.emptyText}>no cases yet</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCases}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <View style={styles.caseCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.caseTitle}>{item.crime}</Text>
                  <BadgeComponent text={item.status} color={getStatusColor(item.status)} />
                </View>
                <Text style={styles.caseDescription}>{item.description}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    backgroundColor: '#042C44',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  logo: {
    width: 28,
    height: 28,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#042C44',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  segmentButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: 'white',
  },
  segmentText: {
    color: 'white',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#042C44',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    color: '#042C44',
    fontWeight: '600',
  },
  caseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  caseDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
});

export default Cases;
