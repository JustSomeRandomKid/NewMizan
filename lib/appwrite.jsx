import { Client, Databases, Account, ID } from "react-native-appwrite";
import { Platform } from "react-native";

const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '67b0d5fa002f51d03429',
    db: '67b0d857001943222279',
    col: {
        crimes: '67b244920031b07b662d',
    },
};

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

switch (Platform.OS) {
    case "ios":
        client.setPlatform("com.mizan.meet");
        break;
}

// 🔥 Add Account Initialization
const account = new Account(client);
const database = new Databases(client);

export { database, config, client, account, ID }; // 🔥 Export account and ID
