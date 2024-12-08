import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DailyStats from './components/DailyStats';
import WeeklyStats from './components/WeeklyStats';
import type { DayData } from './hooks/useHealthData';

type RootStackParamList = {
  Daily: undefined;
  Weekly: { weeklyData: DayData[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function App() {
 return (
   <NavigationContainer>
     <Stack.Navigator 
       id={undefined}  // Added this line
       screenOptions={{
         headerShown: false,
         animation: 'slide_from_right'
       }}
     >
       <Stack.Screen name="Daily" component={DailyStats} />
       <Stack.Screen name="Weekly" component={WeeklyStats} />
     </Stack.Navigator>
   </NavigationContainer>
 );
}
