import { Form, Input, Button, Select, Switch, message } from "antd";
import {useContext, useEffect, useState} from "react";
import api from "../../api/axios";
import {useNavigate} from "react-router-dom";
import {LanguageContext} from "../../context/LanguageContext.jsx";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const GeneralTab = ({ inventory, refresh }) => {
    const [form] = Form.useForm();
    const [tagOptions, setTagOptions] = useState([]);
    const {t} = useContext(LanguageContext);
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState(inventory.imageUrl);

    useEffect(() => {

        setImageUrl(inventory.imageUrl);

        form.setFieldsValue({
            title: inventory.title,
            description: inventory.description,
            category: inventory.category,
            isPublic: inventory.isPublic,
            tags: inventory.tags?.map(t => t.tag.name) || []
        });

    }, [inventory]);

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

    const onFinish = async (values) => {
        try {
            await api.put(`/inventories/${inventory.id}`, {
                ...values,
                imageUrl,
                version: inventory.version
            });

            message.success("Inventory updated");
            refresh();
        } catch (error) {
            if (error.response?.status === 409) {
                message.error("Inventory was modified by another user");
            } else {
                message.error("Update failed");
            }
        }
    };

    const deleteInventory = async () => {
        try {
            await api.delete(`/inventories/${inventory.id}`);
            navigate("/");
        } catch (error){
            message.error("Fail");
        }
    };

    const handleUpload = async (file) => {

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/files/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        setImageUrl(res.data.url);

        message.success("Image uploaded");

        return false;
    };

    return (
        <Form layout="vertical" form={form} onFinish={onFinish}>
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
                        { value: t.equipment },
                        { value: t.furniture },
                        { value: t.book },
                        { value: t.other }
                    ]}
                />
            </Form.Item>

            <Form.Item label={t.imageUrl}>

                <Upload
                    beforeUpload={handleUpload}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />}>
                        Upload image
                    </Button>
                </Upload>

                {imageUrl && (
                    <div style={{ marginTop: 10 }}>
                        <img
                            src={imageUrl}
                            alt="inventory"
                            style={{ width: 200, borderRadius: 6 }}
                        />
                    </div>
                )}

            </Form.Item>

            <Form.Item
                label={t.tags}
                name="tags"
            >
                <Select
                    mode="tags"
                    showSearch
                    onSearch={handleSearchTags}
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

            <Button type="primary" htmlType="submit">
                {t.saveChanges}
            </Button>
            <Button
                danger
                onClick={deleteInventory}
                style={{marginLeft: 16}}
            >
                {t.deleteInventory}
            </Button>
        </Form>
    );
};

export default GeneralTab;