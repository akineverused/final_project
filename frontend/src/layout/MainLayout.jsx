import {Layout, Button, Input, Dropdown, Menu, Switch, Avatar} from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../context/ThemeContext";
import { useContext } from "react";

const { Header, Content } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { lang, setLang, t } = useContext(LanguageContext);
    const { isDark, setIsDark } = useContext(ThemeContext);

    const items = [
        {
            key: "profile",
            label: t.profile,
            onClick: () => navigate(`/users/${user.id}`)
        },
        ...(user.role === "ADMIN" && [
            {
                type: "divider"
            },
            {
                key: "admin",
                label: t.admin,
                onClick: () => navigate("/admin")
            }
        ]),
        {
            type: "divider"
        },
        {
            key: "language",
            label: (
                <div>
                    <div>{t.language}</div>
                    <div style={{ marginTop: 8 }}>
                        <Button
                            size="small"
                            type={lang === "en" ? "primary" : "default"}
                            onClick={(e) => {
                                e.domEvent?.stopPropagation?.();
                                setLang("en");
                            }}
                            style={{ marginRight: 8 }}
                        >
                            EN
                        </Button>
                        <Button
                            size="small"
                            type={lang === "ru" ? "primary" : "default"}
                            onClick={(e) => {
                                e.domEvent?.stopPropagation?.();
                                setLang("ru");
                            }}
                        >
                            RU
                        </Button>
                    </div>
                </div>
            )
        },
        {
            type: "divider"
        },
        {
            key: "theme",
            label: (
                <div>
                    <div>{t.theme}</div>
                    <div style={{ marginTop: 8 }}>
                        <Switch
                            checked={isDark}
                            onChange={(checked) => setIsDark(checked)}
                            checkedChildren="Dark"
                            unCheckedChildren="Light"
                        />
                    </div>
                </div>
            )
        },
        {
            type: "divider"
        },
        {
            key: "logout",
            label: <span style={{ color: "red" }}>{t.logout}</span>,
            onClick: logout
        },

    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div
                    style={{
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                    onClick={() => navigate("/")}
                >
                    Inventory App
                </div>

                <Input.Search
                    placeholder={t.search}
                    style={{ width: 300 }}
                    onSearch={(value) => {
                        if (value.trim()) {
                            navigate(`/search?q=${value}`);
                        }
                    }}
                />

                <div style={{ display: "flex", gap: 12 }}>

                    <Button
                        onClick={() => navigate("/inventories/create")}
                    >
                        {t.createInventory}
                    </Button>

                    <Dropdown menu={{ items }} trigger={["click"]}>
                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                            <Avatar>
                                {user.email[0].toUpperCase()}
                            </Avatar>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <Content style={{ padding: 24 }}>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default MainLayout;