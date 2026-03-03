import { Form, Input, Button, Select, Switch, message } from "antd";
import {useContext, useEffect, useState} from "react";
import api from "../../api/axios";
import {useNavigate} from "react-router-dom";
import {LanguageContext} from "../../context/LanguageContext.jsx";

const { TextArea } = Input;

const GeneralTab = ({ inventory, refresh }) => {
    const [form] = Form.useForm();
    const [tagOptions, setTagOptions] = useState([]);
    const {t} = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        form.setFieldsValue({
            title: inventory.title,
            description: inventory.description,
            category: inventory.category,
            isPublic: inventory.isPublic,
            imageUrl: inventory.imageUrl,
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

            <Form.Item
                label={t.imageUrl}
                name="imageUrl"
            >
                <Input placeholder={t.pasteImageUrl} />
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