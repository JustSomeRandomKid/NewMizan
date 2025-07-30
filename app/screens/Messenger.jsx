import { MaterialIcons } from '@expo/vector-icons';
import {
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../firebaseConfig.js';

const Messenger = () => {
    const [messages, setMessages] = useState([]);
    const [ngoList, setNgoList] = useState([]);
    const [selectedNGO, setSelectedNGO] = useState(null);
    const [selectedNGOData, setSelectedNGOData] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [showChat, setShowChat] = useState(false);
    const [showCases, setShowCases] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myCases, setMyCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [isCaseDetailModalVisible, setCaseDetailModalVisible] = useState(false);


    useEffect(() => {
        if (selectedNGO) {
            // Load messages for specific NGO chat
            const q = query(
                collection(db, `chats/${selectedNGO}_${auth.currentUser.uid}/messages`),
                orderBy('timestamp')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const chatMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(chatMessages);
            });

            return () => unsubscribe();
        } else {
            // Load list of NGOs that user has chats with
            loadNGOList();
        }
    }, [selectedNGO]);

    const loadNGOList = async () => {
        try {
            setLoading(true);
            // Load available NGOs from the 'ngos' collection
            const ngosSnapshot = await getDocs(collection(db, 'ngos'));
            const ngos = ngosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNgoList(ngos);
        } catch (error)  {
            console.error("Error loading NGOs:", error);
            Alert.alert("Error", "Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    const send_message = async ({ text, type = 'text', caseData = null }) => {
        if (!text && !caseData) return;

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be signed in to send a message");
            return;
        }

        if (!selectedNGO) {
            Alert.alert("Error", "Please select an NGO to chat with");
            return;
        }

        try {
            await addDoc(collection(db, `chats/${selectedNGO}_${user.uid}/messages`), {
                text: text,
                sender: user.displayName || user.email || "User",
                senderId: user.uid,
                timestamp: serverTimestamp(),
                type: type,
                caseData: type === 'case' ? caseData : null,
            });

            setMessageInput(""); // Clear input
        } catch (error) {
            console.error("Send Message Error:", error);
            Alert.alert("Error", "Failed to send message");
        }
    };


    const open_chat = async (ngoData) => {
        setSelectedNGO(ngoData.id);
        setSelectedNGOData(ngoData);
        setShowChat(true);
    };

    const close_chat = () => {
        setSelectedNGO(null);
        setSelectedNGOData(null);
        setShowChat(false);
        setMessages([]);
        setMyCases([]);
    };

    const chooseCaseToSend = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be signed in to see your cases.");
            return;
        }

        try {
            const crimesRef = collection(db, 'crimes');
            const q = query(crimesRef, where('victimID', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const formattedCases = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMyCases(formattedCases);
            setShowCases(true);
        } catch (error) {
            console.error("Error fetching cases:", error);
            Alert.alert("Error", "Could not fetch your cases.");
        }
    }

    const sendCaseAsMessage = (caseItem) => {
        send_message({
            text: `Case forwarded: ${caseItem.crimeType}`,
            type: 'case',
            caseData: caseItem
        });
        setShowCases(false); // Close the case selection view
    };

    const openCaseDetails = (caseItem) => {
        setSelectedCase(caseItem);
        setCaseDetailModalVisible(true);
    };

    const renderCaseFile = (item) => (
        <Pressable onPress={() => openCaseDetails(item.caseData)}>
            <View style={styles.caseFileBubble}>
                <MaterialIcons name="folder" size={32} color="#0A2836" style={styles.caseFileIcon} />
                <View>
                    <Text style={styles.caseFileCrimeType}>{item.caseData.crime}</Text>
                    <Text style={styles.caseFileSubtitle}>Tap to view details</Text>
                </View>
            </View>
        </Pressable>
    );

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === auth.currentUser?.uid;

        // Handle Firestore timestamp
        const time = item.timestamp?.toDate ?
            item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            'Sending...';

        if (item.type === 'case' && item.caseData) {
            return renderCaseFile(item);
        }

        return (
            <View style={[
                styles.messageBubble,
                isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
            ]}>
                {!isCurrentUser && (
                    <Text style={styles.messageSender}>{item.sender}</Text>
                )}
                <Text style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserMessageText : styles.otherUserMessageText
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.messageTimestamp,
                    isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                ]}>
                    {time}
                </Text>
            </View>
        );
    };


    const renderCaseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.caseItem}
            onPress={() => sendCaseAsMessage(item)}
        >
            <View style={styles.caseInfo}>
                <Text style={styles.caseTitle}>{item.crime || 'Case'}</Text>
                <Text style={styles.caseDescription} numberOfLines={2}>
                    {item.description || 'No description available.'}
                </Text>
            </View>
            <MaterialIcons name="send" size={24} color="#0A2836" />
        </TouchableOpacity>
    );


    const renderNGOItem = ({ item }) => (
        <TouchableOpacity
            style={styles.ngoItem}
            onPress={() => open_chat(item)}
        >
            <View style={styles.ngoIcon}>
                <MaterialIcons name="business" size={24} color="#0A2836" />
            </View>
            <View style={styles.ngoInfo}>
                <Text style={styles.ngoName}>{item.name}</Text>
                <Text style={styles.ngoDescription} numberOfLines={2}>
                    {item.description || "Tap to start a conversation"}
                </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
    );

    const renderEmptyNGOList = () => (
        <View style={styles.emptyState}>
            <MaterialIcons name="forum" size={80} color="#4A5568" />
            <Text style={styles.emptyTitle}>No Organizations Available</Text>
            <Text style={styles.emptyDescription}>
                There are currently no organizations available for messaging.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadNGOList}>
                <MaterialIcons name="refresh" size={20} color="#0A2836" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyChat = () => (
        <View style={styles.emptyChatState}>
            <MaterialIcons name="chat-bubble-outline" size={60} color="#6B7280" />
            <Text style={styles.emptyChatTitle}>Start the conversation</Text>
            <Text style={styles.emptyChatDescription}>
                Send a message to begin chatting with {selectedNGOData?.name}
            </Text>
        </View>
    );


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
            {!showChat ? (
                // NGO List
                <View style={styles.ngoListWrapper}>
                    <View style={styles.header}>
                        <MaterialIcons name="message" size={28} color="#FFD700" />
                        <Text style={styles.headerTitle}>Messages</Text>
                        <Text style={styles.headerSubtitle}>
                            Connect with organizations for support
                        </Text>
                    </View>

                    {ngoList.length === 0 && !loading ? (
                        renderEmptyNGOList()
                    ) : (
                        <FlatList
                            data={ngoList}
                            renderItem={renderNGOItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.ngoListContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            ) : (
                // Chat View
                <>
                    <View style={styles.chatHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={close_chat}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.chatHeaderInfo}>
                            <Text style={styles.chatTitle}>
                                {selectedNGOData?.name || selectedNGO}
                            </Text>
                            <Text style={styles.chatSubtitle}>
                                {selectedNGOData?.description || "Organization"}
                            </Text>
                        </View>
                        <View style={styles.chatHeaderIcon}>
                            <MaterialIcons name="business" size={24} color="#FFD700" />
                        </View>
                    </View>

                    <View style={styles.chatWrapper}>
                        <FlatList
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={[
                                styles.chatContainer,
                                messages.length === 0 && styles.emptyChatContainer
                            ]}
                            ListEmptyComponent={renderEmptyChat}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>

                    {/* Modal for selecting a case to send */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showCases}
                        onRequestClose={() => setShowCases(false)}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Select a Case to Send</Text>
                                <FlatList
                                    data={myCases}
                                    renderItem={renderCaseItem}
                                    keyExtractor={(item) => item.id}
                                    ListEmptyComponent={<Text>No cases found.</Text>}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setShowCases(false)}
                                >
                                    <Text style={styles.textStyle}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal for displaying case details */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={isCaseDetailModalVisible}
                        onRequestClose={() => setCaseDetailModalVisible(false)}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalCaseTitle}>{selectedCase?.crime}</Text>
                                <Text style={styles.modalCaseDetail}>Reported by: { getDocs(collection(db,'users'),selectedCase?.victimID).name}</Text>
                                <Text style={styles.modalCaseDetail}>Description: {selectedCase?.description}</Text>
                                {/* Add more case details here as needed */}
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => setCaseDetailModalVisible(false)}
                                >
                                    <Text style={styles.textStyle}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>


                    <View style={styles.inputContainerWrapper}>
                        <View style={styles.inputContainer}>
                            <TouchableOpacity style={styles.uploadButton} onPress={chooseCaseToSend}>
                                <MaterialIcons
                                    name="upload-file"
                                    size={24}
                                    color={"#0A2836"}
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Type your message..."
                                placeholderTextColor="#9CA3AF"
                                value={messageInput}
                                onChangeText={setMessageInput}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    !messageInput.trim() && styles.sendButtonDisabled
                                ]}
                                onPress={() => send_message({ text: messageInput })}
                                disabled={!messageInput.trim()}
                            >
                                <MaterialIcons
                                    name="send"
                                    size={20}
                                    color={messageInput.trim() ? "#0A2836" : "#9CA3AF"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A2836' // Dark Blue
    },
    ngoListWrapper: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 30,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 10,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#B0C4DE',
        textAlign: 'center',
    },
    ngoListContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    ngoItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ngoIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ngoInfo: {
        flex: 1,
    },
    ngoName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    ngoDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0A2836', // Dark Blue
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    chatHeaderInfo: {
        flex: 1,
    },
    chatTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatSubtitle: {
        color: '#B0C4DE',
        fontSize: 14,
        marginTop: 2,
    },
    chatHeaderIcon: {
        padding: 8,
    },
    chatWrapper: {
        flex: 1,
        backgroundColor: '#F0F4F8', // Lighter shade for chat background
    },
    chatContainer: {
        padding: 16,
        flexGrow: 1,
    },
    emptyChatContainer: {
        justifyContent: 'center',
    },
    messageBubble: {
        borderRadius: 18,
        padding: 12,
        marginBottom: 8,
        maxWidth: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    currentUserMessage: {
        backgroundColor: '#FFD700', // Yellow
        alignSelf: 'flex-end',
        marginLeft: '20%',
    },
    otherUserMessage: {
        backgroundColor: '#FFFFFF', // White
        alignSelf: 'flex-start',
        marginRight: '20%',
    },
    messageSender: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    currentUserMessageText: {
        color: '#0A2836', // Dark Blue
    },
    otherUserMessageText: {
        color: '#1F2937',
    },
    messageTimestamp: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'right',
    },
    currentUserTimestamp: {
        color: '#0A2836', // Dark Blue
        opacity: 0.7,
    },
    otherUserTimestamp: {
        color: '#6B7280',
    },
    inputContainerWrapper: {
        backgroundColor: '#FFFFFF',
        paddingBottom: Platform.OS === 'android' ? 10 : 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        fontSize: 16,
        color: '#1F2937',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFD700', // Yellow
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#B0C4DE',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD700', // Yellow
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#0A2836', // Dark Blue
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    emptyChatState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyChatTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyChatDescription: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
    },
    uploadButton: {
        padding: 8,
        marginRight: 8,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    modalCaseTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalCaseDetail: {
        fontSize: 16,
        marginBottom: 10,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: "#0A2836", // Dark Blue
        marginTop: 15,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    caseItem: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    caseInfo: {
        flex: 1,
    },
    caseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    caseDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    caseFileBubble: {
        backgroundColor: '#e9f5ff',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 8,
        maxWidth: '80%',
        borderLeftWidth: 5,
        borderLeftColor: '#FFD700', // Yellow accent
    },
    caseFileIcon: {
        marginRight: 12,
    },
    caseFileCrimeType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0A2836', // Dark Blue
    },
    caseFileSubtitle: {
        fontSize: 14,
        color: '#555',
    }
});

export default Messenger;