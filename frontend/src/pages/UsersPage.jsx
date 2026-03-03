import React, {useContext} from 'react';
import { useEffect, useState } from 'react';
import { Button, Space, Table, Typography } from 'antd';
import api from "../api/axios.js";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext.jsx";

const { Title } = Typography;

export const UsersPage = () => {
    const { user, logout } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const columns = [
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (role) => role === 'ADMIN' ? 'Admin' : 'User'
        },
        {
            title: 'Status',
            render: (_, record) =>
                record.blocked ? 'Blocked' : 'Active'
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString()
        }
    ];

    useEffect(() => {
        void loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch {
            console.error('Failed to load users');
        }
        setLoading(false);
    };

    const onBlock = async () => {
        await api.patch("/admin/users/block", {
            ids: selectedRowKeys
        });
        if (selectedRowKeys.includes(user.id)){
            logout();
        } else await loadUsers();
        console.log('Users blocked');
    };

    const onUnblock = async () => {
        await api.patch("/admin/users/unblock", {
            ids: selectedRowKeys
        });
        console.log('Users unblocked');
        await loadUsers();
    };

    const onDelete = async () => {
        await api.delete("/admin/users/delete", {
            data: { ids: selectedRowKeys }
        });
        if (selectedRowKeys.includes(user.id)){
            logout();
        } else await loadUsers();
        console.log('Users deleted');
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16
            }}>
                <Title level={3}>User management</Title>
            </div>

            <Space style={{ marginBottom: 16 }}>
                <Button
                    danger
                    onClick={onBlock}
                    disabled={!selectedRowKeys.length}
                >
                    Block
                </Button>
                <Button
                    onClick={onUnblock}
                    disabled={!selectedRowKeys.length}
                >
                    Unblock
                </Button>
                <Button
                    danger
                    onClick={onDelete}
                    disabled={!selectedRowKeys.length}
                >
                    Delete
                </Button>
            </Space>
            <Table
                rowKey="id"
                dataSource={users}
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys
                }}
                columns={columns}
            />
        </div>
    );
};