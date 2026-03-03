import {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Tabs} from "antd";
import api from "../api/axios";
import ItemsTab from "../components/inventoryTabs/ItemsTab.jsx";
import DiscussionTab from "../components/inventoryTabs/DiscussionTab.jsx";
import CustomIdTab from "../components/inventoryTabs/CustomIdTab.jsx";
import GeneralTab from "../components/inventoryTabs/GeneralTab.jsx";
import AccessTab from "../components/inventoryTabs/AccessTab.jsx";
import FieldsTab from "../components/inventoryTabs/FieldsTab.jsx";
import StatisticsTab from "../components/inventoryTabs/StatisticsTab.jsx";
import {AuthContext} from "../context/AuthContext.jsx";
import {LanguageContext} from "../context/LanguageContext.jsx";

const InventoryPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext)
    const [inventory, setInventory] = useState(null);

    useEffect(() => {
        void fetchInventory();
    }, [id]);

    const fetchInventory = async () => {
        const res = await api.get(`/inventories/${id}`);
        setInventory(res.data);
    };

    if (!inventory) return <p>Loading...</p>;

    const isOwner = inventory.ownerId === user?.id || user?.role === "ADMIN";

    return (
        <>
            <h2>{inventory.title}</h2>

            <Tabs
                defaultActiveKey="items"
                items={[
                    {
                        key: "items",
                        label: t.items,
                        children: (
                            <ItemsTab
                                inventory={inventory}
                                refresh={fetchInventory}
                                isOwner={isOwner}
                            />
                        ),
                    },
                    {
                        key: "discussion",
                        label: t.discussion,
                        children: (
                            <DiscussionTab inventoryId={inventory.id} />
                        ),
                    },
                    isOwner && {
                        key: "general",
                        label: t.generalSettings,
                        children: (
                            <GeneralTab
                                inventory={inventory}
                                refresh={fetchInventory}
                            />
                        ),
                    },
                    isOwner && {
                        key: "customId",
                        label: t.customId,
                        children: (
                            <CustomIdTab
                                inventory={inventory}
                                refresh={fetchInventory}
                            />
                        ),
                    },
                    isOwner && {
                        key: "access",
                        label: t.accessSettings,
                        children: (
                            <AccessTab
                                inventory={inventory}
                                refresh={fetchInventory}
                            />
                        ),
                    },
                    isOwner && {
                        key: "fields",
                        label: t.fields,
                        children: (
                            <FieldsTab inventoryId={inventory.id} />
                        ),
                    },
                    {
                        key: "stats",
                        label: t.statistics,
                        children: (
                            <StatisticsTab inventoryId={inventory.id} />
                        ),
                    }
                ].filter(Boolean)}

            />
        </>
    );
};

export default InventoryPage;