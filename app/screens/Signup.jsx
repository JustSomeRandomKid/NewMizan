import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import { account, ID } from "../../lib/appwrite"; // Ensure correct path

// Validation schema using Yup
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const SignupScreen = ({ navigation }) => {
  // Set up react-hook-form with Yup validation
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      console.log("Signing up with:", data);
      // Call the Appwrite account create function to register the user
      const user = await account.create(ID.unique(), data.email, data.password);
      console.log("Signup successful:", user);
      Alert.alert("Signup Successful", "You can now log in!");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Signup Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Display company logo */}
      <Image source={require("../../assets/images/Figma/Rectangle (1).png")} style={styles.logo} />
      <View style={styles.separator} />
      <Text style={styles.title}>Create New Account</Text>
      
      {/* Name input field with validation */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Full Name" value={value} onChangeText={onChange} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {/* Email input field with validation */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" value={value} onChangeText={onChange} keyboardType="email-address" />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password input field with validation */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" value={value} onChangeText={onChange} secureTextEntry />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Submit button to trigger form submission */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      
      {/* Navigation link to login screen */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already Registered? Log in here.</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#04445F",
    padding: 20,
  },
  separator: {
  transform: [{ translateY: -125 }],
  width: "95%",        
  height: 4,            
  backgroundColor: "#EEBA2B", 
  marginVertical: 20,   
},
  logo: {
    transform: [{ translateY: -75 }],
    width: 500,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    transform: [{ translateY: -120 }],
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
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
  loginText: {
    transform: [{ translateY: -50 }],
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

export default SignupScreen;
