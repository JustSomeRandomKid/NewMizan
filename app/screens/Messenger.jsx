import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Account, Client, Databases, ID } from "react-native-appwrite";

const Messenger = () => {
    const [NGOChatHistory, setNGOChatHistory] = useState([]);
    const [NGO, setNGO] = useState("matan");
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

    const send_message = async (message, sender, NGO) => {
        const newMessage = {
            message,
            sender,
            timestamp: new Date().toISOString()
        };

        setNGOChatHistory(prevHistory => [...prevHistory, newMessage]);

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

    const renderItem = ({ item }) => (
        <View style={styles.messageBubble}>
            <Text style={styles.messageSender}>{item.sender}</Text>
            <Text style={styles.messageText}>{item.message}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={90}
        >
            <FlatList
                data={NGOChatHistory}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.timestamp + index}
                contentContainerStyle={styles.chatContainer}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChangeText={setMessageInput}
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#04445E'
    },
    chatContainer: {
        backgroundColor: '#04445E',
        padding: 10,
        paddingBottom: 80 // space for the input field
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
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
