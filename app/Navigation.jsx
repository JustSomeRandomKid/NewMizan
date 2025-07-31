import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig.js';
import MainContainer from './MainContainer';
import LoginScreen from './screens/Login';
import messenger from './screens/Messenger';
import MyCases from './screens/MyCases.jsx';
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

    return unsubscribe; 
  }, []);

  
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
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        
        <>
          <Stack.Screen name="Main" component={MainContainer}  />
          <Stack.Screen name="Messenger" component={messenger} />
          <Stack.Screen name="Report" component={ReportCrime} />
          <Stack.Screen name="MyCases" component={MyCases} />
        </>
      ) : (
        
        <>
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;