import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

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
    flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Title Section */}
        <Text style={styles.mainTitle}>Follow-Up Assistance</Text>
   

      {/* Carousel Section */}
      <Animated.FlatList
        ref={flatListRef}
        data={organizations}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>

              <Image source={item.image} style={styles.cardImage} />

              <Text style={styles.summary}>{item.summary}</Text>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => setSelectedOrg(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.chatButtonText}>Chat</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.indicatorContainer}>
        {organizations.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.8}
              style={styles.indicatorTouchable}
            >
              <Animated.View style={[styles.indicator, { opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal for Selected Organization */}
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
    backgroundColor: '#04445E', // Light blue background
    paddingTop: 40,
    alignItems: 'center',
  },
  titleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#04445E', // Deep blue
    borderRadius: 12,
    width: '90%',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'Black', // Bright yellow
    textAlign: 'center',
    letterSpacing: 1,
  },
  flatListContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  cardWrapper: {
    width: width - 40,
    height:400,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  logoSmall: {
    width: 50,
    height: 50,
    borderRadius: 12,
    resizeMode: 'contain',
    marginRight: 15,
    backgroundColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#04445E',
    flexShrink: 1,
  },
  cardImage: {
    width: 200,
    height: 175,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  summary: {
    fontWeight: '600',
    fontSize: 18,
    color: '#04445E',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  chatButton: {
    marginTop: 20,
    backgroundColor: '#FFDE59', // Yellow button
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#FFDE59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  chatButtonText: {
    fontSize: 18,
    color: '#04445E', // Blue text
    fontWeight: 'bold',
    letterSpacing: 0.7,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorTouchable: {
    padding: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFDE59', // Yellow dots
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#04445E', // Blue border
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 68, 94, 0.85)', // Dark translucent blue overlay
    paddingHorizontal: 20,
  },
  modalContent: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#04445E',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 26,
  },
  closeButton: {
    backgroundColor: '#04445E',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFDE59',
    fontWeight: 'bold',
    letterSpacing: 0.7,
  },
});

export default OrganizationCarouselPage;
