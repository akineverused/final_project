import { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import api from "../api/axios";
import {useNavigate} from "react-router-dom";

export const AdminInventoriesPage = () => {
    const [data, setData] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        void load();
    }, []);


    const load = async () => {
        setLoading(true);
        const res = await api.get("/admin/inventories");
        setData(res.data);
        setLoading(false);
    };

    const handleDelete = async () => {
        await api.delete("/admin/inventories/delete", {
            data: { ids: selectedRowKeys }
        });
        await load();
    };

    const columns = [
        { title: "Title", dataIndex: "title" },
        { title: "Category", dataIndex: "category" },
        { title: "Owner", dataIndex: ["owner", "email"] }
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button
                    danger
                    disabled={!selectedRowKeys.length}
                    onClick={handleDelete}
                >
                    Delete Selected
                </Button>
            </Space>

            <Table
                rowKey="id"
                dataSource={data}
                loading={loading}
                columns={columns}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys
                }}
                onRow={(record) => ({
                    onClick: () => navigate(`/inventories/${record.id}`)
                })}
            />
        </div>
    );
};