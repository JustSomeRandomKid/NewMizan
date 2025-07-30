import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebaseConfig.js';

const IndexScreen = ({ navigation }) => {
  const [user, setUser] = useState("Friend");

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser.displayName || currentUser.email || "User");
    }
  }, []);

  const handleReport = () => navigation.navigate("Report");

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.navigate("Main"))
      .catch((error) => console.error(error));
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#143c4a', '#0a2c38']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.userText}>Hello, {user}!</Text>
          <Text style={styles.subtitle}>Welcome back to Mizan</Text>
        </LinearGradient>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#ffd02b" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Report Incidents</Text>
        <Text style={styles.tagline}>Build Trust</Text>

        <TouchableOpacity
          onPress={handleReport}
          activeOpacity={0.9}
          style={styles.buttonWrapper}
        >
          {/* The outer gradient now acts more like a subtle bevel */}
          <LinearGradient
            colors={['#ffd02b', '#ffde59']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* The main button face is now lighter and has a top highlight */}
            <LinearGradient
              colors={['#2a5a6a', '#1a4c5a']} // CHANGE 1: Lighter, more vibrant blue/teal gradient
              style={styles.buttonInner}
            >
              <Ionicons name="shield-checkmark-outline" size={48} color="#ffd02b" style={styles.iconDimmed} />
              <Text style={styles.buttonText}>Submit Report</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.description}>
          Help keep our community safe by reporting incidents quickly and securely.
        </Text>
      </View>
    </View>
  );
};

const BUTTON_SIZE = 200;
const BUTTON_RADIUS = BUTTON_SIZE / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a2c38',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 16,
  },
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: '#123f4f',
  },
  userText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#ffd02b',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 22,
    color: '#ffd02b',
    fontWeight: '600',
    marginBottom: 40, // Increased margin
  },
  buttonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    // CHANGE 2: Using a darker, more realistic drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Shadow is cast downwards
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16, // For Android
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3, // A smaller padding for a tighter bevel
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_RADIUS - 3,
    justifyContent: 'center',
    alignItems: 'center',
    // CHANGE 3: A bright top border to simulate light hitting the edge
    borderWidth: 2,
    borderColor: '#4a7a8a', // A lighter shade of the button's new BG
    paddingHorizontal: 12,
  },
  iconDimmed: {
    opacity: 0.8, // Slightly more visible icon
    marginBottom: 4,
  },
  buttonText: {
    color: '#FFDE59',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: '#ffffffcc',
    fontSize: 15.5,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 280,
  },
});

export default IndexScreen;