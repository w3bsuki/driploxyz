CREATE INDEX idx_products_search_vector_gin ON products USING gin(search_vector);
