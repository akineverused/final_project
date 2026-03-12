import React, {useContext} from 'react';
import { useEffect, useState } from 'react';
import {Button, Space, Table, Tag, Typography, message } from 'antd';
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
            render: (_, record) => {
                if (record.blocked) {
                    return <Tag color="red">Blocked</Tag>;
                }

                if (!record.verified) {
                    return <Tag color="orange">Unverified</Tag>;
                }

                return <Tag color="green">Active</Tag>;
            }
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
    const refreshTable = async () => {
        await loadUsers();
        setSelectedRowKeys([]);
    };

    const onBlock = async () => {
        await api.patch("/admin/users/block", {
            ids: selectedRowKeys
        });
        if (selectedRowKeys.includes(user.id)){
            logout();
        } else await refreshTable();;
        console.log('Users blocked');
    };

    const onUnblock = async () => {
        await api.patch("/admin/users/unblock", {
            ids: selectedRowKeys
        });
        console.log('Users unblocked');
        await refreshTable();
    };

    const onDelete = async () => {
        await api.delete("/admin/users/delete", {
            data: { ids: selectedRowKeys }
        });
        if (selectedRowKeys.includes(user.id)){
            logout();
        } else await refreshTable();
        console.log('Users deleted');
    };

    const onDeleteUnverified = async () => {
        try {
            await api.delete("/admin/users/unverified");
            message.success("Unverified users deleted");
            await refreshTable();
        } catch (err) {
            message.error(
                err.response?.data?.message || "Failed to delete users"
            );
        }
    };

    const onMakeAdmin = async () => {
        try {
            await api.patch("/admin/users/make-admin", {
                ids: selectedRowKeys
            });
            message.success("Users promoted to admin");
            await refreshTable();
        } catch (err) {
            message.error("Failed to promote users");
        }
    };

    const onRemoveAdmin = async () => {
        try {
            await api.patch("/admin/users/remove-admin", {
                ids: selectedRowKeys
            });
            message.success("Admin rights removed");
            await refreshTable();
        } catch (err) {
            message.error("Failed to remove admin rights");
        }
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16,

            }}>
                <Title level={3} style={{margin:0}}>User management</Title>
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
                <Button
                    onClick={onMakeAdmin}
                    disabled={!selectedRowKeys.length}
                >
                    Make admin
                </Button>
                <Button
                    onClick={onRemoveAdmin}
                    disabled={!selectedRowKeys.length}
                >
                    Remove admin
                </Button>
                <Button
                    danger
                    onClick={onDeleteUnverified}
                >
                    Delete unverified
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
                onRow={(record) => ({
                    onClick: () => navigate(`/users/${record.id}`)
                })}
            />
        </div>
    );
};