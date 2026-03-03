import { useEffect, useState } from "react";
import { Form, Input, Button, message, Switch, DatePicker } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateItemPage = () => {
    const { id } = useParams(); // inventoryId
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
            value: values[`field_${field.id}`]
        }));

        await api.post("/items", {
            inventoryId: Number(id),
            values: formattedValues
        });

        message.success("Item created");
        navigate(`/inventories/${id}`);
    };

    return (
        <>
            <h2>Create Item</h2>

            <Form layout="vertical" onFinish={onFinish}>
                {fields.map(field => {
                    const name = `field_${field.id}`;

                    if (field.type === "boolean") {
                        return (
                            <Form.Item
                                key={field.id}
                                name={name}
                                label={field.title}
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        );
                    }

                    if (field.type === "date") {
                        return (
                            <Form.Item
                                key={field.id}
                                name={name}
                                label={field.title}
                            >
                                <DatePicker style={{ width: "100%" }} />
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