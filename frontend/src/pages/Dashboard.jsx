import {useContext, useEffect, useState} from "react";
import { Card, Row, Col, Table } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {LanguageContext} from "../context/LanguageContext.jsx";

const Dashboard = () => {
    const [data, setData] = useState(null);
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        loadHome();
    }, []);

    const loadHome = async () => {
        const res = await api.get("/home");
        setData(res.data);
    };

    if (!data) return <p>Loading...</p>;

    const popularColumns = [
        {
            title: t.title,
            dataIndex: "title"
        },
        {
            title: t.items,
            render: (_, record) => record._count.items
        }
    ];

    return (
        <>
            <h2>{t.latest}</h2>

            <Row gutter={[16, 16]}>
                {data.latest.map(inv => (
                    <Col span={6} key={inv.id}>
                        <Card
                            hoverable
                            title={inv.title}
                            onClick={() => navigate(`/inventories/${inv.id}`)}
                        >
                            {inv.description || inv.category}
                            <div style={{ marginTop: 8, fontSize: 12 }}>
                                By {inv.owner.email}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <h2 style={{ marginTop: 40 }}>{t.popular}</h2>

            <Table
                rowKey="id"
                columns={popularColumns}
                dataSource={data.popular}
                pagination={false}
                onRow={(record) => ({
                    onClick: () => navigate(`/inventories/${record.id}`)
                })}
            />

            <h2 style={{ marginTop: 40 }}>{t.tags}</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {data.tags.map(tag => (
                    <span
                        key={tag.id}
                        style={{
                            cursor: "pointer",
                            fontSize: 12 + tag.inventories.length * 3,
                            padding: "4px 8px",
                            background: "#f0f0f0",
                            borderRadius: 4
                        }}
                        onClick={() => navigate(`/search?q=${tag.name}`)}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
        </>
    );
};

export default Dashboard;