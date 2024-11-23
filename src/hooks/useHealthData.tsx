import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      //AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Steps,
      //AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning
    ],
    write: [],
  },
};

const useHealthData = (date: Date) => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);
  const [flights, setFlights] = useState(0);
  const [distance, setDistance] = useState(0);
  // const [caloriesBurned, setCaloriedBurned] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);

  // iOS - HealthKit
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    AppleHealthKit.isAvailable((err, isAvailable) => {
      if (err) {
        console.log('Error checking availability');
        return;
      }
      if (!isAvailable) {
        console.log('Apple Health not available');
        return;
      }
      AppleHealthKit.initHealthKit(permissions, (err) => {
        if (err) {
          console.log('Error getting permissions');
          return;
        }
        setHasPermission(true);
      });
    });
  }, []);

  useEffect(() => {
    if (!hasPermissions) {
      return;
    }

    const options: HealthInputOptions = {
      date: date.toISOString(),
      includeManuallyAdded: false,
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        console.log('Error getting the steps');
        return;
      }
      setSteps(results.value);
    });

    // AppleHealthKit.getFlightsClimbed(options, (err, results) => {
    //   if (err) {
    //     console.log('Error getting the steps:', err);
    //     return;
    //   }
    //   setFlights(results.value);
    // });

    // AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
    //   if (err) {
    //     console.log('Error getting active calories:', err);
    //     return;
    //   }
    //   setTotalCaloriesBurned(results.values?.[0]?.value || 0);
    // });

    AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('Error getting the steps:', err);
        return;
      }
      setDistance(results.value);
    });
  }, [hasPermissions, date]);

  // Android - Health Connect
  const readSampleData = async () => {
    // initialize the client
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }

    // request permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'FloorsClimbed' },
      // { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      { accessType: 'read', recordType: 'TotalCaloriesBurned' }
    ]);

    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
      endTime: new Date(date.setHours(23, 59, 59, 999)).toISOString(),
    };

    // Steps
    const steps = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = steps.reduce((sum, cur) => sum + cur.count, 0);
    setSteps(totalSteps);

    // Distance
    const distance = await readRecords('Distance', { timeRangeFilter });
    const totalDistance = distance.reduce(
      (sum, cur) => sum + cur.distance.inMeters,
      0
    );
    setDistance(totalDistance);

    //Calories Burned
    // const calories = await readRecords('ActiveCaloriesBurned', { timeRangeFilter });
    // const totalCalories = calories.reduce((sum, cur) => sum + cur.energy.inCalories, 0)
    // setCaloriedBurned(totalCalories)

    //Total Calories Burned
    // const totalCaloriesTillToday = await readRecords('TotalCaloriesBurned', { timeRangeFilter });
    // const finalCalories = totalCaloriesTillToday.reduce((sum, cur) => sum + cur.energy.inCalories, 0);
    // console.log(finalCalories)
    // setTotalCaloriesBurned(finalCalories);

    // Floors climbed
    // const floorsClimbed = await readRecords('FloorsClimbed', {
    //   timeRangeFilter,
    // });
    // const totalFloors = floorsClimbed.reduce((sum, cur) => sum + cur.floors, 0);
    // setFlights(totalFloors);
    // console.log(floorsClimbed);
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    readSampleData();
  }, [date]);

  return {
    steps,
    //flights,
    distance,
    // Calories,
    //totalCaloriesBurned
  };
};

export default useHealthData;
