import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import IndexScreen from './screens/index';
import Messenger from './screens/Messenger';
import MyCases from './screens/MyCases';
import MyRights from './screens/MyRights';
import Organizations from './screens/Organizations';


const Tab = createBottomTabNavigator();


const styles = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
  },
});

function MainContainer() {
  return (
    <Tab.Navigator
      initialRouteName="Home" 
      screenOptions={({ route }) => ({
        headerShown: false,
        
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          
          if (route.name === 'Home') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector-1.png') 
              : require('../assets/images/Figma/Vector (3).png'); 
          } else if (route.name === 'NGOs') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (1).png')
              : require('../assets/images/Figma/Vector-3.png'); 
          } else if (route.name === 'Resources') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (4).png') 
              : require('../assets/images/Figma/Vector-2.png'); 
          } else if (route.name === 'My Cases') {
            iconSource = focused 
              ? require('../assets/images/Figma/Vector (2).png') 
              : require('../assets/images/Figma/Vector.png');
          } else if (route.name === 'Messenger') {
            iconSource = focused 
              ? require('../assets/images/Figma/message.png')
              : require('../assets/images/Figma/message.png'); 
          }

          
          return <Image source={iconSource} style={styles.icon} />;
        },
        
        tabBarStyle: {
          backgroundColor: '#04445F', 
        },
        tabBarActiveTintColor: '#EAB82C', 
        tabBarInactiveTintColor: 'gray', 
      })}
    >
      <Tab.Screen name="Home" component={IndexScreen} />
      <Tab.Screen name="NGOs" component={Organizations} />
      <Tab.Screen name="Resources" component={MyRights} />
      <Tab.Screen name="MyCases" component={MyCases} />
      <Tab.Screen name ="Messenger" component={Messenger} />
      
    </Tab.Navigator>
  );
}

export default MainContainer;
