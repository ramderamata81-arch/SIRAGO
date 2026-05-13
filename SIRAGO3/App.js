// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { COLORS } from './constants/Colors';

// Import des écrans
import SplashScreen from './screens/splashScreen';
import RoleSelection from './screens/RoleSelection';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DriverRegistration from './screens/DriverRegistration';
import UploadDocs from './screens/UploadDocsScreen';
import DriverHome from './screens/DriverHome';
import DriverMap from './screens/DriverMap';
import DriverHistory from './screens/DriverHistory';
import DriverSettings from './screens/DriverSettings';
import PassengerHomeScreen from './screens/PassengerHome';
import PassengerMapScreen from './screens/PassengerMap';
import PassengerSettings from './screens/PassengerSettings';
import AdminPanel from './screens/AdminPanel';
import SOS from './screens/SOSScreen';
import TrackingScreen from './screens/TrackingScreen';
import TripSelection from './screens/TripSelection';
import WalletScreen from './screens/WalletScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import RideEstimation from './screens/RideEstimation';
import TripDetails from './screens/TripDetails';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Écrans d'accueil et d'authentification */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelection} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="DriverRegistration" component={DriverRegistration} />
          <Stack.Screen name="UploadDocs" component={UploadDocs} />
          
          {/* Espace chauffeur */}
          <Stack.Screen 
            name="DriverHome" 
            component={DriverHome}
          />
          <Stack.Screen name="DriverMap" component={DriverMap} />
          <Stack.Screen name="DriverHistory" component={DriverHistory} />
          <Stack.Screen 
            name="DriverSettings" 
            component={DriverSettings}
            options={{
              headerShown: true,
              title: 'Paramètres',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen 
            name="Wallet" 
            component={WalletScreen}
            options={{
              headerShown: true,
              title: 'Mon Portefeuille',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          
          {/* Espace passager */}
          <Stack.Screen 
            name="PassengerHome" 
            component={PassengerHomeScreen}
          />
          <Stack.Screen name="PassengerMap" component={PassengerMapScreen} />
          <Stack.Screen name="RideEstimation" component={RideEstimation} />
          <Stack.Screen 
            name="PassengerSettings" 
            component={PassengerSettings}
            options={{
              headerShown: true,
              title: 'Paramètres',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          
          {/* Écrans partagés */}
          <Stack.Screen 
            name="TripSelection" 
            component={TripSelection}
            options={{
              headerShown: true,
              title: 'Choisir un chauffeur',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="SOS" component={SOS} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen 
            name="TripDetails" 
            component={TripDetails} 
            options={{ headerShown: false }}
          />
          
          {/* Admin */}
          <Stack.Screen 
            name="AdminPanel" 
            component={AdminPanel}
            options={{
              headerShown: true,
              title: 'Tableau de bord Admin',
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.white,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
