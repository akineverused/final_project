import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const InventoryCard = ({ inventory }) => {

    const navigate = useNavigate();

    return (
        <Card
            hoverable
            onClick={() => navigate(`/inventories/${inventory.id}`)}
            style={{
                height: 160,
                color: "white",
                backgroundImage: `
                    linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 70%),
                    url(${inventory.imageUrl || "/placeholder.jpg"})
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end"
            }}
        >
            <div>
                <h3 style={{ color: "white", marginBottom: 4 }}>
                    {inventory.title}
                </h3>

                <div style={{ fontSize: 13 }}>
                    {inventory.description || inventory.category}
                </div>

                <div style={{ fontSize: 12, opacity: 0.8 }}>
                    By {inventory.owner?.email}
                </div>
            </div>
        </Card>
    );
};

export default InventoryCard;