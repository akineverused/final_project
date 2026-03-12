import {useContext, useEffect, useState} from "react";
import { Card, Spin } from "antd";
import api from "../../api/axios";
import {LanguageContext} from "../../context/LanguageContext.jsx";

const StatisticsTab = ({ inventoryId }) => {
    const [stats, setStats] = useState(null);
    const {t} = useContext(LanguageContext);

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
            <Card title={t.totalItems}>
                {stats.totalItems}
            </Card>

            {Object.entries(stats.numeric).map(([field, data]) => (
                <Card key={field} title={`${t.numericField}: ${field}`}>
                    <p>{t.average}: {data.avg.toFixed(2)}</p>
                    <p>{t.min}: {data.min}</p>
                    <p>{t.max}: {data.max}</p>
                </Card>
            ))}

            {Object.entries(stats.string).map(([field, data]) => (
                <Card key={field} title={`${t.stringField}: ${field}`}>
                    <p>{t.mostFrequent}: {data.mostFrequent}</p>
                    <p>{t.used}: {data.count} times</p>
                </Card>
            ))}
        </div>
    );
};

export default StatisticsTab;