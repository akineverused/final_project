import React, { useState, useContext } from "react";
import cl from "./Loginpage.module.css";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const { Title, Text } = Typography;

export const LoginPage = () => {
    const [mode, setMode] = useState("login");
    const { login, register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            if (mode === "login") {
                await login(values.email, values.password);
                message.success("Logged in successfully");
                setTimeout(() => {
                    if (user?.role === "ADMIN") {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }
                }, 100);
            } else {
                await register(values.email, values.password);
                message.success("Registered successfully");
                setMode("login");
            }
        } catch (e) {
            message.error(
                e.response?.data?.message || "Something went wrong"
            );
        }
    };

    return (
        <div className={cl.wrap}>
            <Card className={cl.card}>
                <Title level={3}>
                    {mode === "login" ? "Sign in" : "Sign up"}
                </Title>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Invalid email format" }
                        ]}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: "Please enter your password" }
                        ]}
                    >
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {mode === "login" ? "Log in" : "Register"}
                        </Button>
                    </Form.Item>
                </Form>

                <Text>
                    {mode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}
                </Text>

                <Button
                    type="link"
                    onClick={() =>
                        setMode(mode === "login" ? "register" : "login")
                    }
                >
                    {mode === "login" ? "Sign up" : "Sign in"}
                </Button>
            </Card>
        </div>
    );
};