// OrganizationCard.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const OrganizationCard = ({ image, name }) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={image} style={styles.image} />
      <Text style={styles.orgName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 250, // Adjusted width to be narrower
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 300, // Increased height for a more rectangular look
    borderRadius: 10,
  },
  orgName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});

export default OrganizationCard;
