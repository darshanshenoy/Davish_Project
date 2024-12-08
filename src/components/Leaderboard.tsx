import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
// import './Leaderboard.css'; // No longer needed


interface LeaderboardEntry {
    rank: number;
    name: string;
    points: number;
}

const Leaderboard: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dummyData: LeaderboardEntry[] = [
        { rank: 1, name: 'Alice', points: 1000 },
        { rank: 2, name: 'Bob', points: 850 },
        { rank: 3, name: 'Charlie', points: 700 },
        // ... more dummy data
    ];

    useEffect(() => {
        const fetchData = async () => {  // Rename the function to avoid confusion
            try {
                setLoading(true); // Set loading to true before the fetch
                const data: LeaderboardEntry[] = await fetchLeaderboardData(); // Call the external fetchLeaderboardData
                setLeaderboardData(data);
                setError(null); // Clear any previous error
            } catch (err: any) {
                setError(err.message);
                setLeaderboardData(dummyData); // Use dummy data if fetch fails
            } finally {
                setLoading(false);
            }
        };
    
        fetchData(); // Call the fetchData function
    }, []); // Empty dependency array to run only once

    if (loading) {
        return <Text>Loading leaderboard...</Text>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Leaderboard</Text>
            <FlatList
                data={leaderboardData}
                keyExtractor={(item) => item.rank.toString()}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.cell}>{item.rank}</Text>
                        <Text style={styles.cell}>{item.name}</Text>
                        <Text style={styles.cell}>{item.points}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    cell: {
        flex: 1,
        textAlign: 'left', 
    },
    headerCell: { 
        flex: 1,
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
    },
});

export default Leaderboard;
