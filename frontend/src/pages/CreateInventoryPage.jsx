import { Form, Input, Button, Select, Switch, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {useState} from "react";

const { TextArea } = Input;

const CreateInventoryPage = () => {
    const navigate = useNavigate();
    const [tagOptions, setTagOptions] = useState([]);

    const onFinish = async (values) => {
        try {
            const res = await api.post("/inventories", values);
            message.success("Inventory created");
            navigate(`/inventories/${res.data.id}`);
        } catch (error) {
            message.error("Failed to create inventory");
        }
    };

    const handleSearchTags = async (value) => {
        if (!value || value.length < 2) return;

        const res = await api.get(`/inventories/tags/search?q=${value}`);

        setTagOptions(
            res.data.map(tag => ({
                value: tag.name,
                label: tag.name
            }))
        );
    };

    return (
        <>
            <h2>Create Inventory</h2>

            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Description (Markdown supported)"
                    name="description"
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true }]}
                >
                    <Select
                        options={[
                            { value: "Equipment" },
                            { value: "Furniture" },
                            { value: "Book" },
                            { value: "Other" },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Tags"
                    name="tags"
                >
                    <Select
                        mode="tags"
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="Enter tags"
                        onSearch={handleSearchTags}
                        options={tagOptions}
                        filterOption={false}
                    />
                </Form.Item>

                <Form.Item
                    label="Public inventory"
                    name="isPublic"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    Create
                </Button>
            </Form>
        </>
    );
};

export default CreateInventoryPage;