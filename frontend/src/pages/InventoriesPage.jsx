import { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const InventoriesPage = () => {
    const [inventories, setInventories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        void fetchInventories();
    }, []);

    const fetchInventories = async () => {
        const res = await api.get("/inventories");
        setInventories(res.data);
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            render: (_, record) => (
                <a onClick={() => navigate(`/inventories/${record.id}`)}>
                    {record.title}
                </a>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
        },
        {
            title: "Owner",
            render: (_, record) => record.owner.email,
        },
    ];

    return (
        <>
            <h2>Inventories</h2>
            <Button
                type="primary"
                onClick={() => navigate("/inventories/create")}
            >
                Create Inventory
            </Button>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={inventories}
            />
        </>
    );
};

export default InventoriesPage;