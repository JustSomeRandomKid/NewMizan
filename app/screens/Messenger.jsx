import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Client, Databases, Account, ID } from "react-native-appwrite";

const Messenger = () => {
    const [NGOChatHistory, setNGOChatHistory] = useState([])
    const [NGO, setNGO] = useState("matan")

    const client = new Client()
        .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECTID);

    // Init
    const account = new Account(client);
    const databases = new Databases(client);

    useEffect(() => {
        // Subscribe to realtime updates
        const unsubscribe = client.subscribe(`databases.default.collections.${NGO}.documents`, response => {
            // Check to avoid adding the same message twice to local history
            if(response.payload.sender !== account.name) {
                // Takes the current chat history array and adds the new response to it
                setNGOChatHistory(prevHistory => [...prevHistory, response.payload]);
            }
        });

        // Cleans up subscription when component dies
        return () => {
            unsubscribe();
        };
    }, [NGO]);

    const send_message = async(message, sender, NGO) => {
        // Create the new message object
        const newMessage = {
            message,
            sender,
            timestamp: new Date().toISOString()
        };

        // Instantly update local version of history for smooth experience
        setNGOChatHistory(prevHistory => [...prevHistory, newMessage]);

        // Adding new message to db
        try {
            const res = await databases.createDocument(
                'default',
                NGO, // Using NGO as collection name
                ID.unique(),
                newMessage
            );
            console.log("Message sent successfully:", res);
        }
        catch(error) {
            console.error("Send Message Error:", error);
            // Remove the message from local history if it failed to send
            setNGOChatHistory(prevHistory => 
                prevHistory.filter(msg => msg.timestamp !== newMessage.timestamp)
            );
        }
    }

    return(
        <View style={styles.container}>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'blue'
    },
    chatContainer: {
        flex: 1
    }
});

export default Messenger;