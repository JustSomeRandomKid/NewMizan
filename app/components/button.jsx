import React from 'react';
import { Button } from 'react-native';

const ButtonComponent = ({ title, onPress }) => {
  return <Button title={title} onPress={onPress} color="#3B82F6" />;
};

export default ButtonComponent;
