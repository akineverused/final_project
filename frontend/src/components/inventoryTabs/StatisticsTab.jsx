import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import api from "../../api/axios";

const StatisticsTab = ({ inventoryId }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [inventoryId]);

    const fetchStats = async () => {
        const res = await api.get(`/inventories/${inventoryId}/statistics`);
        setStats(res.data);
    };

    if (!stats) return <Spin />;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card title="Total Items">
                {stats.totalItems}
            </Card>

            {Object.entries(stats.numeric).map(([field, data]) => (
                <Card key={field} title={`Numeric field: ${field}`}>
                    <p>Average: {data.avg.toFixed(2)}</p>
                    <p>Min: {data.min}</p>
                    <p>Max: {data.max}</p>
                </Card>
            ))}

            {Object.entries(stats.string).map(([field, data]) => (
                <Card key={field} title={`String field: ${field}`}>
                    <p>Most frequent: {data.mostFrequent}</p>
                    <p>Used: {data.count} times</p>
                </Card>
            ))}
        </div>
    );
};

export default StatisticsTab;