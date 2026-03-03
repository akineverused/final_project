import {useContext, useEffect, useState} from "react";
import { Input, Button, List } from "antd";
import api from "../../api/axios";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import {LanguageContext} from "../../context/LanguageContext.jsx";

const { TextArea } = Input;

const DiscussionTab = ({ inventoryId }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const {t} = useContext(LanguageContext);

    const loadComments = async () => {
        const res = await api.get(`/inventories/${inventoryId}/comments`);
        setComments(res.data);
    };

    useEffect(() => {
        void loadComments();

        const interval = setInterval(() => {
            void loadComments();
        }, 6000);

        return () => clearInterval(interval);
    }, [inventoryId]);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        await api.post(`/inventories/${inventoryId}/comments`, {
            content: text
        });

        setText("");
        void loadComments();
    };

    return (
        <>
            <TextArea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.writeComment}
            />

            <Button
                type="primary"
                onClick={handleSubmit}
                style={{ marginTop: 8, marginBottom: 16 }}
            >
                {t.post}
            </Button>

            <List
                dataSource={comments}
                renderItem={(item) => (
                    <List.Item>
                        <div style={{ width: "100%" }}>
                            <div style={{ fontSize: 12, color: "gray" }}>
                                <Link to={`/users/${item.user.id}`}>
                                    {item.user.email}
                                </Link>{" "}
                                — {new Date(item.createdAt).toLocaleString()}
                            </div>

                            <ReactMarkdown>
                                {item.content}
                            </ReactMarkdown>
                        </div>
                    </List.Item>
                )}
            />
        </>
    );
};

export default DiscussionTab;