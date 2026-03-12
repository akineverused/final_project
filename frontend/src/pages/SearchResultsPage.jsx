import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Row, Col } from "antd";
import api from "../api/axios";
import InventoryCard from "../components/InventoryCard.jsx";

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);

    const query = searchParams.get("q");

    useEffect(() => {
        if (query) {
            loadResults();
        }
    }, [query]);

    const loadResults = async () => {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data);
    };

    return (
        <>
            <h2>Search Results for "{query}"</h2>

            <Row gutter={[16, 16]}>
                {results.map(inv => (
                    <Col span={6} key={inv.id}>
                        <InventoryCard inventory={inv}/>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default SearchResultsPage;