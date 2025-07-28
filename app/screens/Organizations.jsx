import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.78; // Smaller width to reveal adjacent cards
const SIDE_PADDING = (screenWidth - CARD_WIDTH) / 2;
const SPACING = 20;

const organizations = [
  {
    id: '1',
    name: 'Mosawa',
    image: require('../../assets/images/Figma/Rectangle (2).png'),
    logo: require('../../assets/images/Figma/Rectangle (5).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'The Mossawa Center, the Advocacy Center for Palestinian Arab citizens of Israel, was established in 1999 to promote the economic, social, cultural, and political rights of the Palestinian Arab minority in Israel and the recognition of this community as a national indigenous minority.',
  },
  {
    id: '2',
    name: 'Sikuy',
    image: require('../../assets/images/Figma/Rectangle (3).png'),
    logo: require('../../assets/images/Figma/Rectangle (6).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Sikkuy-Aufoq is a shared Jewish and Arab nonprofit organization that works to advance equality and partnership between the Arab-Palestinian citizens of Israel – descendants of those who remained within the Israeli borders after the founding of the state in 1948 – and the country’s Jewish citizens.',
  },
  {
    id: '3',
    name: 'Zazim',
    image: require('../../assets/images/Figma/Rectangle (4).png'),
    logo: require('../../assets/images/Figma/Rectangle (7).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Zazim is the largest campaigning community in Israel with over 400,000 members. We are a civic movement of Arabs and Jews, working together for democracy and equality and promoting active civic engagement. ',
  },
];

const OrganizationCarouselPage = ({navigation}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedOrg, setSelectedOrg] = useState(null);
  const flatListRef = useRef(null);

  const handleDotPress = (index) => {
    flatListRef.current?.scrollToOffset({ offset: index * (CARD_WIDTH + SPACING), animated: true });
  };

  const openNGOChat = (NGO) => {
    setSelectedOrg(NGO)
    navigation.navigate("Messenger")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Follow-Up Assistance</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={organizations}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingLeft: SIDE_PADDING - (SPACING / 2),
          paddingRight: SIDE_PADDING,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}> 
              <Image source={item.image} style={styles.cardImage} />
              <Text style={styles.summary}>{item.summary}</Text>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => openNGOChat(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      <View style={styles.indicatorContainer}>
        {organizations.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * (CARD_WIDTH + SPACING),
              index * (CARD_WIDTH + SPACING),
              (index + 1) * (CARD_WIDTH + SPACING),
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
              style={styles.indicatorTouchable}
            >
              <Animated.View style={[styles.indicator, { opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedOrg && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedOrg}
          onRequestClose={() => setSelectedOrg(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={selectedOrg.logo} style={styles.logoSmall} />
              <Text style={styles.modalTitle}>{selectedOrg.name}</Text>
              <Text style={styles.modalDescription}>{selectedOrg.description}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedOrg(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#022D3A',
    paddingTop: 50,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFDE59',
    textAlign: 'center',
    marginBottom: 30,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    backgroundColor: '#075d75ff',
    borderRadius: 24,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: SPACING / 3, // slightly less margin to reveal more of the sides
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 15,
  },
  summary: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatButton: {
    marginTop: 20,
    backgroundColor: '#FFDE59',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#022D3A',
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorTouchable: {
    padding: 6,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFDE59',
    borderWidth: 2,
    borderColor: '#4c91a6ff',
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: screenWidth - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#022D3A',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#022D3A',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFDE59',
    fontWeight: '600',
  },
});

export default OrganizationCarouselPage;