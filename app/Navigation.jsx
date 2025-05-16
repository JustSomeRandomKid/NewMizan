import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './screens/Signup';
import LoginScreen from './screens/Login';
import MainContainer from './MainContainer'; // Import the tab navigator

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="Signup">
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainContainer} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default Navigation;