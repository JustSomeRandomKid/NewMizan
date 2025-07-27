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
const CARD_WIDTH = screenWidth * 0.85;
const SIDE_PADDING = (screenWidth - CARD_WIDTH) / 2;

const organizations = [
  {
    id: '1',
    name: 'Mosawa',
    image: require('../../assets/images/Figma/Rectangle (2).png'),
    logo: require('../../assets/images/Figma/Rectangle (5).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Mosawa is awesome',
  },
  {
    id: '2',
    name: 'Sikuy',
    image: require('../../assets/images/Figma/Rectangle (3).png'),
    logo: require('../../assets/images/Figma/Rectangle (6).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Sikuy doesn’t suck',
  },
  {
    id: '3',
    name: 'Zazim',
    image: require('../../assets/images/Figma/Rectangle (4).png'),
    logo: require('../../assets/images/Figma/Rectangle (7).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Zazim is amazing',
  },
];

const OrganizationCarouselPage = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedOrg, setSelectedOrg] = useState(null);
  const flatListRef = useRef(null);

  const handleDotPress = (index) => {
    flatListRef.current?.scrollToOffset({ offset: index * CARD_WIDTH, animated: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Follow-Up Assistance</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={organizations}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + 20),
            index * (CARD_WIDTH + 20),
            (index + 1) * (CARD_WIDTH + 20),
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
                onPress={() => setSelectedOrg(item)}
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
              (index - 1) * (CARD_WIDTH + 20),
              index * (CARD_WIDTH + 20),
              (index + 1) * (CARD_WIDTH + 20),
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 15,
  },
  summary: {
    fontSize: 16,
    color: '#022D3A',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatButton: {
    marginTop: 20,
    backgroundColor: '#FFDE59',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 25,
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
    borderColor: '#022D3A',
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