import {useState, useEffect, useContext} from "react";
import {Button, Input, List, Select, Table} from "antd";
import api from "../../api/axios";
import {LanguageContext} from "../../context/LanguageContext.jsx";

const AccessTab = ({ inventory, refresh }) => {
    const [users, setUsers] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [sortMode, setSortMode] = useState("Email A-Z");
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const {t} = useContext(LanguageContext);

    useEffect(() => {
        setUsers(inventory.accessList || []);
    }, [inventory]);

    const handleSearch = async (value) => {
        setSearchValue(value);

        if (!value) return;

        const res = await api.get(`/users/search?q=${value}`);

        const filtered = res.data.filter(u =>
            u.id !== inventory.ownerId &&
            !inventory.accessList.some(a => a.userId === u.id)
        );

        setSearchResults(filtered);
    };

    const handleAddUser = async (userId) => {
        await api.post(`/inventories/${inventory.id}/access`, {
            userId
        });

        refresh();
        setSearchValue("");
        setSearchResults([]);
    };

    const handleDeleteSelected = async () => {
        await api.delete(`/inventories/${inventory.id}/access`, {
            data: { userIds: selectedRowKeys }
        });

        setSelectedRowKeys([]);
        refresh();
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (sortMode === "emailAsc") {
            return a.user.email.localeCompare(b.user.email);
        }
        if (sortMode === "emailDesc") {
            return b.user.email.localeCompare(a.user.email);
        }
        return 0;
    });
    const columns = [
        {
            title: "Email",
            dataIndex: ["user", "email"],
            key: "email"
        }
    ];


    return (
        <>
            <h3>
                {inventory.isPublic
                    ? t.publicAccessDesc
                    : "Private inventory (only listed users have access)"}
            </h3>

            {!inventory.isPublic && (
                <>
                    <Input
                        placeholder="Search user by email"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                    />

                    {searchResults.map(user => (
                        <div key={user.id}>
                            {user.email}
                            <Button
                                type="link"
                                onClick={() => handleAddUser(user.id)}
                            >
                                Add
                            </Button>
                        </div>
                    ))}

                    <div style={{ marginTop: 20 }}>
                        <Select
                            value={sortMode}
                            onChange={setSortMode}
                            options={[
                                { value: "emailAsc", label: "Email A-Z" },
                                { value: "emailDesc", label: "Email Z-A" }
                            ]}
                            style={{ width: 200 }}
                        />
                    </div>

                    <Button
                        danger
                        disabled={!selectedRowKeys.length}
                        onClick={handleDeleteSelected}
                        style={{ marginBottom: 16, marginTop: 16 }}
                    >
                        Delete from access list
                    </Button>

                    <Table
                        rowKey={(record) => record.user.id}
                        columns={columns}
                        dataSource={sortedUsers}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys
                        }}
                        pagination={false}
                    />
                </>
            )}
        </>
    );
};

export default AccessTab;