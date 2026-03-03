import { useEffect, useState, useContext } from "react";
import { Table, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const UserProfilePage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        const res = await api.get(`/users/${id}/profile`);
        setProfile(res.data);
    };

    if (!profile) return <p>Loading...</p>;

    const isOwner = user?.id === Number(id);

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            sorter: (a, b) => a.title.localeCompare(b.title)
        },
        {
            title: "Category",
            dataIndex: "category",
            filters: [
                ...new Set(profile.ownedInventories.map(i => i.category))
            ].map(c => ({ text: c, value: c })),
            onFilter: (value, record) => record.category === value
        },
        {
            title: "Public",
            dataIndex: "isPublic",
            render: val => val ? "Yes" : "No"
        }
    ];

    return (
        <>
            <h2>{profile.user.email}'s Profile</h2>

            {/* OWNED INVENTORIES */}
            <h3>Owned Inventories</h3>

            {isOwner && (
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={() => navigate("/inventories/create")}
                >
                    Create Inventory
                </Button>
            )}

            <Table
                rowKey="id"
                columns={columns}
                dataSource={profile.ownedInventories}
                onRow={(record) => ({
                    onClick: () => navigate(`/inventories/${record.id}`)
                })}
            />

            {/* ACCESSIBLE INVENTORIES */}
            <h3 style={{ marginTop: 40 }}>
                Inventories With Write Access
            </h3>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={profile.accessibleInventories}
                onRow={(record) => ({
                    onClick: () => navigate(`/inventories/${record.id}`)
                })}
            />
        </>
    );
};

export default UserProfilePage;