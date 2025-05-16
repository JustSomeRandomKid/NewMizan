import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardComponent = ({ title, description, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View>{children}</View> {/* Wrap children inside View */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#04445E',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AEE3F8', // Set font color to AEE3F8
  },
  description: {
    backgroundColor: '#AEE3F8',
    color: '#04445E',
    padding: 5,
    borderRadius: 12,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  }
});

export default CardComponent;
