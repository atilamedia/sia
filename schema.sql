
-- Database schema for SIA RSHD (Sistem Informasi Akuntansi RSUD H. Damanhuri)
-- Created based on application data structure

-- Dropping tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS cash_flow;
DROP TABLE IF EXISTS journal_entry;
DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS journal_type;

-- Account categories
CREATE TYPE level_type AS ENUM ('Induk', 'Detail Kas', 'Detail Bk', 'Detail', 'Sendiri');
CREATE TYPE account_type AS ENUM ('NERACA', 'LRA', 'LO');

-- Table for Chart of Accounts
CREATE TABLE account (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    balance NUMERIC(15, 2) DEFAULT 0,
    level INTEGER NOT NULL,
    level_type level_type NOT NULL,
    parent_code VARCHAR(20) REFERENCES account(code),
    division VARCHAR(10) NOT NULL DEFAULT '01',
    account_type account_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction categories
CREATE TYPE transaction_type AS ENUM ('debit', 'credit');
CREATE TYPE transaction_category AS ENUM ('cash_in', 'cash_out', 'journal');

-- Table for Transactions
CREATE TABLE transaction (
    id VARCHAR(20) PRIMARY KEY,
    date DATE NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES account(code),
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type transaction_type NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    category transaction_category NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_account ON transaction(account_code);
CREATE INDEX idx_transaction_date ON transaction(date);

-- Table for Journal Types
CREATE TABLE journal_type (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Journal Entries
CREATE TABLE journal_entry (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES account(code),
    description TEXT NOT NULL,
    debit NUMERIC(15, 2) DEFAULT 0,
    credit NUMERIC(15, 2) DEFAULT 0,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entry_code ON journal_entry(code);
CREATE INDEX idx_journal_entry_account ON journal_entry(account_code);

-- Payment methods
CREATE TYPE payment_method AS ENUM ('tunai', 'transfer', 'cek/giro');

-- Table for Cash Flow (both cash in and cash out)
CREATE TABLE cash_flow (
    code VARCHAR(20) PRIMARY KEY,
    date DATE NOT NULL,
    account_code VARCHAR(20) NOT NULL REFERENCES account(code),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    payer VARCHAR(100),
    receiver VARCHAR(100),
    check_number VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    division VARCHAR(10) DEFAULT '01',
    payment_method payment_method,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_flow_account ON cash_flow(account_code);
CREATE INDEX idx_cash_flow_date ON cash_flow(date);

-- Add initial data for journal types
INSERT INTO journal_type (id, name, is_default) VALUES 
('JV', 'Jurnal Umum', TRUE),
('AJE', 'Jurnal Penyesuaian', FALSE),
('CLR', 'Jurnal Penutup', FALSE);

-- Add constraints to ensure valid data
ALTER TABLE journal_entry ADD CONSTRAINT check_journal_entry_amount
    CHECK (debit >= 0 AND credit >= 0 AND (debit > 0 OR credit > 0));

ALTER TABLE cash_flow ADD CONSTRAINT check_cash_flow_payer_receiver
    CHECK (
        (code LIKE 'CI%' AND payer IS NOT NULL) OR
        (code LIKE 'CO%' AND receiver IS NOT NULL) OR
        (NOT (code LIKE 'CI%' OR code LIKE 'CO%'))
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_account_timestamp
BEFORE UPDATE ON account
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_transaction_timestamp
BEFORE UPDATE ON transaction
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journal_type_timestamp
BEFORE UPDATE ON journal_type
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_journal_entry_timestamp
BEFORE UPDATE ON journal_entry
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_cash_flow_timestamp
BEFORE UPDATE ON cash_flow
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Comments for documentation
COMMENT ON TABLE account IS 'Chart of accounts for the accounting system';
COMMENT ON TABLE transaction IS 'All financial transactions in the system';
COMMENT ON TABLE journal_type IS 'Types of journal entries that can be created';
COMMENT ON TABLE journal_entry IS 'Journal entries for accounting records';
COMMENT ON TABLE cash_flow IS 'Cash flow records (both in and out)';
