CREATE TABLE management_documents (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id),
    owner_type VARCHAR(40) NOT NULL,
    owner_name VARCHAR(160) NOT NULL,
    owner_identifier VARCHAR(120) NOT NULL,
    document_title VARCHAR(180) NOT NULL,
    document_type VARCHAR(80) NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_data BYTEA NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_management_documents_school_owner ON management_documents (school_id, owner_type, owner_name);
CREATE INDEX idx_management_documents_school_uploaded ON management_documents (school_id, uploaded_at);
