import { Platform } from "react-native";
import { Account, Client, Databases, ID } from "react-native-appwrite";

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

    case "android":
        client.setPlatform("com.mizanandroid.meet");
        break;
}

// 🔥 Add Account Initialization
const account = new Account(client);
const database = new Databases(client);

export { account, client, config, database, ID }; // 🔥 Export account and ID

