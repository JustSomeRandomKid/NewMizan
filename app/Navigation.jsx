import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig.js'; // Your firebase config
import MainContainer from './MainContainer'; // Import the tab navigator
import LoginScreen from './screens/Login';
import messenger from './screens/Messenger';
import ReportCrime from './screens/ReportScreen';
import SignupScreen from './screens/Signup';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={user ? "Main" : "Signup"}
      screenOptions={{ headerShown: true }}
    >
      {user ? (
        // Screens for authenticated users
        <>
          <Stack.Screen 
            name="Main" 
            component={MainContainer} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen name="Messenger" component={messenger} />
          <Stack.Screen name="Report" component={ReportCrime} />

        </>
      ) : (
        // Screens for non-authenticated users
        <>
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;