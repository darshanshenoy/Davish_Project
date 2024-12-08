
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const SAMPLE_LEADERBOARD = [
  { name: 'John Doe', steps: 72500 },
  { name: 'Jane Smith', steps: 65300 },
  { name: 'Bob Johnson', steps: 58900 },
  { name: 'Alice Brown', steps: 52400 },
  { name: 'Mike Wilson', steps: 48700 },
];

export default function WeeklyStats({ weeklyData }) {
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: weeklyData.map(d => d.steps)
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Activity</Text>
      
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={220}
        yAxisLabel="Steps "  // Added yAxisLabel
        yAxisSuffix=""        // Added yAxisSuffix
        chartConfig={{
          backgroundColor: '#000000',
          backgroundGradientFrom: '#000000',
          backgroundGradientTo: '#000000',
          color: (opacity = 1) => `rgba(195, 255, 83, ${opacity})`,
        }}
        style={styles.chart}
      />

      <Text style={styles.title}>Leaderboard</Text>
      {SAMPLE_LEADERBOARD.map((user, index) => (
        <View key={index} style={styles.leaderboardItem}>
          <Text style={styles.rank}>#{index + 1}</Text>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.steps}>{user.steps.toLocaleString()} steps</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 10,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#111',
    marginVertical: 5,
    borderRadius: 10,
  },
  rank: {
    color: '#C3FF53',
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  name: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  steps: {
    color: '#C3FF53',
    fontSize: 16,
  },
});

