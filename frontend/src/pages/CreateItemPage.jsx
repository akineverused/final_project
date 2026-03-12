import { useEffect, useState } from "react";
import { Form, Input, Button, message, Switch, InputNumber } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateItemPage = () => {
    const { id } = useParams();
    const [fields, setFields] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        const res = await api.get(`/custom-fields/${id}`);
        setFields(res.data);
    };

    const onFinish = async (values) => {
        const formattedValues = fields.map(field => ({
            customFieldId: field.id,
            type: field.type,
            value: values[`field_${field.id}`] ?? null
        }));

        try {
            await api.post("/items", {
                inventoryId: Number(id),
                values: formattedValues
            });

            message.success("Item created");
            navigate(`/inventories/${id}`);

        } catch (err) {
            message.error(err.response?.data?.message || "Failed to create item");
        }
    };

    return (
        <>
            <h2>Create Item</h2>

            <Form layout="vertical" onFinish={onFinish}>
                {fields.map(field => {
                    const name = `field_${field.id}`;

                    if (field.type === "BOOLEAN") {
                        return (
                            <Form.Item
                                key={field.id}
                                name={name}
                                label={field.title}
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Switch />
                            </Form.Item>
                        );
                    }

                    if (field.type === "NUMBER") {
                        return (
                            <Form.Item
                                key={field.id}
                                name={name}
                                label={field.title}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        );
                    }

                    return (
                        <Form.Item
                            key={field.id}
                            name={name}
                            label={field.title}
                        >
                            <Input />
                        </Form.Item>
                    );
                })}

                <Button type="primary" htmlType="submit">
                    Create
                </Button>
            </Form>
        </>
    );
};

export default CreateItemPage;