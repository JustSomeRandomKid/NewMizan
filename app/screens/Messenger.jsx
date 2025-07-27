import {
    addDoc,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Account, Client, Databases, ID } from "react-native-appwrite";
import { db } from '../../firebaseConfig.js';



const Messenger = () => {

    const [NGOChatHistory, setNGOChatHistory] = useState([]);
    const [NGO, setNGO] = useState("");
    const [messageInput, setMessageInput] = useState("");

    const client = new Client()
        .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECTID);

    const account = new Account(client);
    const databases = new Databases(client);

    useEffect(() => {
        const unsubscribe = client.subscribe(`databases.default.collections.${NGO}.documents`, response => {
            if (response.payload.sender !== account.name) {
                setNGOChatHistory(prevHistory => [...prevHistory, response.payload]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [NGO]);

    const get_chats = async () => {
        const chats = await getDocs(collection(db, 'ngos/${NGO}/users/user_abc/chats'));

    }
    const send_message = async () => {
        if (!messageInput.trim()) return;

        await addDoc(collection(collection(collection('NGOName'),'1/1/25'), 'messages'), {
        text: 'Hello world',
        sender: 'user123',
        timestamp: serverTimestamp()
        });

        setNGOChatHistory(prevHistory => [...prevHistory, newMessage]);
        setMessageInput("");

        try {
            const res = await databases.createDocument(
                'default',
                NGO,
                ID.unique(),
                newMessage
            );
            console.log("Message sent successfully:", res);
        } catch (error) {
            console.error("Send Message Error:", error);
            setNGOChatHistory(prevHistory =>
                prevHistory.filter(msg => msg.timestamp !== newMessage.timestamp)
            );
        }
    };

    const renderItem = ({ item }) => {
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
            <View style={styles.messageBubble}>
                <Text style={styles.messageSender}>{item.sender}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.messageTimestamp}>{time}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
            <View style={styles.chatWrapper}>
                <FlatList
                    data={NGOChatHistory}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.timestamp + index}
                    contentContainerStyle={styles.chatContainer}
                />
            </View>
            <View style={styles.inputContainerWrapper}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message..."
                        value={messageInput}
                        onChangeText={setMessageInput}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={send_message}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04445E'
    },
    chatWrapper: {
        flex: 1
    },
    chatContainer: {
        backgroundColor: '#04445E',
        padding: 10,
        paddingBottom: 10
    },
    messageBubble: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        alignSelf: 'flex-start',
        maxWidth: '80%'
    },
    messageSender: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    messageText: {
        fontSize: 16
    },
    messageTimestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        textAlign: 'right'
    },
    inputContainerWrapper: {
        paddingBottom: Platform.OS === 'android' ? 10 : 30,
        backgroundColor: '#fff'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 5,
        borderTopWidth: 1,
        borderColor: '#ccc'
    },
    textInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10
    },
    sendButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});

export default Messenger;
