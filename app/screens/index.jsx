import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig.js'; // Add your firebase config path


const IndexScreen = ({ navigation }) => {

  const [user, setUser] = useState("Friend");  // State to hold user information

  useEffect(() => {
    // Get the current authenticated user
    const currentUser = auth.currentUser;
    if(currentUser){
      setUser(currentUser.displayName || currentUser.email || "User");
    }
  }, []);

  const ReportPage = () => {
    navigation.navigate("Report")
  }
  const logout = () => {
    user.logout()
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userText}>Hello, {user}!</Text>
        <Text style={styles.subtitle}>Welcome back to Mizan!</Text>
        <TouchableOpacity style={'height:10,width:10'} onPress={logout}>Logout</TouchableOpacity>
      </View>
      
      <View style={styles.mainContent}>
        <Text style={styles.title}>Report Incidents{'\n'}Build Trust</Text>
        
        <TouchableOpacity onPress={ReportPage} style={styles.buttonContainer}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#EEBA2B']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Submit{'\n'}Report</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>How it works:</Text>
          <Text style={styles.description}>
            Help keep our community safe by reporting incidents quickly and securely.
          </Text>
          <Text style={styles.description}>
            Your identity is protected while authorities get the information they need.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#04445F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a2836',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    paddingTop: 20,
  },
  userText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#B0C4DE',
    fontSize: 16,
    fontWeight: '400',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 40,
  },
  buttonGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4, // This creates the gradient border
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
  },
  buttonInner: {
    flex: 1,
    backgroundColor: '#0a2836', // Same as background color
    borderRadius: 66, // Slightly smaller to show gradient border
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  descriptionContainer: {
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  descriptionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    color: '#E6E6FA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default IndexScreen;