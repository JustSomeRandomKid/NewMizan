import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native'; // Import StyleSheet for styling components
import IndexScreen from './screens/index';
import Organizations from './screens/Organizations';
import MyRights from './screens/MyRights';
import MyCases from './screens/MyCases';

// Create a Bottom Tab Navigator instance
const Tab = createBottomTabNavigator();

// Define styles for the tab icons
const styles = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
  },
});

// Main container for the tab navigation
function MainContainer() {
  return (
    <Tab.Navigator
      initialRouteName="Home" // Set the initial screen when the app loads
      screenOptions={({ route }) => ({
        // Define the tab bar icon for each screen
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          // Set icons based on the route name and whether the tab is focused
          if (route.name === 'Home') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector-1.png') // Active state icon for Home
              : require('../assets/images/Figma/Vector (3).png'); // Inactive state icon for Home
          } else if (route.name === 'Organizations') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (1).png') // Active state icon for Organizations
              : require('../assets/images/Figma/Vector-3.png'); // Inactive state icon for Organizations
          } else if (route.name === 'Resources') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (4).png') // Active state icon for Resources
              : require('../assets/images/Figma/Vector-2.png'); // Inactive state icon for Resources
          } else if (route.name === 'My Cases') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (2).png') // Active state icon for My Cases
              : require('../assets/images/Figma/Vector.png'); // Inactive state icon for My Cases
          }

          // Render the icon using the selected icon source
          return <Image source={iconSource} style={styles.icon} />;
        },
        // Customizing the appearance of the tab bar
        tabBarStyle: {
          backgroundColor: '#04445F', // Set background color of the tab bar
        },
        tabBarActiveTintColor: '#EAB82C', // Set color for the active tab
        tabBarInactiveTintColor: 'gray', // Set color for the inactive tabs
      })}
    >
      {/* Define the tabs and the components that are displayed for each tab */}
      <Tab.Screen name="Home" component={IndexScreen} />
      <Tab.Screen name="Organizations" component={Organizations} />
      <Tab.Screen name="Resources" component={MyRights} />
      <Tab.Screen name="My Cases" component={MyCases} />
    </Tab.Navigator>
  );
}

export default MainContainer;
