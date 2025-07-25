import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import { account } from "../../lib/appwrite"; // Import account module for authentication

// Validation schema for login form fields
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginScreen = ({ navigation }) => {
  // Destructuring hook form methods and state
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema), // Using Yup for form validation
  });

  // Handles form submission and login process
  const onSubmit = async (data) => {
    try {
      console.log("Logging in with:", data);

      // Check if a session already exists, and delete if found
      try {
        const existingSession = await account.get();
        if (existingSession) {
          await account.deleteSessions(); // Deleting any active sessions before login
          console.log("Deleted existing session, proceeding to login...");
        }
      } catch (sessionError) {
        console.log("No active session found, proceeding with login...");
      }

      // Create a new session with email and password
      const session = await account.createEmailPasswordSession(data.email, data.password);
      console.log("Login successful:", session);

      // Alert the user and navigate to the main screen after successful login
      Alert.alert("Login Successful", "Welcome back!");
      navigation.navigate("Main");
    } catch (error) {
      console.error("Login Error:", error); // Log error if login fails
      Alert.alert("Login Failed", error.message); // Show error message in case of failure
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/Figma/Rectangle (1).png")} style={styles.logo} />
      <View style={styles.separator} />
      <Text style={styles.title}>Login</Text>
      
      {/* Email input field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" value={value} onChangeText={onChange} keyboardType="email-address" />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>} {/* Email validation error */}
      
      {/* Password input field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" value={value} onChangeText={onChange} secureTextEntry />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>} {/* Password validation error */}
      
      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      {/* Link to navigate to the signup screen */}
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#04445F",
    padding: 20,
  },
  logo: {
    width: 500,
    height: 200,
    resizeMode: "contain",
    transform: [{ translateY: -75 }]
  },
  title: {
    transform: [{ translateY: -120 }],
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
    separator: {
  transform: [{ translateY: -125 }],
  width: "95%",        
  height: 4,            
  backgroundColor: "#EEBA2B", 
  marginVertical: 20,   
},
  input: {
    transform: [{ translateY: -120 }],
    width: "100%",
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  button: {
    transform: [{ translateY: -120 }],
    width: "100%",
    height: 50,
    backgroundColor: "#EEBA2B",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  signupText: {
    marginTop: 20,
    fontSize: 16,
    color: "#FFFFFF",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default LoginScreen;
