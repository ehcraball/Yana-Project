import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Home: undefined;
  Journal: undefined;
  Timer: undefined;
  Stats: { userId: string }; 
  Challenge: undefined;
  Feeling: undefined;

};

// 👉 Type générique pour tous les écrans
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
