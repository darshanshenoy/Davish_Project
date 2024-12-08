import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions
} from 'react-native-health';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { addDays, startOfWeek } from 'date-fns';
import {
  initialize,
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { TimeRangeFilter } from 'react-native-health-connect/lib/typescript/types/base.types';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [],
  },
};

export interface DayData {
  date: Date;
  steps: number;
  distance: number;
}

const useHealthData = (date: Date) => {
  const [hasPermissions, setHasPermission] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
   // iOS - Weekly Data Fetch
  const fetchIOSWeeklyData = async () => {
    const startDate = startOfWeek(date);
    const weekData: DayData[] = [];
     for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
      const options: HealthInputOptions = {
        date: currentDate.toISOString(),
        includeManuallyAdded: false,
      };
       // Wrap the HealthKit calls in promises
      const getStepsPromise = () =>
        new Promise<number>((resolve, reject) => {
          AppleHealthKit.getStepCount(options, (err, results) => {
            if (err) reject(err);
            else resolve(results.value);
          });
        });
       const getDistancePromise = () =>
        new Promise<number>((resolve, reject) => {
          AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
            if (err) reject(err);
            else resolve(results.value);
          });
        });
       try {
        const [stepsCount, distanceValue] = await Promise.all([
          getStepsPromise(),
          getDistancePromise(),
        ]);
         weekData.push({
          date: currentDate,
          steps: stepsCount,
          distance: distanceValue,
        });
      } catch (error) {
        console.log('Error fetching iOS weekly data:', error);
        weekData.push({
          date: currentDate,
          steps: 0,
          distance: 0,
        });
      }
    }
     setWeeklyData(weekData);
  };
   // Android - Weekly Data Fetch
  const fetchAndroidWeeklyData = async () => {
    const startDate = startOfWeek(date);
    const weekData: DayData[] = [];
     for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
      const timeRangeFilter: TimeRangeFilter = {
        operator: 'between',
        startTime: new Date(currentDate.setHours(0, 0, 0, 0)).toISOString(),
        endTime: new Date(currentDate.setHours(23, 59, 59, 999)).toISOString(),
      };
       try {
        // Fetch steps
        const stepsRecords = await readRecords('Steps', { timeRangeFilter });
        const totalSteps = stepsRecords.reduce((sum, cur) => sum + cur.count, 0);
         // Fetch distance
        const distanceRecords = await readRecords('Distance', { timeRangeFilter });
        const totalDistance = distanceRecords.reduce(
          (sum, cur) => sum + cur.distance.inMeters,
          0
        );
         weekData.push({
          date: currentDate,
          steps: totalSteps,
          distance: totalDistance,
        });
      } catch (error) {
        console.log('Error fetching Android weekly data:', error);
        weekData.push({
          date: currentDate,
          steps: 0,
          distance: 0,
        });
      }
    }
     setWeeklyData(weekData);
  };
   // iOS - HealthKit initialization
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
   // iOS - Daily Data Fetch
  useEffect(() => {
    if (!hasPermissions || Platform.OS !== 'ios') {
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
     AppleHealthKit.getDistanceWalkingRunning(options, (err, results) => {
      if (err) {
        console.log('Error getting the distance');
        return;
      }
      setDistance(results.value);
    });
     // Fetch weekly data
    fetchIOSWeeklyData();
  }, [hasPermissions, date]);
   // Android - Health Connect
  const readAndroidData = async () => {
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }
     await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Distance' },
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
     // Fetch weekly data
    await fetchAndroidWeeklyData();
  };
   // Android - Data Fetch
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    readAndroidData();
  }, [date]);
   return {
    steps,
    distance,
    weeklyData,
  };
};

export default useHealthData;