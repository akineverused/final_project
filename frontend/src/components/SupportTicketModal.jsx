import { useContext, useMemo, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext.jsx";

const { TextArea } = Input;

const SupportTicketModal = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const location = useLocation();
    const params = useParams();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const inventoryId = useMemo(() => {
        if (params?.id && location.pathname.startsWith("/inventories/")) {
            return Number(params.id);
        }
        return null;
    }, [params, location.pathname]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                summary: values.summary,
                priority: values.priority,
                inventoryId,
                link: window.location.href
            };

            await api.post("/support-tickets", payload);

            message.success("Support ticket created successfully");
            form.resetFields();
            onClose();
        } catch (error) {
            if (error?.errorFields) return;

            console.error(error);
            message.error(
                error?.response?.data?.message || "Failed to create support ticket"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create support ticket"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Submit"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Reported by">
                    <Input
                        value={user?.email || ""}
                        disabled
                    />
                </Form.Item>

                <Form.Item label="Current page">
                    <Input
                        value={window.location.href}
                        disabled
                    />
                </Form.Item>

                <Form.Item label="Inventory ID">
                    <Input
                        value={inventoryId ?? "Not related to inventory"}
                        disabled
                    />
                </Form.Item>

                <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true, message: "Please select priority" }]}
                >
                    <Select
                        options={[
                            { value: "High", label: "High" },
                            { value: "Average", label: "Average" },
                            { value: "Low", label: "Low" }
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="summary"
                    label="Summary"
                    rules={[
                        { required: true, message: "Please enter summary" },
                        { min: 5, message: "Summary is too short" }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Describe the problem"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SupportTicketModal;