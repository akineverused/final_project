import { useEffect, useState, useContext } from "react";
import { Form, Input, Button, message, Switch, InputNumber } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const { TextArea } = Input;

const ItemDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [item, setItem] = useState(null);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [itemRes, likesRes] = await Promise.all([
                api.get(`/items/${id}`),
                api.get(`/items/${id}/likes`)
            ]);

            setItem(itemRes.data);
            setLikes(likesRes.data.count);
            setLiked(likesRes.data.liked);

            const initialValues = {};
            itemRes.data.fieldValues.forEach(fv => {
                const field = fv.customField;
                const key = `field_${field.id}`;

                // Теперь все текстовые хранятся в stringValue
                if (fv.booleanValue !== null) initialValues[key] = fv.booleanValue;
                else if (fv.numberValue !== null) initialValues[key] = fv.numberValue;
                else if (fv.stringValue !== null) initialValues[key] = fv.stringValue;
            });

            form.setFieldsValue(initialValues);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const canWrite =
        item &&
        (
            item.inventory.ownerId === user?.id ||
            user?.role === "ADMIN" ||
            item.inventory.accessList?.some(a => a.userId === user?.id)
        );

    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/items/${id}/like`);
                setLiked(false);
                setLikes(prev => prev - 1);
            } else {
                await api.post(`/items/${id}/like`);
                setLiked(true);
                setLikes(prev => prev + 1);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const onFinish = async (values) => {
        const formattedValues = item.fieldValues.map(fv => {
            const field = fv.customField;
            const key = `field_${field.id}`;
            const value = values[key] ?? null;

            return {
                id: fv.id, // если нужно для апдейта
                customFieldId: field.id,
                stringValue: field.type === "STRING" || field.type === "TEXT" ? value : null,
                numberValue: field.type === "NUMBER" ? value : null,
                booleanValue: field.type === "BOOLEAN" ? value : null
            };
        });

        try {
            await api.put(`/items/${id}`, { values: formattedValues });
            message.success("Item updated");
            navigate(`/inventories/${item.inventoryId}`);
        } catch (err) {
            console.error(err);
            message.error("Failed to update item");
        }
    };

    if (loading || !item) return <p>Loading...</p>;

    return (
        <>
            <h2>{canWrite ? "Edit Item" : "View Item"}</h2>

            {/* ❤️ Likes */}
            <div style={{ marginBottom: 20 }}>
                <Button onClick={handleLike}>
                    {liked ? "❤️ Liked" : "🤍 Like"} ({likes})
                </Button>
            </div>

            <Form layout="vertical" form={form} onFinish={canWrite ? onFinish : undefined}>
                {item.fieldValues.map(fv => {
                    const field = fv.customField;
                    const name = `field_${field.id}`;

                    if (field.type === "BOOLEAN") {
                        return (
                            <Form.Item key={field.id} name={name} label={field.title} valuePropName="checked">
                                <Switch disabled={!canWrite} />
                            </Form.Item>
                        );
                    }

                    if (field.type === "NUMBER") {
                        return (
                            <Form.Item key={field.id} name={name} label={field.title}>
                                <InputNumber style={{ width: "100%" }} disabled={!canWrite} />
                            </Form.Item>
                        );
                    }

                    if (field.type === "TEXT") {
                        return (
                            <Form.Item key={field.id} name={name} label={field.title}>
                                <TextArea rows={4} disabled={!canWrite} />
                            </Form.Item>
                        );
                    }

                    // STRING
                    return (
                        <Form.Item key={field.id} name={name} label={field.title}>
                            <Input disabled={!canWrite} />
                        </Form.Item>
                    );
                })}

                {canWrite && <Button type="primary" htmlType="submit">Save</Button>}
            </Form>
        </>
    );
};

export default ItemDetailsPage;