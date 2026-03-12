import { Form, Input, Button, Select, Switch, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {useContext, useRef, useState} from "react";
import {LanguageContext} from "../context/LanguageContext.jsx";

const { TextArea } = Input;
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const CreateInventoryPage = () => {
    const navigate = useNavigate();
    const searchTimeout = useRef(null);
    const [tagOptions, setTagOptions] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const {t} = useContext(LanguageContext);

    const onFinish = async (values) => {

        try {

            const res = await api.post("/inventories", {
                ...values,
                imageUrl
            });

            message.success("Inventory created");

            navigate(`/inventories/${res.data.id}`);

        } catch(err) {
            message.error(err.response?.data?.message || "Failed to create inventory");
        }

    };

    const handleSearchTags = (value) => {

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(async () => {

            const res = await api.get(`/inventories/tags/search?q=${value}`);

            setTagOptions(
                res.data.map(tag => ({
                    value: tag.name,
                    label: tag.name
                }))
            );

        }, 500);

    };

    const loadInitialTags = async () => {

        const res = await api.get("/inventories/tags/search?q=");

        setTagOptions(
            res.data.map(tag => ({
                value: tag.name,
                label: tag.name
            }))
        );
    };

    const handleUpload = async (file) => {

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        setImageUrl(res.data.url);

        return false;
    };

    return (
        <>
            <h2>{t.createInventory}</h2>

            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label={t.title}
                    name="title"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label={t.description}
                    name="description"
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label={t.category}
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
                    label={t.tags}
                    name="tags"
                >
                    <Select
                        mode="tags"
                        showSearch
                        style={{ width: "100%" }}
                        placeholder={t.enterTags}
                        onSearch={handleSearchTags}
                        onFocus={loadInitialTags}
                        options={tagOptions}
                        filterOption={false}
                    />
                </Form.Item>

                <Form.Item
                    label={t.publicInventory}
                    name="isPublic"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item label="Image">
                    <Upload
                        beforeUpload={handleUpload}
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined />}>
                            Upload image
                        </Button>
                    </Upload>

                    {imageUrl && (
                        <img
                            src={imageUrl}
                            style={{ width: 200, marginTop: 10 }}
                        />
                    )}
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    {t.create}
                </Button>
            </Form>
        </>
    );
};

export default CreateInventoryPage;