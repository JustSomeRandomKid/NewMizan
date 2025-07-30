import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.78;
const SIDE_PADDING = (screenWidth - CARD_WIDTH) / 2;
const SPACING = 20;

const organizations = [
  {
    id: '1',
    name: 'Mosawa',
    image: require('../../assets/images/Figma/Rectangle (2).png'),
    logo: require('../../assets/images/Figma/Rectangle (5).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'The Mossawa Center promotes economic, social, cultural, and political rights of Palestinian Arab citizens in Israel and advocates recognition as a national indigenous minority.',
  },
  {
    id: '2',
    name: 'Sikuy',
    image: require('../../assets/images/Figma/Rectangle (3).png'),
    logo: require('../../assets/images/Figma/Rectangle (6).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Sikkuy-Aufoq is a shared Jewish-Arab nonprofit advancing equality and partnership between Arab-Palestinian citizens and Jewish citizens of Israel.',
  },
  {
    id: '3',
    name: 'Zazim',
    image: require('../../assets/images/Figma/Rectangle (4).png'),
    logo: require('../../assets/images/Figma/Rectangle (7).png'),
    description: 'whatsapp: +972 053-924-052',
    summary: 'Zazim is a civic movement of Arabs and Jews in Israel, working for democracy and equality through campaigns with over 400,000 members.',
  },
];

const lawyers = [
  {
    id: 'lawyer1',
    name: 'Adv. Sarah Chen',
    specialty: 'Human Rights Law',
    contact: 'sarah.chen@lawfirm.com',
    contactType: 'email',
  },
  {
    id: 'lawyer2',
    name: 'Adv. Omar Said',
    specialty: 'Civil Rights & Discrimination',
    contact: '1-800-555-0102',
    contactType: 'phone',
  },
  {
    id: 'lawyer3',
    name: 'Adv. Yael Levi',
    specialty: 'Immigration & Refugee Law',
    contact: 'yael.levi@lawfirm.com',
    contactType: 'email',
  },
];

const OrganizationCarouselPage = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [selectedOrg, setSelectedOrg] = useState(null);
  const flatListRef = useRef(null);

  const handleDotPress = (index) => {
    flatListRef.current?.scrollToOffset({
      offset: index * (CARD_WIDTH + SPACING),
      animated: true,
    });
  };

  const openNGOChat = (NGO) => {
    navigation.navigate('Messenger', { ngoId: NGO.id, ngoName: NGO.name });
  };

  const handleContactPress = (lawyer) => {
    let url = '';
    if (lawyer.contactType === 'email') {
      url = `mailto:${lawyer.contact}`;
    } else if (lawyer.contactType === 'phone') {
      url = `tel:${lawyer.contact}`;
    }

    Alert.alert(
      `Contact ${lawyer.name}`,
      `You are about to contact ${lawyer.name} regarding their specialty in ${lawyer.specialty}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
            } else {
              Alert.alert(`Error`, `Unable to handle this request.`);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#022D3A' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.mainTitle}>Follow-Up Assistance</Text>
      <Text style={styles.subTitle}>Connect with support organizations</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={organizations}
        horizontal
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING - SPACING / 2,
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
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <TouchableOpacity style={styles.chatButton} onPress={() => openNGOChat(item)} activeOpacity={0.85}>
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
            <TouchableOpacity key={index} onPress={() => handleDotPress(index)} activeOpacity={0.7} style={styles.indicatorTouchable}>
              <Animated.View style={[styles.indicator, { opacity }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.lawyerSection}>
        <Text style={styles.sectionTitle}>Legal Professionals</Text>
        <Text style={styles.subTitle}>Get help from qualified lawyers</Text>
        {lawyers.map((lawyer) => (
          <View key={lawyer.id} style={styles.lawyerCard}>
            <View>
              <Text style={styles.lawyerName}>{lawyer.name}</Text>
              <Text style={styles.lawyerSpecialty}>{lawyer.specialty}</Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactPress(lawyer)}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    alignItems: 'center',
    paddingBottom: 50,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFDE59',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#B0C4DE',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 4,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    backgroundColor: '#064B5E',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: SPACING / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFDE59',
    marginBottom: 10,
    textAlign: 'center',
  },
  summary: {
    fontSize: 15,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },
  chatButton: {
    backgroundColor: '#FFDE59',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#022D3A',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    marginBottom: 40,
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
    borderColor: '#04445F',
    marginHorizontal: 5,
  },
  lawyerSection: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFDE59',
    textAlign: 'center',
  },
  lawyerCard: {
    backgroundColor: '#064B5E',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lawyerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lawyerSpecialty: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 4,
    fontStyle: 'italic',
  },
  contactButton: {
    backgroundColor: '#1E6A81',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFDE59',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalContent: {
    width: screenWidth - 60,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#022D3A',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#022D3A',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 15,
    color: '#FFDE59',
    fontWeight: '600',
  },
});

export default OrganizationCarouselPage;