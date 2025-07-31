import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebaseConfig.js';


const IndexScreen = ({ navigation }) => {
  const [user, setUser] = useState('Friend');
  const glowAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser.displayName || currentUser.email || 'User');
    }


    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.18,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  const handleReport = () => {

    navigation.navigate('Report');
  };


  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.navigate('Main'))
      .catch((error) => console.error(error));
  };


  return (
    <LinearGradient
      colors={['#0a2c38', '#112b3c']}
      style={styles.screen}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />


      {/* Banner Header */}
      <LinearGradient
        colors={['#143c4a', '#157798ee', '#112b3c']}
        start={{ x: 0.07, y: 0.2 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <BlurView intensity={50} tint="dark" style={styles.headerBox}>
          <View style={styles.headerLeft}>
            <Ionicons name="shield-checkmark-outline" size={28} color="#ffd02b" />
            <View>
              <Text numberOfLines={1} style={styles.helloText}>
                Hello, {user} 👋
              </Text>
              <Text style={styles.subText}>You’re Safe at MIZAN</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} hitSlop={12}>
            <Ionicons name="log-out-outline" size={26} color="#ffd02b" />
          </TouchableOpacity>
        </BlurView>
      </LinearGradient>


      {/* Stats Row */}
      <View style={styles.stats}>
        <Stat icon="document-text-outline" text="3,000" description="Reports" />
        <Stat icon="checkmark-circle-outline" text="92%" description="Resolved" />
        <Stat icon="time-outline" text="24h" description="Avg Time" />
      </View>


      <Text style={styles.tagline}>Building trust, one case at a time</Text>


      {/* Report Button */}
      <View style={styles.buttonArea}>
        {/* Glow behind button */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowCircle,
            {
              transform: [{ scale: glowAnim }],
              opacity: glowAnim.interpolate({
                inputRange: [1, 1.18],
                outputRange: [0.18, 0.33],
              }),
            },
          ]}
        />


        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <TouchableOpacity
  activeOpacity={1}
  onPressIn={() => {
    Animated.spring(bounceAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }}
  onPressOut={() => {
  Animated.timing(bounceAnim, {
    toValue: 1,
    duration: 150,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }).start(({ finished }) => {
    if (finished) {
      navigation.navigate('Report');
    }
  });
}}

  style={styles.touchableButton}
>
  <LinearGradient
    colors={['#ffd02baa', 'rgba(10,44,56,0.85)', 'transparent']}
    style={styles.buttonRing}
    start={{ x: 0.5, y: 0.5 }}
    end={{ x: 1, y: 1 }}
  >
    <BlurView intensity={65} tint="dark" style={styles.buttonGlass}>
      <View style={styles.buttonGradient}>
        <Text style={styles.buttonText}>REPORT</Text>
      </View>
    </BlurView>
  </LinearGradient>
</TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};


const Stat = ({ icon, text, description }) => (
  <BlurView intensity={48} tint="dark" style={styles.statCard}>
    <Ionicons name={icon} size={25} color="#ffd02b" style={{ marginBottom: 2 }} />
    <Text style={styles.statValue}>{text}</Text>
    <Text style={styles.statDesc}>{description}</Text>
  </BlurView>
);


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 52,
    paddingHorizontal: 18,
    backgroundColor: '#100c24',
  },
  bannerGradient: {
    borderRadius: 23,
    marginBottom: 18,
    shadowColor: '#113c4a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
  },
  headerBox: {
    flexDirection: 'row',
    borderRadius: 23,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#183c4ad8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  helloText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: 0.1,
  },
  subText: {
    color: '#ffd02b',
    fontWeight: '500',
    fontSize: 13,
    marginTop: -2,
    letterSpacing: 0.03,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 11,
    alignItems: 'center',
    backgroundColor: '#ffffff13',
    borderWidth: 0.7,
    borderColor: '#fff1',
    shadowColor: '#ffd02baa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    marginVertical: 3,
  },
  statValue: {
    color: '#ffd02b',
    fontWeight: 'bold',
    fontSize: 16.5,
    marginBottom: -1,
    textShadowColor: '#0002',
    textShadowRadius: 3,
  },
  statDesc: {
    color: '#dce6ea',
    fontSize: 11.7,
    fontWeight: '600',
    letterSpacing: 0.04,
    textAlign: 'center',
  },
  tagline: {
    color: '#bdc7d3',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 28,
    textShadowColor: '#0003',
    textShadowRadius: 3,
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    marginBottom: 38,
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    width: 210,
    height: 210,
    borderRadius: 105,
    marginLeft: -105,
    marginTop: -105,
    backgroundColor: '#ffd02b',
    opacity: 0.21,
    shadowColor: '#ffd02bba',
    shadowRadius: 36,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 0,
  },
  touchableButton: {
    zIndex: 1,
  },
  buttonRing: {
    width: 194,
    height: 194,
    borderRadius: 97,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    shadowColor: '#ffd02baa',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.17,
    shadowRadius: 18,
  },
  buttonGlass: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    backgroundColor: '#0a2836',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffd02b39',
    borderWidth: 0.8,
    elevation: 10,
  },
  buttonGradient: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a2836',
  },
  buttonText: {
    color: '#ffd02b',
    fontSize: 35,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1.1,
    textShadowColor: '#00000044',
    textShadowRadius: 4,
    textTransform: 'uppercase',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-condensed',
    }),
  },
});


export default IndexScreen;
