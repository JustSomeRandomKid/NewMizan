import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainContainer from './MainContainer'; // Import the tab navigator
import LoginScreen from './screens/Login';
import messenger from './screens/Messenger';
import SignupScreen from './screens/Signup';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="Signup">
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainContainer} options={{ headerShown: false }} />
      <Stack.Screen name="Messenger" component={messenger} />
    </Stack.Navigator>
  );
};

export default Navigation;