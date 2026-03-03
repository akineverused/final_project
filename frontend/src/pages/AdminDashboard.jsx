import { Tabs } from "antd";
import { UsersPage } from "./UsersPage";
import { AdminInventoriesPage } from "./AdminInventoriesPage";

export const AdminDashboard = () => {
    return (
        <div style={{ padding: 24 }}>
            <Tabs
                defaultActiveKey="tables"
                items={[
                    {
                        key: "tables",
                        label: "Tables",
                        children: <AdminInventoriesPage />
                    },
                    {
                        key: "users",
                        label: "Users",
                        children: <UsersPage />
                    }
                ]}
            />
        </div>
    );
};