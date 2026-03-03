import { Table, Button } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LanguageContext } from "../../context/LanguageContext.jsx";

const ItemsTab = ({ inventory, refresh, isOwner }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const isManager = inventory.accessList?.some(
        (a) => a.userId === user?.id
    );

    const canWrite = isOwner || isManager || inventory.isPublic;

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    const handleDeleteSelected = async () => {
        try {
            await Promise.all(
                selectedRowKeys.map(id => api.delete(`/items/${id}`))
            );
            setSelectedRowKeys([]);
            refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const getFieldValue = (valueObj) => {
        if (!valueObj) return "";

        if (valueObj.stringValue !== null) return valueObj.stringValue;
        if (valueObj.textValue !== null) return valueObj.textValue;
        if (valueObj.numberValue !== null) return valueObj.numberValue;
        if (valueObj.booleanValue !== null)
            return valueObj.booleanValue ? "Yes" : "No";

        return "";
    };

    const getColumns = () => {
        const baseColumn = [
            {
                title: t.customId,
                dataIndex: "customId",
            },
        ];

        const dynamicColumns = inventory.fields
            .filter(field => field.showInTable)
            .sort((a, b) => a.order - b.order)
            .map(field => ({
                title: field.title,
                render: (_, record) => {
                    const value = record.fieldValues.find(
                        v => v.customFieldId === field.id
                    );
                    return getFieldValue(value);
                }
            }));

        return [...baseColumn, ...dynamicColumns];
    };

    return (
        <>
            {canWrite && (
                <>
                    <Button
                        type="primary"
                        onClick={() =>
                            navigate(`/inventories/${inventory.id}/items/create`)
                        }
                        style={{ marginBottom: 16 }}
                    >
                        {t.addItem}
                    </Button>

                    <Button
                        danger
                        disabled={!selectedRowKeys.length}
                        onClick={handleDeleteSelected}
                        style={{ marginBottom: 16, marginLeft: 8 }}
                    >
                        {t.delete}
                    </Button>
                </>
            )}

            <Table
                rowKey="id"
                columns={getColumns()}
                dataSource={inventory.items}
                rowSelection={canWrite && rowSelection}
                onRow={(record) => ({
                    onClick: () => navigate(`/items/${record.id}`)
                })}
            />
        </>
    );
};

export default ItemsTab;