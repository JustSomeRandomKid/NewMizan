import { Platform } from "react-native";
import { Account, Client, Databases, ID } from "react-native-appwrite";

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECTID);

switch (Platform.OS) {
    case "ios":
        client.setPlatform("com.mizan.meet");
        break;

    case "android":
        client.setPlatform("com.mizanandroid.meet");
        break;
}

// 🔥 Add Account Initialization
const account = new Account(client);
const database = new Databases(client);

export { account, client, database, ID }; // 🔥 Export account and ID

