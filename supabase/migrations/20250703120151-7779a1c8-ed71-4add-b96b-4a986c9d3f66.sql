
-- Konversi schema MySQL SIA RSHD ke PostgreSQL

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS aktivitas_aruskas CASCADE;
DROP TABLE IF EXISTS anggaran CASCADE;
DROP TABLE IF EXISTS hak_akses CASCADE;
DROP TABLE IF EXISTS jurnal CASCADE;
DROP TABLE IF EXISTS jurnalumum CASCADE;
DROP TABLE IF EXISTS jurnalumum_kasbank CASCADE;
DROP TABLE IF EXISTS jurnal_jenis CASCADE;
DROP TABLE IF EXISTS kaskeluar CASCADE;
DROP TABLE IF EXISTS kaskeluar_jurnal CASCADE;
DROP TABLE IF EXISTS kasmasuk CASCADE;
DROP TABLE IF EXISTS kasmasuk_jurnal CASCADE;
DROP TABLE IF EXISTS lra CASCADE;
DROP TABLE IF EXISTS modul_jenis CASCADE;
DROP TABLE IF EXISTS modul_lain CASCADE;
DROP TABLE IF EXISTS modul_laporan CASCADE;
DROP TABLE IF EXISTS modul_master CASCADE;
DROP TABLE IF EXISTS modul_pembelian CASCADE;
DROP TABLE IF EXISTS m_rekening CASCADE;
DROP TABLE IF EXISTS divisi CASCADE;

-- Create ENUM types
CREATE TYPE jenis_aktivitas AS ENUM ('OPERASI', 'INVESTASI', 'PENDANAAN', 'KAS');
CREATE TYPE subjenis_aktivitas AS ENUM ('PENYESUAIAN', 'PERUBAHAN', 'LAIN');
CREATE TYPE validasi_enum AS ENUM ('Y', 'N');
CREATE TYPE level_rekening AS ENUM ('Induk', 'Detail Kas', 'Detail Bk', 'Detail', 'Sendiri');
CREATE TYPE jenis_rekening AS ENUM ('NERACA', 'LRA', 'LO');

-- Create divisi table first (referenced by other tables)
CREATE TABLE divisi (
    id_div CHAR(2) PRIMARY KEY,
    nama_div VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default division
INSERT INTO divisi (id_div, nama_div) VALUES ('01', 'Divisi Utama');

-- Create m_rekening table
CREATE TABLE m_rekening (
    kode_rek VARCHAR(15) PRIMARY KEY,
    nama_rek VARCHAR(150),
    saldo DECIMAL(15,2) DEFAULT 0.00,
    level INTEGER DEFAULT 0,
    k_level level_rekening DEFAULT 'Induk',
    rek_induk VARCHAR(15) DEFAULT ' ',
    id_div CHAR(2) NOT NULL DEFAULT '01',
    jenis_rek jenis_rekening DEFAULT 'NERACA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_div) REFERENCES divisi(id_div),
    FOREIGN KEY (rek_induk) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create aktivitas_aruskas table
CREATE TABLE aktivitas_aruskas (
    kode_rek VARCHAR(15) PRIMARY KEY,
    jenis jenis_aktivitas NOT NULL DEFAULT 'OPERASI',
    subjenis subjenis_aktivitas NOT NULL DEFAULT 'LAIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create anggaran table
CREATE TABLE anggaran (
    tahun INTEGER NOT NULL,
    kode_rek VARCHAR(15) NOT NULL,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    validasi_realisasi validasi_enum DEFAULT 'Y',
    usernya VARCHAR(20) DEFAULT ' ',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tanda validasi_enum NOT NULL DEFAULT 'N',
    PRIMARY KEY (tahun, kode_rek),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create jurnal_jenis table
CREATE TABLE jurnal_jenis (
    id_jj VARCHAR(3) PRIMARY KEY,
    nm_jj VARCHAR(100) NOT NULL,
    is_default validasi_enum DEFAULT 'N',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default journal types
INSERT INTO jurnal_jenis (id_jj, nm_jj, is_default) VALUES 
('JU', 'Jurnal Umum', 'Y'),
('JP', 'Jurnal Penyesuaian', 'N'),
('JT', 'Jurnal Penutup', 'N');

-- Create jurnalumum table
CREATE TABLE jurnalumum (
    id_ju VARCHAR(18) PRIMARY KEY,
    tanggal DATE,
    usernya VARCHAR(50) DEFAULT ' ',
    id_div CHAR(2) NOT NULL DEFAULT '01',
    id_jj VARCHAR(3) NOT NULL DEFAULT 'JU',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mark_cetak INTEGER DEFAULT 0,
    is_mutasi validasi_enum DEFAULT 'N',
    FOREIGN KEY (id_div) REFERENCES divisi(id_div),
    FOREIGN KEY (id_jj) REFERENCES jurnal_jenis(id_jj)
);

-- Create jurnal table
CREATE TABLE jurnal (
    kode VARCHAR(18) NOT NULL,
    kode_rek VARCHAR(15) NOT NULL,
    tanggal DATE,
    deskripsi VARCHAR(250) DEFAULT ' ',
    debit DECIMAL(15,2) DEFAULT 0.00,
    kredit DECIMAL(15,2) DEFAULT 0.00,
    usernya VARCHAR(50) DEFAULT ' ',
    tanda_lo validasi_enum DEFAULT 'N',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (kode, kode_rek),
    FOREIGN KEY (kode) REFERENCES jurnalumum(id_ju),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create kasmasuk table
CREATE TABLE kasmasuk (
    id_km VARCHAR(18) PRIMARY KEY,
    tanggal DATE,
    kode_rek VARCHAR(15) NOT NULL,
    total DECIMAL(15,2) DEFAULT 0.00,
    keterangan VARCHAR(250) DEFAULT ' ',
    pembayar VARCHAR(50) DEFAULT ' ',
    no_cek VARCHAR(20) DEFAULT ' ',
    usernya VARCHAR(50) DEFAULT ' ',
    id_div CHAR(2) DEFAULT '01',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mark_cetak INTEGER DEFAULT 0,
    FOREIGN KEY (id_div) REFERENCES divisi(id_div),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create kasmasuk_jurnal table
CREATE TABLE kasmasuk_jurnal (
    kode VARCHAR(18) NOT NULL,
    kode_rek VARCHAR(15) NOT NULL,
    tanggal DATE,
    deskripsi VARCHAR(250) DEFAULT ' ',
    debit DECIMAL(15,2) DEFAULT 0.00,
    kredit DECIMAL(15,2) DEFAULT 0.00,
    usernya VARCHAR(50) DEFAULT ' ',
    rek_lra VARCHAR(15) DEFAULT '',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (kode, kode_rek),
    FOREIGN KEY (kode) REFERENCES kasmasuk(id_km),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create kaskeluar table
CREATE TABLE kaskeluar (
    id_kk VARCHAR(18) PRIMARY KEY,
    tanggal DATE,
    bagian_seksi VARCHAR(100) DEFAULT ' ',
    kode_rek VARCHAR(15),
    total DECIMAL(15,2) DEFAULT 0.00,
    keterangan VARCHAR(250) DEFAULT ' ',
    penerima VARCHAR(50) DEFAULT ' ',
    no_cek VARCHAR(20) DEFAULT ' ',
    usernya VARCHAR(50) DEFAULT ' ',
    id_div CHAR(2) NOT NULL DEFAULT '01',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mark_cetak INTEGER DEFAULT 0,
    FOREIGN KEY (id_div) REFERENCES divisi(id_div),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create kaskeluar_jurnal table
CREATE TABLE kaskeluar_jurnal (
    kode VARCHAR(18) NOT NULL,
    kode_rek VARCHAR(15) NOT NULL,
    tanggal DATE,
    deskripsi VARCHAR(250) DEFAULT ' ',
    debit DECIMAL(15,2) DEFAULT 0.00,
    kredit DECIMAL(15,2) DEFAULT 0.00,
    usernya VARCHAR(50) DEFAULT ' ',
    rek_lra VARCHAR(15) DEFAULT '',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (kode, kode_rek),
    FOREIGN KEY (kode) REFERENCES kaskeluar(id_kk),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create lra table
CREATE TABLE lra (
    kode VARCHAR(18) NOT NULL,
    kode_rek VARCHAR(15) NOT NULL,
    tanggal DATE,
    deskripsi VARCHAR(250) DEFAULT ' ',
    debit DECIMAL(15,2) DEFAULT 0.00,
    kredit DECIMAL(15,2) DEFAULT 0.00,
    usernya VARCHAR(50) DEFAULT ' ',
    at_create TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rek_kas VARCHAR(15) NOT NULL DEFAULT '',
    PRIMARY KEY (kode, kode_rek),
    FOREIGN KEY (kode_rek) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

-- Create other supporting tables
CREATE TABLE jurnalumum_kasbank (
    kode VARCHAR(18) PRIMARY KEY,
    rek_dari VARCHAR(15) NOT NULL,
    rek_tujuan VARCHAR(15) NOT NULL,
    keterangan VARCHAR(250) DEFAULT ' ',
    FOREIGN KEY (kode) REFERENCES jurnalumum(id_ju),
    FOREIGN KEY (rek_dari) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE,
    FOREIGN KEY (rek_tujuan) REFERENCES m_rekening(kode_rek) ON UPDATE CASCADE
);

CREATE TABLE modul_jenis (
    id_mod INTEGER PRIMARY KEY,
    nm_mod VARCHAR(100) DEFAULT ' ',
    tb_jurnal VARCHAR(50) DEFAULT ' ',
    dok_sumber validasi_enum DEFAULT 'N',
    tb_where VARCHAR(100) DEFAULT ' ',
    tb_join VARCHAR(200) DEFAULT ' '
);

CREATE TABLE hak_akses (
    no_id INTEGER NOT NULL DEFAULT 0,
    id_mod INTEGER NOT NULL DEFAULT 0,
    no_ INTEGER DEFAULT 0,
    UNIQUE (id_mod, no_, no_id)
);

CREATE TABLE modul_lain (
    id_mod INTEGER NOT NULL DEFAULT 0,
    no_ INTEGER DEFAULT 0,
    nm_mod VARCHAR(60) DEFAULT ' ',
    urutnya INTEGER DEFAULT 0,
    UNIQUE (id_mod, no_)
);

CREATE TABLE modul_laporan (
    id_mod INTEGER NOT NULL DEFAULT 0,
    no_ INTEGER DEFAULT 0,
    nm_mod VARCHAR(60) DEFAULT ' ',
    urutnya INTEGER DEFAULT 0,
    UNIQUE (id_mod, no_)
);

CREATE TABLE modul_master (
    id_mod INTEGER NOT NULL DEFAULT 0,
    no_ INTEGER DEFAULT 0,
    nm_mod VARCHAR(60) DEFAULT ' ',
    urutnya INTEGER DEFAULT 0,
    UNIQUE (id_mod, no_)
);

CREATE TABLE modul_pembelian (
    id_mod INTEGER NOT NULL DEFAULT 0,
    no_ INTEGER DEFAULT 0,
    nm_mod VARCHAR(60) DEFAULT ' ',
    urutnya INTEGER DEFAULT 0,
    UNIQUE (id_mod, no_)
);

-- Create indexes for better performance
CREATE INDEX idx_anggaran_tahun_tanda ON anggaran(tahun, tanda);
CREATE INDEX idx_jurnal_kode_rek ON jurnal(kode_rek);
CREATE INDEX idx_kasmasuk_jurnal_tanggal_kode_rek ON kasmasuk_jurnal(tanggal, kode_rek);
CREATE INDEX idx_kaskeluar_jurnal_tanggal_kode_rek ON kaskeluar_jurnal(tanggal, kode_rek);
CREATE INDEX idx_lra_tanggal_kode_rek ON lra(tanggal, kode_rek);
CREATE INDEX idx_m_rekening_id_div ON m_rekening(id_div);
CREATE INDEX idx_m_rekening_rek_induk ON m_rekening(rek_induk);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_m_rekening_timestamp
BEFORE UPDATE ON m_rekening
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_anggaran_timestamp
BEFORE UPDATE ON anggaran
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_jurnalumum_timestamp
BEFORE UPDATE ON jurnalumum
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_kasmasuk_timestamp
BEFORE UPDATE ON kasmasuk
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_kaskeluar_timestamp
BEFORE UPDATE ON kaskeluar
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Insert sample data for testing
INSERT INTO m_rekening (kode_rek, nama_rek, saldo, level, k_level, id_div, jenis_rek) VALUES
('1', 'ASET', 0, 1, 'Induk', '01', 'NERACA'),
('1.1', 'ASET LANCAR', 0, 2, 'Induk', '01', 'NERACA'),
('1.1.01', 'Kas di Bendahara Pengeluaran', 0, 3, 'Detail Kas', '01', 'NERACA'),
('1.1.02', 'Kas di Bendahara Penerimaan', 0, 3, 'Detail Kas', '01', 'NERACA'),
('1.1.03', 'Bank', 0, 3, 'Detail Bk', '01', 'NERACA'),
('4', 'PENDAPATAN', 0, 1, 'Induk', '01', 'LRA'),
('4.1', 'Pendapatan Asli Daerah', 0, 2, 'Induk', '01', 'LRA'),
('4.1.01', 'Retribusi Pelayanan Kesehatan', 0, 3, 'Detail', '01', 'LRA'),
('5', 'BELANJA', 0, 1, 'Induk', '01', 'LRA'),
('5.1', 'Belanja Operasi', 0, 2, 'Induk', '01', 'LRA'),
('5.1.01', 'Belanja Pegawai', 0, 3, 'Detail', '01', 'LRA');

-- Update rek_induk references
UPDATE m_rekening SET rek_induk = '1' WHERE kode_rek = '1.1';
UPDATE m_rekening SET rek_induk = '1.1' WHERE kode_rek IN ('1.1.01', '1.1.02', '1.1.03');
UPDATE m_rekening SET rek_induk = '4' WHERE kode_rek = '4.1';
UPDATE m_rekening SET rek_induk = '4.1' WHERE kode_rek = '4.1.01';
UPDATE m_rekening SET rek_induk = '5' WHERE kode_rek = '5.1';
UPDATE m_rekening SET rek_induk = '5.1' WHERE kode_rek = '5.1.01';

-- Insert sample aktivitas aruskas
INSERT INTO aktivitas_aruskas (kode_rek, jenis, subjenis) VALUES
('1.1.01', 'OPERASI', 'LAIN'),
('1.1.02', 'OPERASI', 'LAIN'),
('1.1.03', 'OPERASI', 'LAIN');

-- Comments for documentation
COMMENT ON TABLE m_rekening IS 'Master chart of accounts for SIA RSHD';
COMMENT ON TABLE kasmasuk IS 'Cash inflow transactions';
COMMENT ON TABLE kaskeluar IS 'Cash outflow transactions';
COMMENT ON TABLE jurnal IS 'Journal entries detail';
COMMENT ON TABLE jurnalumum IS 'Journal entries header';
COMMENT ON TABLE anggaran IS 'Budget data by account and year';
COMMENT ON TABLE aktivitas_aruskas IS 'Cash flow activity classification';
