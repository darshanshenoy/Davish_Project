import { StyleSheet, Text, View } from 'react-native';
import Value from './Value';
import RingProgress from './RingProgress';
import { useState } from 'react';
import useHealthData from '../hooks/useHealthData';
import { AntDesign } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DayData } from '../hooks/useHealthData';

type NavigationProp = NativeStackNavigationProp<{
  Weekly: { weeklyData: DayData[] };
}>;

const STEPS_GOAL = 10_000;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    padding: 12,
  },
  values: {
    flexDirection: 'row',
    gap: 25,
    flexWrap: 'wrap',
    marginTop: 100,
  },
  datePicker: {
    alignItems: 'center',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  date: {
    color: 'white',
    fontWeight: '500',
    fontSize: 20,
    marginHorizontal: 20,
  },
});

export default function DailyStats() {
 const navigation = useNavigation<NavigationProp>();
 const [date, setDate] = useState(new Date());
 const { steps, distance, weeklyData } = useHealthData(date);
  const onGestureEvent = ({ nativeEvent }) => {
   if (nativeEvent.translationX < -50) {
     navigation.navigate('Weekly', { weeklyData });
   }
 };
  const changeDate = (numDays: number) => {
   const currentDate = new Date(date);
   currentDate.setDate(currentDate.getDate() + numDays);
   setDate(currentDate);
 };
  return (
   <GestureHandlerRootView style={{ flex: 1 }}>
     <PanGestureHandler onGestureEvent={onGestureEvent}>
       <View style={styles.container}>
         <View style={styles.datePicker}>
           <AntDesign
             onPress={() => changeDate(-1)}
             name="left"
             size={20}
             color="#C3FF53"
           />
           <Text style={styles.date}>{date.toDateString()}</Text>
           <AntDesign
             onPress={() => changeDate(1)}
             name="right"
             size={20}
             color="#C3FF53"
           />
         </View>
          <RingProgress
           radius={150}
           strokeWidth={50}
           progress={steps / STEPS_GOAL}
         />
          <View style={styles.values}>
           <Value label="Steps" value={steps.toString()} />
           <Value label="Distance" value={`${(distance / 1000).toFixed(2)} km`} />
         </View>
       </View>
     </PanGestureHandler>
   </GestureHandlerRootView>
 );
}