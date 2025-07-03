import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigations/AppNavigator';
import Toast from 'react-native-toast-message';


export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
      <Toast
        position="bottom"
        bottomOffset={50}
        visibilityTime={3000}
        autoHide={true}
        topOffset={20}
        />
    </NavigationContainer>
  );
}
