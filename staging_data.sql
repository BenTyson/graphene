--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.user_bookmarks DROP CONSTRAINT user_bookmarks_article_id_fkey;
ALTER TABLE ONLY public.tem_tests DROP CONSTRAINT tem_tests_graphene_sample_fkey;
ALTER TABLE ONLY public.tem_tests DROP CONSTRAINT tem_tests_compound_batch_number_fkey;
ALTER TABLE ONLY public.raman_tests DROP CONSTRAINT raman_tests_graphene_sample_fkey;
ALTER TABLE ONLY public.raman_tests DROP CONSTRAINT raman_tests_compound_batch_number_fkey;
ALTER TABLE ONLY public.news_articles DROP CONSTRAINT news_articles_source_id_fkey;
ALTER TABLE ONLY public.micronizations DROP CONSTRAINT micronizations_graphene_sample_fkey;
ALTER TABLE ONLY public.micronizations DROP CONSTRAINT micronizations_compound_batch_number_fkey;
ALTER TABLE ONLY public.material_shipments DROP CONSTRAINT material_shipments_micronization_sku_fkey;
ALTER TABLE ONLY public.material_shipments DROP CONSTRAINT material_shipments_graphene_sample_fkey;
ALTER TABLE ONLY public.material_shipments DROP CONSTRAINT material_shipments_compound_batch_number_fkey;
ALTER TABLE ONLY public.graphene_update_reports DROP CONSTRAINT graphene_update_reports_update_report_id_fkey;
ALTER TABLE ONLY public.graphene_update_reports DROP CONSTRAINT graphene_update_reports_graphene_id_fkey;
ALTER TABLE ONLY public.graphene_sem_reports DROP CONSTRAINT graphene_sem_reports_sem_report_id_fkey;
ALTER TABLE ONLY public.graphene_sem_reports DROP CONSTRAINT graphene_sem_reports_graphene_id_fkey;
ALTER TABLE ONLY public.graphene_compound_batches DROP CONSTRAINT graphene_compound_batches_graphene_id_fkey;
ALTER TABLE ONLY public.graphene_compound_batches DROP CONSTRAINT graphene_compound_batches_compound_batch_id_fkey;
ALTER TABLE ONLY public.graphene DROP CONSTRAINT graphene_biochar_lot_number_fkey;
ALTER TABLE ONLY public.graphene DROP CONSTRAINT graphene_biochar_experiment_fkey;
ALTER TABLE ONLY public.content_processing_logs DROP CONSTRAINT content_processing_logs_source_id_fkey;
ALTER TABLE ONLY public.conductivity_tests DROP CONSTRAINT conductivity_tests_graphene_sample_fkey;
ALTER TABLE ONLY public.conductivity_tests DROP CONSTRAINT conductivity_tests_compound_batch_number_fkey;
ALTER TABLE ONLY public.compound_batch_update_reports DROP CONSTRAINT compound_batch_update_reports_update_report_id_fkey;
ALTER TABLE ONLY public.compound_batch_update_reports DROP CONSTRAINT compound_batch_update_reports_compound_batch_id_fkey;
ALTER TABLE ONLY public.compound_batch_sem_reports DROP CONSTRAINT compound_batch_sem_reports_sem_report_id_fkey;
ALTER TABLE ONLY public.compound_batch_sem_reports DROP CONSTRAINT compound_batch_sem_reports_compound_batch_id_fkey;
ALTER TABLE ONLY public.biochar DROP CONSTRAINT biochar_lot_number_fkey;
ALTER TABLE ONLY public.bet DROP CONSTRAINT bet_graphene_sample_fkey;
ALTER TABLE ONLY public.bet DROP CONSTRAINT bet_compound_batch_number_fkey;
DROP INDEX public.users_username_key;
DROP INDEX public.users_username_idx;
DROP INDEX public.users_role_idx;
DROP INDEX public.users_email_key;
DROP INDEX public.users_email_idx;
DROP INDEX public.user_bookmarks_user_id_created_at_idx;
DROP INDEX public.user_bookmarks_article_id_user_id_key;
DROP INDEX public.update_reports_week_of_idx;
DROP INDEX public.update_reports_created_at_idx;
DROP INDEX public.tem_tests_testing_lab_test_date_idx;
DROP INDEX public.tem_tests_test_date_idx;
DROP INDEX public.tem_tests_graphene_sample_test_date_idx;
DROP INDEX public.tem_tests_graphene_sample_idx;
DROP INDEX public.tem_tests_created_at_idx;
DROP INDEX public.tem_tests_compound_batch_number_test_date_idx;
DROP INDEX public.tem_tests_compound_batch_number_idx;
DROP INDEX public.sem_reports_report_date_idx;
DROP INDEX public.sem_reports_created_at_idx;
DROP INDEX public.raman_tests_testing_lab_test_date_idx;
DROP INDEX public.raman_tests_test_date_idx;
DROP INDEX public.raman_tests_graphene_sample_test_date_idx;
DROP INDEX public.raman_tests_graphene_sample_idx;
DROP INDEX public.raman_tests_created_at_idx;
DROP INDEX public.raman_tests_compound_batch_number_test_date_idx;
DROP INDEX public.raman_tests_compound_batch_number_idx;
DROP INDEX public."news_sources_sourceType_is_active_idx";
DROP INDEX public.news_sources_name_key;
DROP INDEX public.news_sources_is_active_last_fetched_idx;
DROP INDEX public.news_preferences_user_id_key;
DROP INDEX public.news_articles_url_key;
DROP INDEX public.news_articles_summary_status_created_at_idx;
DROP INDEX public.news_articles_summary_generated_relevance_score_idx;
DROP INDEX public.news_articles_source_id_publish_date_idx;
DROP INDEX public.news_articles_relevance_score_idx;
DROP INDEX public.news_articles_publish_date_relevance_score_idx;
DROP INDEX public.news_articles_content_hash_key;
DROP INDEX public.news_articles_content_hash_idx;
DROP INDEX public.news_articles_category_publish_date_idx;
DROP INDEX public.micronizations_sku_key;
DROP INDEX public.micronizations_sku_idx;
DROP INDEX public.micronizations_sku_date_idx;
DROP INDEX public.micronizations_micronization_number_key;
DROP INDEX public.micronizations_micronization_location_idx;
DROP INDEX public.micronizations_micronization_location_date_idx;
DROP INDEX public.micronizations_graphene_sample_idx;
DROP INDEX public.micronizations_graphene_sample_date_idx;
DROP INDEX public.micronizations_date_idx;
DROP INDEX public.micronizations_compound_batch_number_idx;
DROP INDEX public.micronizations_compound_batch_number_date_idx;
DROP INDEX public.material_shipments_status_shipment_date_idx;
DROP INDEX public.material_shipments_shipment_number_key;
DROP INDEX public.material_shipments_shipment_date_idx;
DROP INDEX public.material_shipments_ship_to_location_shipment_date_idx;
DROP INDEX public.material_shipments_ship_from_location_shipment_date_idx;
DROP INDEX public.material_shipments_micronization_sku_shipment_date_idx;
DROP INDEX public.material_shipments_micronization_sku_idx;
DROP INDEX public.material_shipments_graphene_sample_shipment_date_idx;
DROP INDEX public.material_shipments_graphene_sample_idx;
DROP INDEX public.material_shipments_compound_batch_number_shipment_date_idx;
DROP INDEX public.material_shipments_compound_batch_number_idx;
DROP INDEX public.knowledge_documents_relevance_score_document_type_idx;
DROP INDEX public.knowledge_documents_processing_status_processing_attempts_idx;
DROP INDEX public.knowledge_documents_is_active_uploaded_at_idx;
DROP INDEX public.knowledge_documents_document_type_processing_status_idx;
DROP INDEX public.knowledge_documents_document_category_uploaded_at_idx;
DROP INDEX public.knowledge_documents_content_hash_key;
DROP INDEX public.knowledge_documents_content_hash_idx;
DROP INDEX public.graphene_update_reports_graphene_id_update_report_id_key;
DROP INDEX public.graphene_test_order_idx;
DROP INDEX public.graphene_sem_reports_graphene_id_sem_report_id_key;
DROP INDEX public.graphene_experiment_number_key;
DROP INDEX public.graphene_experiment_date_idx;
DROP INDEX public.graphene_created_at_idx;
DROP INDEX public.graphene_compound_batches_graphene_id_compound_batch_id_key;
DROP INDEX public.graphene_biochar_lot_number_idx;
DROP INDEX public.graphene_biochar_experiment_idx;
DROP INDEX public.content_processing_logs_status_created_at_idx;
DROP INDEX public.content_processing_logs_source_id_created_at_idx;
DROP INDEX public.conductivity_tests_test_date_idx;
DROP INDEX public.conductivity_tests_graphene_sample_test_date_idx;
DROP INDEX public.conductivity_tests_graphene_sample_idx;
DROP INDEX public.conductivity_tests_created_at_idx;
DROP INDEX public.conductivity_tests_compound_batch_number_test_date_idx;
DROP INDEX public.conductivity_tests_compound_batch_number_idx;
DROP INDEX public.compound_batches_created_date_idx;
DROP INDEX public.compound_batches_created_at_idx;
DROP INDEX public.compound_batches_batch_number_key;
DROP INDEX public.compound_batch_update_reports_compound_batch_id_update_repo_key;
DROP INDEX public.compound_batch_sem_reports_compound_batch_id_sem_report_id_key;
DROP INDEX public.biochar_test_order_idx;
DROP INDEX public.biochar_lots_lot_number_key;
DROP INDEX public.biochar_lot_number_idx;
DROP INDEX public.biochar_experiment_number_key;
DROP INDEX public.biochar_experiment_date_idx;
DROP INDEX public.biochar_created_at_idx;
DROP INDEX public.bet_testing_lab_test_date_idx;
DROP INDEX public.bet_test_date_idx;
DROP INDEX public.bet_graphene_sample_test_date_idx;
DROP INDEX public.bet_graphene_sample_idx;
DROP INDEX public.bet_created_at_idx;
DROP INDEX public.bet_compound_batch_number_test_date_idx;
DROP INDEX public.bet_compound_batch_number_idx;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.user_bookmarks DROP CONSTRAINT user_bookmarks_pkey;
ALTER TABLE ONLY public.update_reports DROP CONSTRAINT update_reports_pkey;
ALTER TABLE ONLY public.tem_tests DROP CONSTRAINT tem_tests_pkey;
ALTER TABLE ONLY public.sem_reports DROP CONSTRAINT sem_reports_pkey;
ALTER TABLE ONLY public.raman_tests DROP CONSTRAINT raman_tests_pkey;
ALTER TABLE ONLY public.news_sources DROP CONSTRAINT news_sources_pkey;
ALTER TABLE ONLY public.news_preferences DROP CONSTRAINT news_preferences_pkey;
ALTER TABLE ONLY public.news_articles DROP CONSTRAINT news_articles_pkey;
ALTER TABLE ONLY public.micronizations DROP CONSTRAINT micronizations_pkey;
ALTER TABLE ONLY public.material_shipments DROP CONSTRAINT material_shipments_pkey;
ALTER TABLE ONLY public.knowledge_documents DROP CONSTRAINT knowledge_documents_pkey;
ALTER TABLE ONLY public.graphene_update_reports DROP CONSTRAINT graphene_update_reports_pkey;
ALTER TABLE ONLY public.graphene_sem_reports DROP CONSTRAINT graphene_sem_reports_pkey;
ALTER TABLE ONLY public.graphene DROP CONSTRAINT graphene_pkey;
ALTER TABLE ONLY public.graphene_compound_batches DROP CONSTRAINT graphene_compound_batches_pkey;
ALTER TABLE ONLY public.content_processing_logs DROP CONSTRAINT content_processing_logs_pkey;
ALTER TABLE ONLY public.conductivity_tests DROP CONSTRAINT conductivity_tests_pkey;
ALTER TABLE ONLY public.compound_batches DROP CONSTRAINT compound_batches_pkey;
ALTER TABLE ONLY public.compound_batch_update_reports DROP CONSTRAINT compound_batch_update_reports_pkey;
ALTER TABLE ONLY public.compound_batch_sem_reports DROP CONSTRAINT compound_batch_sem_reports_pkey;
ALTER TABLE ONLY public.biochar DROP CONSTRAINT biochar_pkey;
ALTER TABLE ONLY public.biochar_lots DROP CONSTRAINT biochar_lots_pkey;
ALTER TABLE ONLY public.bet DROP CONSTRAINT bet_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
DROP TABLE public.users;
DROP TABLE public.user_bookmarks;
DROP TABLE public.update_reports;
DROP TABLE public.tem_tests;
DROP TABLE public.sem_reports;
DROP TABLE public.raman_tests;
DROP TABLE public.news_sources;
DROP TABLE public.news_preferences;
DROP TABLE public.news_articles;
DROP TABLE public.micronizations;
DROP TABLE public.material_shipments;
DROP TABLE public.knowledge_documents;
DROP TABLE public.graphene_update_reports;
DROP TABLE public.graphene_sem_reports;
DROP TABLE public.graphene_compound_batches;
DROP TABLE public.graphene;
DROP TABLE public.content_processing_logs;
DROP TABLE public.conductivity_tests;
DROP TABLE public.compound_batches;
DROP TABLE public.compound_batch_update_reports;
DROP TABLE public.compound_batch_sem_reports;
DROP TABLE public.biochar_lots;
DROP TABLE public.biochar;
DROP TABLE public.bet;
DROP TABLE public._prisma_migrations;
DROP TYPE public."UserRole";
DROP TYPE public."SummaryStatus";
DROP TYPE public."SourceType";
DROP TYPE public."ProcessingStatus";
DROP TYPE public."ProcessType";
DROP TYPE public."ProcessStatus";
DROP TYPE public."NewsCategory";
DROP TYPE public."GrindingMethod";
DROP TYPE public."DocumentType";
DROP TYPE public."DocumentCategory";
DROP TYPE public."DigestFrequency";
--
-- Name: DigestFrequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DigestFrequency" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY'
);


--
-- Name: DocumentCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentCategory" AS ENUM (
    'GRAPHENE_PRODUCTION',
    'BIOCHAR_PROCESSING',
    'MATERIAL_CHARACTERIZATION',
    'CONDUCTIVITY_TESTING',
    'SURFACE_ANALYSIS',
    'SCALING_METHODS',
    'QUALITY_CONTROL',
    'EQUIPMENT_OPERATION',
    'SAFETY_PROCEDURES',
    'MARKET_ANALYSIS',
    'APPLICATIONS',
    'GENERAL'
);


--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentType" AS ENUM (
    'RESEARCH_PAPER',
    'PATENT',
    'TECHNICAL_REPORT',
    'WHITEPAPER',
    'THESIS',
    'CONFERENCE_PAPER',
    'BOOK_CHAPTER',
    'MANUAL',
    'SPECIFICATION',
    'OTHER'
);


--
-- Name: GrindingMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GrindingMethod" AS ENUM (
    'manual',
    'mill',
    'ball_mill',
    'blender'
);


--
-- Name: NewsCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NewsCategory" AS ENUM (
    'RESEARCH_BREAKTHROUGH',
    'INDUSTRY_NEWS',
    'MARKET_ANALYSIS',
    'APPLICATIONS',
    'PRODUCTION_METHODS',
    'PATENTS',
    'COMPANY_NEWS',
    'FUNDING_INVESTMENT'
);


--
-- Name: ProcessStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProcessStatus" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PARTIAL',
    'SKIPPED'
);


--
-- Name: ProcessType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProcessType" AS ENUM (
    'FETCH',
    'PARSE',
    'CATEGORIZE',
    'RELEVANCE_SCORE',
    'IMAGE_EXTRACT',
    'DUPLICATE_CHECK'
);


--
-- Name: ProcessingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProcessingStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'SKIPPED'
);


--
-- Name: SourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SourceType" AS ENUM (
    'RSS',
    'API',
    'WEB_SCRAPING',
    'MANUAL'
);


--
-- Name: SummaryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SummaryStatus" AS ENUM (
    'PENDING',
    'GENERATING',
    'COMPLETED',
    'FAILED',
    'SKIPPED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'TEAM_MEMBER',
    'SUPER_ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: bet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bet (
    id text NOT NULL,
    test_date timestamp(3) without time zone,
    graphene_sample text,
    multipoint_bet_area numeric(10,4),
    langmuir_surface_area numeric(10,4),
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    bet_report_path text,
    research_team text,
    testing_lab text,
    mass numeric(10,4),
    compound_batch_number text
);


--
-- Name: biochar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biochar (
    id text NOT NULL,
    experiment_number text NOT NULL,
    reactor text,
    raw_material text,
    acid_amount numeric(10,2),
    acid_concentration numeric(5,2),
    acid_molarity numeric(5,2),
    acid_type text,
    temperature numeric(6,2),
    "time" numeric(10,2),
    pressure_initial numeric(10,2),
    pressure_final numeric(10,2),
    wash_amount numeric(10,2),
    wash_medium text,
    output numeric(10,2),
    drying_temp numeric(6,2),
    kft_percentage numeric(5,2),
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    experiment_date timestamp(3) without time zone,
    test_order integer,
    starting_amount numeric(10,2),
    lot_number text,
    research_team text
);


--
-- Name: biochar_lots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biochar_lots (
    id text NOT NULL,
    lot_number text NOT NULL,
    lot_name text,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: compound_batch_sem_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compound_batch_sem_reports (
    id text NOT NULL,
    compound_batch_id text NOT NULL,
    sem_report_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: compound_batch_update_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compound_batch_update_reports (
    id text NOT NULL,
    compound_batch_id text NOT NULL,
    update_report_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: compound_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compound_batches (
    id text NOT NULL,
    batch_number text NOT NULL,
    batch_name text,
    description text,
    created_date timestamp(3) without time zone,
    total_output numeric(10,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: conductivity_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conductivity_tests (
    id text NOT NULL,
    test_date timestamp(3) without time zone,
    graphene_sample text,
    description text,
    conductivity_1kn numeric(12,6),
    conductivity_8kn numeric(12,6),
    conductivity_12kn numeric(12,6),
    conductivity_20kn numeric(12,6),
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    compound_batch_number text,
    conductivity_report_path text,
    name text
);


--
-- Name: content_processing_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_processing_logs (
    id text NOT NULL,
    article_id text,
    source_id text NOT NULL,
    process_type public."ProcessType" NOT NULL,
    status public."ProcessStatus" NOT NULL,
    error_message text,
    processing_time integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: graphene; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graphene (
    id text NOT NULL,
    experiment_number text NOT NULL,
    oven text,
    quantity numeric(10,2),
    base_amount numeric(10,2),
    base_type text,
    base_concentration numeric(5,2),
    grinding_method public."GrindingMethod",
    grinding_time numeric(10,2),
    gas text,
    temp_rate text,
    temp_max numeric(6,2),
    "time" numeric(10,2),
    wash_amount numeric(10,2),
    wash_solution text,
    drying_temp numeric(6,2),
    drying_atmosphere text,
    drying_pressure text,
    output numeric(10,2),
    species text,
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    experiment_date timestamp(3) without time zone,
    test_order integer,
    biochar_experiment text,
    appearance_tags text[],
    density numeric(10,4),
    homogeneous boolean,
    volume_ml numeric(10,2),
    wash_concentration numeric(5,2),
    wash_water text,
    biochar_lot_number text,
    research_team text,
    sem_report_path text,
    base2_amount numeric(10,2),
    base2_concentration numeric(5,2),
    base2_type text,
    conclusion text,
    experiment_details text,
    objective text,
    recommended_action text,
    result text,
    grinding_frequency numeric(10,2),
    title_note text,
    grinding_count integer
);


--
-- Name: graphene_compound_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graphene_compound_batches (
    id text NOT NULL,
    graphene_id text NOT NULL,
    compound_batch_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: graphene_sem_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graphene_sem_reports (
    id text NOT NULL,
    graphene_id text NOT NULL,
    sem_report_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: graphene_update_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graphene_update_reports (
    id text NOT NULL,
    graphene_id text NOT NULL,
    update_report_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_documents (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    document_type public."DocumentType" NOT NULL,
    document_category public."DocumentCategory",
    research_areas text[],
    keywords text[],
    authors text[],
    publication_date timestamp(3) without time zone,
    uploaded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    processing_status public."ProcessingStatus" DEFAULT 'PENDING'::public."ProcessingStatus" NOT NULL,
    extracted_text text,
    summary text,
    layman_summary text,
    key_findings text[],
    relevance_score numeric(4,2),
    content_hash text,
    processing_error text,
    processing_attempts integer DEFAULT 0 NOT NULL,
    last_processed_at timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    tags text[],
    metadata jsonb
);


--
-- Name: material_shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_shipments (
    id text NOT NULL,
    shipment_number text NOT NULL,
    ship_from_location text NOT NULL,
    ship_to_location text NOT NULL,
    shipment_date timestamp(3) without time zone,
    amount_shipped numeric(10,2),
    unit text DEFAULT 'g'::text NOT NULL,
    purpose text,
    graphene_sample text,
    compound_batch_number text,
    comments text,
    status text DEFAULT 'shipped'::text,
    received_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    micronization_sku text
);


--
-- Name: micronizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.micronizations (
    id text NOT NULL,
    micronization_number text NOT NULL,
    date timestamp(3) without time zone,
    sku text,
    starting_material_amount numeric(10,2),
    recovered_amount numeric(10,2),
    grind_pressure integer,
    micronization_report_path text,
    graphene_sample text,
    compound_batch_number text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    dx50 text,
    micronization_location text
);


--
-- Name: news_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_articles (
    id text NOT NULL,
    title text NOT NULL,
    summary text,
    content text,
    url text NOT NULL,
    publish_date timestamp(3) without time zone NOT NULL,
    fetched_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category public."NewsCategory" NOT NULL,
    relevance_score numeric(4,2) NOT NULL,
    content_hash text NOT NULL,
    image_urls text[],
    keyword_tags text[],
    author text,
    reading_time integer,
    source_id text NOT NULL,
    is_bookmarked boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    layman_summary text,
    summary_error text,
    summary_generated boolean DEFAULT false NOT NULL,
    summary_attempts integer DEFAULT 0 NOT NULL,
    summary_generated_at timestamp(3) without time zone,
    summary_status public."SummaryStatus" DEFAULT 'PENDING'::public."SummaryStatus" NOT NULL
);


--
-- Name: news_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_preferences (
    id text NOT NULL,
    user_id text,
    preferred_categories public."NewsCategory"[],
    excluded_sources text[],
    keyword_alerts text[],
    email_digest boolean DEFAULT false NOT NULL,
    digest_frequency public."DigestFrequency" DEFAULT 'WEEKLY'::public."DigestFrequency" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: news_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_sources (
    id text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    "sourceType" public."SourceType" NOT NULL,
    "rateLimit" integer,
    last_fetched timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    reliability_score numeric(3,2),
    terms_accepted boolean DEFAULT false NOT NULL,
    robots_txt_checked timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: raman_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.raman_tests (
    id text NOT NULL,
    test_date timestamp(3) without time zone,
    graphene_sample text,
    research_team text,
    testing_lab text,
    raman_report_path text,
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    integral_typ_a_2d_1 numeric(10,3),
    integral_typ_a_2d_2 numeric(10,3),
    integral_typ_a_d_1 numeric(10,3),
    integral_typ_a_d_2 numeric(10,3),
    integral_typ_a_dg_1 numeric(10,4),
    integral_typ_a_dg_2 numeric(10,4),
    integral_typ_a_g_1 numeric(10,3),
    integral_typ_a_g_2 numeric(10,3),
    integration_range_2d_high numeric(10,2),
    integration_range_2d_low numeric(10,2),
    integration_range_d_high numeric(10,2),
    integration_range_d_low numeric(10,2),
    integration_range_dg_high numeric(10,4),
    integration_range_dg_low numeric(10,4),
    integration_range_g_high numeric(10,2),
    integration_range_g_low numeric(10,2),
    peak_high_typ_j_2d_1 numeric(10,4),
    peak_high_typ_j_2d_2 numeric(10,4),
    peak_high_typ_j_d_1 numeric(10,4),
    peak_high_typ_j_d_2 numeric(10,4),
    peak_high_typ_j_dg_1 numeric(10,4),
    peak_high_typ_j_dg_2 numeric(10,4),
    peak_high_typ_j_g_1 numeric(10,4),
    peak_high_typ_j_g_2 numeric(10,4),
    compound_batch_number text,
    integral_typ_b_2d_1 numeric(10,3),
    integral_typ_b_2d_2 numeric(10,3),
    integral_typ_b_d_1 numeric(10,3),
    integral_typ_b_d_2 numeric(10,3),
    integral_typ_b_dg_1 numeric(10,4),
    integral_typ_b_dg_2 numeric(10,4),
    integral_typ_b_g_1 numeric(10,3),
    integral_typ_b_g_2 numeric(10,3)
);


--
-- Name: sem_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sem_reports (
    id text NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    description text,
    report_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tem_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tem_tests (
    id text NOT NULL,
    test_date timestamp(3) without time zone,
    graphene_sample text,
    research_team text,
    testing_lab text,
    tem_report_path text,
    comments text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    compound_batch_number text
);


--
-- Name: update_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_reports (
    id text NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    description text,
    week_of timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: user_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bookmarks (
    id text NOT NULL,
    article_id text NOT NULL,
    user_id text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."UserRole" DEFAULT 'TEAM_MEMBER'::public."UserRole" NOT NULL,
    first_name text,
    last_name text,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('cba171f0-b33a-4c4b-ab1e-afe30b9a0ddb', '8e93a35ddc1721e51c4e1011725ad44cba38f19a9ce95bd3047c0c76bb6a5aa8', NULL, '20250822075104_add_update_reports', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20250822075104_add_update_reports

Database error code: 42P01

Database error:
ERROR: relation "graphene" does not exist

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \"graphene\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(436), routine: Some("RangeVarGetRelidExtended") }

   0: sql_schema_connector::apply_migration::apply_script
           with migration_name="20250822075104_add_update_reports"
             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106
   1: schema_core::commands::apply_migrations::Applying migration
           with migration_name="20250822075104_add_update_reports"
             at schema-engine/core/src/commands/apply_migrations.rs:91
   2: schema_core::state::ApplyMigrations
             at schema-engine/core/src/state.rs:226', '2025-08-26 14:59:14.858052-06', '2025-08-23 11:02:27.827925-06', 0);
INSERT INTO public._prisma_migrations VALUES ('621f5b0f-c950-4087-a9d8-a193cd95c20b', '8e93a35ddc1721e51c4e1011725ad44cba38f19a9ce95bd3047c0c76bb6a5aa8', '2025-09-04 17:36:14.331915-06', '20250822075104_add_update_reports', '', NULL, '2025-09-04 17:36:14.331915-06', 0);


--
-- Data for Name: bet; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.bet VALUES ('cmemb0si20001dkoa8igr7yre', '2024-08-28 00:00:00', 'MB2976A', 1880.0000, 2550.0000, '', '2025-08-22 04:02:11.402', '2025-08-25 00:56:02.777', 'bet-reports/MB2976A 2024-09-17 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 3_1756083362759.pdf', 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);
INSERT INTO public.bet VALUES ('cmeqesqte0003c41dot5d83vp', '2025-01-22 00:00:00', 'TB1160B', 1240.0000, 1677.0000, '', '2025-08-25 00:58:59.137', '2025-08-25 01:48:07.935', 'bet-reports/TB1142 1160B 2024-01-21 45-02801 Curia Germany GmbH Offer 2210-2025-51000-45-02801-00031 AM2025-0004 Short Summary 1_1756083539133.pdf', 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);
INSERT INTO public.bet VALUES ('cmeqevxpc0005c41dp18ysmcr', '2024-11-06 00:00:00', 'MRa329', 1760.0000, 2390.0000, '', '2025-08-25 01:01:28.022', '2025-08-25 01:48:07.935', 'bet-reports/MRa329 MRa333A MRa334A 2024-10-22 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 6_1756083688018.pdf', 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);
INSERT INTO public.bet VALUES ('cmeqgox6w0001yxrwxwtehrbz', '2024-12-19 00:00:00', 'MB3001A', 1613.0000, 7763.0000, '', '2025-08-25 01:52:00.007', '2025-08-25 01:57:56.339', 'bet-reports/MB3001A MB3004A 2024-12-19 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 7_1756086719997.pdf', 'Curia - Germany', 'Fraunhofer-Institut', 0.1086, NULL);
INSERT INTO public.bet VALUES ('cmeqgqmgh0003yxrwlbbs8k6x', '2024-12-19 00:00:00', 'MB3004A', 1491.0000, 2032.0000, '', '2025-08-25 01:53:19.409', '2025-08-25 01:58:06.044', 'bet-reports/MB3001A MB3004A 2024-12-19 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 7_1756087086034.pdf', 'Curia - Germany', 'Fraunhofer-Institut', 0.0767, NULL);
INSERT INTO public.bet VALUES ('cmeqez278000bc41dhb9c2fld', '2024-11-06 00:00:00', 'MRa334A', 1860.0000, 2500.0000, '', '2025-08-25 01:03:53.828', '2025-08-25 02:00:13.822', 'bet-reports/MRa329 MRa333A MRa334A 2024-10-22 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 6_1756087213819.pdf', 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);
INSERT INTO public.bet VALUES ('cmeqexwaj0007c41dr4l2h18s', '2024-11-06 00:00:00', 'MRa333A', 2090.0000, 5740.0000, '', '2025-08-25 01:02:59.514', '2025-08-25 02:00:33.479', NULL, 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);
INSERT INTO public.bet VALUES ('cmeqerd4h0001c41dcee8yb1e', NULL, 'TB1165', 1520.0000, 2020.0000, '', '2025-08-25 00:57:54.736', '2025-09-06 02:22:37.502', NULL, 'Curia - Germany', 'Fraunhofer-Institut', NULL, NULL);


--
-- Data for Name: biochar; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.biochar VALUES ('cmegir5hs0001xm3f5xjjoqs8', 'MB2933', 'AV1', 'BAFA neu Hemp Fibre VF', 174.00, 0.19, 0.02, 'Sulfuric Acid', 180.00, 24.00, 8.70, 9.50, 647.00, 'Water', 1.20, NULL, NULL, 'dark crusts on glassware, metal and liquid surface removed before filtration', '2025-08-18 02:52:01.55', '2025-08-18 02:52:01.55', NULL, 2, 6.10, NULL, NULL);
INSERT INTO public.biochar VALUES ('cmegitl0p0002xm3fn6rd1rjt', 'MB2935', 'AV1', 'BAFA neu Hemp Fibre VF', 172.90, 0.19, 0.02, 'Sulfuric Acid', 180.00, 23.00, 8.80, 9.50, 500.00, 'Water', 1.30, NULL, NULL, 'Dark crusts on glassware, metal and liquid surface removed before filtration', '2025-08-18 02:53:54.985', '2025-08-18 03:00:59.271', NULL, 3, 6.00, NULL, NULL);
INSERT INTO public.biochar VALUES ('cmegje3ju000011fxxsyc6i1g', 'MB2936', 'AV1', 'BAFA neu Hemp Fibre VF', 172.40, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.00, 8.80, 10.60, 589.00, 'Water', 0.80, NULL, NULL, 'Dark crusts on glassware, metal and liquid surface removed before filtration.', '2025-08-18 03:09:52.122', '2025-08-18 03:17:26.581', NULL, 4, 6.00, 'MRa231', NULL);
INSERT INTO public.biochar VALUES ('cmegjgsux000111fxp22fdtoe', 'MRa225', 'AV1', 'BAFA neu Hemp Fibre VF', 153.80, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, 10.50, 500.00, 'Water', 0.90, NULL, NULL, 'Dark crusts on glassware, metal and liquid surface removed before filtration. ', '2025-08-18 03:11:58.224', '2025-08-18 03:17:26.581', NULL, 5, 6.00, 'MRa231', NULL);
INSERT INTO public.biochar VALUES ('cmegjl7i90000gs6uch4ew4b6', 'MRa228', 'AV1', 'BAFA neu Hemp Fibre VF', 154.00, 0.96, 0.10, 'Sulfuric Acid', 180.00, 22.50, 8.70, 11.00, 500.00, 'Water', 0.90, NULL, NULL, 'Dark crusts on glassware, metal and liquid surface removed before filtration. ', '2025-08-18 03:15:23.841', '2025-08-18 03:17:26.581', NULL, 6, 6.30, 'MRa231', NULL);
INSERT INTO public.biochar VALUES ('cmegjmhi70001gs6uu8h7xhsk', 'MRa231', 'AV1', 'BAFA neu Hemp Fibre VF', 168.80, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.50, 8.00, 10.50, 500.00, 'Water', 0.80, NULL, NULL, 'Dark crusts on glassware, metal and liquid surface removed before filtration. ', '2025-08-18 03:16:23.454', '2025-08-18 03:17:26.581', NULL, 7, 6.10, 'MRa231', NULL);
INSERT INTO public.biochar VALUES ('cmeg8gx2p00009zxz901w7qrk', 'MB2928', 'AV1', 'BAFA neu Hemp Fibre VF', 100.00, 0.19, 0.02, 'Sulfuric Acid', 180.00, 22.50, 8.70, 10.40, 742.00, 'Water', 2.60, NULL, NULL, 'Fibres not completely covered by liquid', '2025-08-17 22:04:07.92', '2025-08-18 13:46:00.038', NULL, 1, 6.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhgxxn00073zyalxtxpte1', 'MB2948', 'AV1', 'Canadian Rockies Hemp', 175.10, 0.96, 0.10, 'Sulfuric Acid', 180.00, 25.00, 9.00, 12.60, 475.00, 'Water', 1.70, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:03:51.755', '2025-08-18 19:44:43.311', NULL, 15, 9.40, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhephg00053zyasgohgpn5', 'MB2944', 'AV1', 'Canadian Rockies Hemp', 178.40, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.40, 9.70, 593.00, 'Water', 1.80, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:02:07.492', '2025-08-18 19:44:58.073', NULL, 13, 9.00, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhdhuc00043zyaea1xp33w', 'MB2943', 'AV1', 'Canadian Rockies Hemp', 178.20, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.30, 12.70, 611.00, 'Water', 1.70, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:01:10.924', '2025-08-18 19:45:04.984', NULL, 12, 9.80, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhcbrm00033zyac80iykss', 'MB2942', 'AV1', 'Canadian Rockies Hemp', 177.60, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.00, 8.30, 13.50, 578.00, 'Water', 1.60, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:00:16.402', '2025-08-18 19:45:16.398', NULL, 11, 8.90, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhb6b400023zyagyro4fkt', 'MB2940', 'AV1', 'Canadian Rockies Hemp', 177.10, 0.96, 0.10, 'Sulfuric Acid', 180.00, 22.50, 8.70, 10.60, 555.00, 'Water', 1.50, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 18:59:22.672', '2025-08-18 19:45:20.038', NULL, 10, 9.20, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehha0hi00013zyagntfaqeg', 'MB2938', 'AV1', 'Canadian Rockies Hemp', 175.00, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.50, 9.20, 13.20, 577.00, 'Water', 1.40, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 18:58:28.47', '2025-08-18 19:45:28.802', NULL, 9, 8.90, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehh8rkg00003zyaavb44xil', 'MB2937', 'AV1', 'Canadian Rockies Hemp', 179.30, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.60, 10.90, 569.00, 'Water', 1.60, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 18:57:30.255', '2025-08-18 19:45:32.214', NULL, 8, 9.40, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehiwr1400183zya7zsmlg87', 'MB2949', 'AV1', 'Canadian Rockies Hemp', 174.30, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.50, 8.40, 10.20, 538.00, 'Water', 1.80, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:44:08.915', '2025-08-18 19:44:32.315', NULL, 16, 9.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehhfuox00063zyaa11dspfb', 'MB2945', 'AV1', 'Canadian Rockies Hemp', 177.70, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.70, 9.80, 6.00, 'Water', 1.60, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:03:00.897', '2025-08-18 19:44:49.63', NULL, 14, 9.10, 'MB2946X', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehj018t00193zyacojs00wh', 'MB2950', 'AV1', 'Canadian Rockies Hemp', 170.50, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.00, NULL, 11.10, 534.00, 'Water', 1.60, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:46:42.125', '2025-08-18 19:46:42.125', NULL, 17, 9.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmehj1bjj001a3zya0vqo21ij', 'MB2951', 'AV1', 'Canadian Rockies Hemp', 178.50, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 9.10, 11.20, 575.00, 'Water', 1.80, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-18 19:47:42.127', '2025-08-18 19:47:42.127', NULL, 18, 9.30, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqgxle001b3zyamweih39x', 'MRa255', 'AV1', 'Canadian Rockies Hemp', 170.80, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.50, 8.10, 12.80, 488.00, 'Water', 1.70, NULL, NULL, 'Some foreign material observed and removed during filtration. ', '2025-08-19 16:03:34.026', '2025-08-19 16:03:34.026', NULL, 19, 9.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqic3n001c3zya08stytqu', 'MB2953', 'AV1', 'Canadian Rockies Hemp', 177.10, 0.96, 0.10, 'Sulfuric Acid', 180.00, 23.50, 9.10, 10.40, 558.00, 'Water', 1.80, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-19 16:04:39.49', '2025-08-19 16:04:39.49', NULL, 20, 9.70, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqjsjk001d3zya8509yggf', 'MB2956', 'AV1', 'Canadian Rockies Hemp', 172.00, 0.96, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.60, 12.50, 548.00, 'Water', 1.90, NULL, NULL, 'Low amount of foreign material observed and removed during filtration. ', '2025-08-19 16:05:47.456', '2025-08-19 16:05:47.456', NULL, 21, 9.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqn9av001f3zya620jav0v', 'MB2958', 'AV1', 'Canadian Rockies Hemp', 177.00, 2.00, 0.20, 'Sulfuric Acid', 180.00, 24.00, 8.90, 8.70, 562.00, 'Water', 1.80, NULL, NULL, '', '2025-08-19 16:08:29.143', '2025-08-19 16:08:29.143', NULL, 23, 9.30, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqldic001e3zyadh6a6s32', 'MB2957', 'AV1', 'Canadian Rockies Hemp', 176.80, 1.50, 0.15, 'Sulfuric Acid', 180.00, 23.50, 8.80, 8.50, 589.00, 'Water', 1.50, NULL, NULL, '', '2025-08-19 16:07:01.284', '2025-08-19 16:08:46.252', NULL, 22, 9.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqpfhn001g3zyakraiolep', 'MB2959', 'AV1', 'Canadian Rockies Hemp', 953.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 25.00, NULL, NULL, 3957.00, 'Water', 14.90, NULL, NULL, 'Low amount of foreign material observed and removed during filtration', '2025-08-19 16:10:10.474', '2025-08-19 16:10:10.474', NULL, 24, 76.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqrvgo001h3zyazfjcgkk8', 'MB2960', 'AV1', 'Canadian Rockies Hemp (cut)', 151.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.80, 10.50, 300.00, 'Water', 0.60, NULL, NULL, 'Reaction performed with stirring', '2025-08-19 16:12:04.488', '2025-08-19 16:12:04.488', NULL, 25, 3.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqtnf0001i3zya2kb2d4yl', 'MB2961', 'AV1', 'Canadian Rockies Hemp', 172.00, 5.00, 0.51, 'Sulfuric Acid', 180.00, 24.00, 10.10, 16.10, 563.00, 'Water', 1.70, NULL, NULL, 'Low amount of foreign material observed and removed during filtration', '2025-08-19 16:13:27.371', '2025-08-19 16:13:27.371', NULL, 26, 9.90, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqwvtp001j3zyaz7si89bt', 'MB2964', 'AV1', 'Canadian Rockies Hemp', 351.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, 8.60, 8.80, 913.00, 'Water', 1.30, NULL, NULL, 'Hemp boiled wit 1% H2SO4 at 95deg C, filtered and washed, then heated in Autoclave with fresh acid', '2025-08-19 16:15:58.226', '2025-08-19 16:15:58.226', NULL, 27, 9.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir0ul0001l3zya692uhpbr', 'KJo-0173', 'AV5', 'Canadian Rockies Hemp', 942.10, 1.00, 0.10, 'Sulfuric Acid', 185.00, 24.00, NULL, NULL, 4283.00, 'Water', 16.50, 40.00, 4.90, '', '2025-08-19 16:19:03.252', '2025-08-19 16:36:45.686', NULL, 29, 77.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir2698001m3zyax9kks3wu', 'KJo-0174', 'AV5', 'Canadian Rockies Hemp', 945.00, 1.00, 0.10, 'Sulfuric Acid', 190.00, 24.00, NULL, NULL, 4384.00, 'Water', 15.80, 40.00, 3.70, '', '2025-08-19 16:20:05.036', '2025-08-19 16:36:54.334', NULL, 30, 77.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir396p001n3zyam21yhrg5', 'MB2982', 'AV5', 'Canadian Rockies Hemp', 999.50, 1.00, 0.10, 'Sulfuric Acid', 190.00, 24.00, NULL, NULL, 4258.00, 'Water', 14.90, 40.00, 5.30, '', '2025-08-19 16:20:55.489', '2025-08-19 16:36:59.786', NULL, 31, 77.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir4hpk001o3zyad4ukwxz5', 'MB2983', 'AV5', 'Canadian Rockies Hemp', 999.80, 1.00, 0.10, 'Sulfuric Acid', 190.00, 24.00, NULL, NULL, 4232.00, 'Water', 16.60, 40.00, 5.50, '', '2025-08-19 16:21:53.184', '2025-08-19 16:37:05.304', NULL, 32, 80.50, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir65yc001p3zyazxc67ms2', 'MB2985', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 200.00, 24.00, NULL, NULL, 4241.00, 'Water', 15.40, 40.00, 3.70, '', '2025-08-19 16:23:11.268', '2025-08-19 16:37:11.207', NULL, 33, 79.50, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir7hqz001q3zyaf9hqnvdl', 'MB2986', 'AV5', 'Canadian Rockies Hemp', 999.90, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4128.00, 'Water', 16.00, 60.00, 2.70, '', '2025-08-19 16:24:13.211', '2025-08-19 16:37:17.232', NULL, 34, 79.90, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir9kdr001s3zya8708udf6', 'MB2991', 'AV5', 'Canadian Rockies Hemp', 999.30, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4223.00, 'Water', 19.10, 40.00, 5.70, '', '2025-08-19 16:25:49.935', '2025-08-19 16:37:34.233', NULL, 36, 81.30, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeir8njg001r3zyappd4mnsz', 'MB2989', 'AV5', 'Canadian Rockies Hemp', 999.30, 1.00, 0.10, 'Sulfuric Acid', 180.00, 23.00, NULL, NULL, 4314.00, 'Water', 18.20, 40.00, 5.90, '', '2025-08-19 16:25:07.372', '2025-08-19 16:37:28.66', NULL, 35, 80.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiram0r001t3zyah9i5fowd', 'MB2992', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 160.00, 23.50, NULL, NULL, 4262.00, 'Water', 19.50, 40.00, 6.20, '', '2025-08-19 16:26:38.715', '2025-08-19 16:37:39.897', NULL, 37, 81.50, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirblgo001u3zyadf3u94kk', 'MB2994', 'AV5', 'Canadian Rockies Hemp', 999.80, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4159.00, 'Water', 20.20, 40.00, 5.20, '', '2025-08-19 16:27:24.641', '2025-08-19 16:37:45.525', NULL, 38, 80.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeircn6y001v3zyatv2a30b0', 'MB2996', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4210.00, 'Water', 20.00, 40.00, 4.60, '', '2025-08-19 16:28:13.546', '2025-08-19 16:37:50.88', NULL, 39, 82.70, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirf40w001x3zya740iwca2', 'MB3000', 'AV5', 'Canadian Rockies Hemp', 1000.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4431.00, 'Water', 19.80, 40.00, 5.00, '', '2025-08-19 16:30:08.671', '2025-08-19 16:38:02.831', NULL, 41, 82.50, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirg61i001y3zyalina9fol', 'MB3002', 'AV5', 'Canadian Rockies Hemp', 999.90, 1.00, 0.10, 'Sulfuric Acid', 190.00, 25.00, NULL, NULL, 4245.00, 'Water', 18.50, 40.00, 2.00, '', '2025-08-19 16:30:57.942', '2025-08-19 16:38:07.633', NULL, 42, 80.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiri9rv00203zya8wnzrjy6', 'MB3006', 'AV5', 'Canadian Rockies Hemp', 1000.10, 1.00, 0.10, 'Sulfuric Acid', 190.00, 23.00, NULL, NULL, 4182.00, 'Water', 17.40, 40.00, 2.10, '', '2025-08-19 16:32:36.086', '2025-08-19 16:38:19.635', NULL, 44, 80.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirlt0m00233zyacvs1429n', 'MB3011', 'AV5', 'Canadian Rockies Hemp', 999.40, 1.00, 0.10, 'Sulfuric Acid', 160.00, 24.00, NULL, NULL, 4244.00, 'Water', 23.50, 40.00, 2.20, '', '2025-08-19 16:35:20.998', '2025-08-19 16:38:42.347', NULL, 47, 82.40, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiqzf5v001k3zya1bns1m9u', 'MB2978', 'AV5', 'Canadian Rockies Hemp', 822.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 22.00, NULL, NULL, 4112.00, 'Water', 15.40, NULL, NULL, '', '2025-08-19 16:17:56.61', '2025-08-19 16:36:36.551', NULL, 28, 76.30, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeire1gk001w3zyad647y9ww', 'MB2998', 'AV5', 'Canadian Rockies Hemp', 999.60, 1.00, 0.10, 'Sulfuric Acid', 180.00, 22.00, NULL, NULL, 4263.00, 'Water', 19.80, 40.00, 5.00, 'Included nickel and steel material samples for corrosion/cleaning tests', '2025-08-19 16:29:18.692', '2025-08-19 16:37:56.963', NULL, 40, 84.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirn07p00243zyaxr149r3y', 'MB3014', 'AV5', 'Canadian Rockies Hemp', 999.80, 1.00, 0.10, 'Sulfuric Acid', 160.00, 23.00, NULL, NULL, 1460.00, 'Water', 23.60, 40.00, 1.30, '', '2025-08-19 16:36:16.981', '2025-08-19 16:38:48.558', NULL, 48, 82.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiv93340000vzf2jd04zh3j', 'MRa341', 'AV5', 'Canadian Rockies Hemp', 1000.40, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 1232.00, 'Water', 19.20, 40.00, 2.10, '', '2025-08-19 18:17:25.984', '2025-08-19 18:17:25.984', NULL, 49, 82.30, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivkhz800038g161c5tvo8n', 'MB3022', 'AV5', 'Canadian Rockies Hemp', 999.90, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4262.00, 'Water', 19.00, 40.00, 2.90, '', '2025-08-19 18:26:18.5', '2025-08-19 18:26:18.5', NULL, 53, 81.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivllzd00048g16jnpkz5mo', 'MB3024', 'AV5', 'Canadian Rockies Hemp', 999.60, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4256.00, 'Water', 18.40, 40.00, 2.00, '', '2025-08-19 18:27:10.345', '2025-08-19 18:27:10.345', NULL, 54, 80.70, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivmwp300058g16i7lma4od', 'MRa349', 'AV5', 'Canadian Rockies Hemp', 999.40, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4254.00, 'Water', 19.10, 40.00, 2.20, '', '2025-08-19 18:28:10.887', '2025-08-19 18:28:10.887', NULL, 55, 80.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivo54y00068g1664gwx3oj', 'MRa354', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4414.00, 'Water', 18.40, 40.00, 1.70, '', '2025-08-19 18:29:08.476', '2025-08-19 18:29:08.476', NULL, 56, 80.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivp2bp00078g16a7h5kt8k', 'MRa355', 'AV5', 'Canadian Rockies Hemp', 999.50, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4262.00, 'Water', 18.20, 40.00, 1.80, '', '2025-08-19 18:29:51.493', '2025-08-19 18:29:51.493', NULL, 57, 80.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivqkuc00088g16t3vauxf4', 'MRa358', 'AV5', 'Canadian Rockies Hemp', 999.90, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 3317.00, 'Water', 18.80, 40.00, 2.10, '', '2025-08-19 18:31:02.147', '2025-08-19 18:31:02.147', NULL, 58, 80.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivrqv000098g16jrq1y2xe', 'MB3025', 'AV5', 'Canadian Rockies Hemp', 1000.50, 1.00, 0.10, 'Sulfuric Acid', 165.00, 21.50, NULL, NULL, 4229.00, 'Water', 18.40, 40.00, 1.10, '', '2025-08-19 18:31:56.604', '2025-08-19 18:31:56.604', NULL, 59, 81.40, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivsxk2000a8g16rz3pwua4', 'MB3029', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4178.00, 'Water', 18.80, 40.00, 1.70, '', '2025-08-19 18:32:51.937', '2025-08-19 18:32:51.937', NULL, 60, 81.60, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivu2lm000b8g162nuga2l8', 'MB3031', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 190.00, 25.00, NULL, NULL, 4178.00, 'Water', 19.80, 40.00, 1.50, '', '2025-08-19 18:33:45.129', '2025-08-19 18:33:45.129', NULL, 61, 82.50, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiw27oi000c8g16v5jd4mai', 'MB3032', 'AV5', 'Canadian Rockies Hemp', 1000.50, 1.00, 0.10, 'Sulfuric Acid', 180.00, 23.50, NULL, NULL, 4341.00, 'Water', 19.00, NULL, 4.80, '', '2025-08-19 18:40:04.956', '2025-08-19 18:40:04.956', NULL, 62, 81.90, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwa4b9000d8g16rr7zxtdy', 'MRa367', 'AV5', 'Canadian Rockies Hemp', 1000.00, 1.00, 0.10, 'Sulfuric Acid', 190.00, 24.50, NULL, NULL, 4256.00, 'Water', 19.80, NULL, 4.70, '', '2025-08-19 18:46:13.839', '2025-08-19 18:46:13.839', NULL, 63, 81.90, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwbfmt000e8g16u1wqtn28', 'MRa368', 'AV5', 'Canadian Rockies Hemp', 999.80, 1.00, 0.10, 'Sulfuric Acid', 185.00, 27.50, NULL, NULL, 4290.00, 'Water', 20.30, NULL, 5.50, '', '2025-08-19 18:47:15.172', '2025-08-19 18:47:15.172', NULL, 64, 81.40, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwr16t000o8g16dv19v94v', 'MB3049', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 155.00, 25.00, NULL, NULL, 4248.00, 'Water', 23.30, NULL, 3.60, '', '2025-08-19 18:59:22.948', '2025-08-19 18:59:22.948', NULL, 74, 80.70, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivh7l600008g16681hf4wj', 'MB3016', 'AV5', 'Canadian Rockies Hemp', 999.70, 1.00, 0.10, 'Sulfuric Acid', 185.00, 21.00, NULL, NULL, 4232.00, 'Water', 19.70, 40.00, 2.10, '', '2025-08-19 18:23:45.066', '2025-08-24 19:48:58.588', NULL, 50, 81.70, 'MB3016/3018/3020', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeividsi00018g16hrmxewi5', 'MB3018', 'AV5', 'Canadian Rockies Hemp', 1000.10, 1.00, 0.10, 'Sulfuric Acid', 195.00, 22.00, NULL, NULL, 4266.00, 'Water', 19.00, 40.00, 2.10, '', '2025-08-19 18:24:39.762', '2025-08-24 19:48:58.588', NULL, 51, 81.20, 'MB3016/3018/3020', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwf9z1000g8g16umjcljxc', 'MB3037', 'AV5', 'Canadian Rockies Hemp', 999.80, 1.00, 0.10, 'Sulfuric Acid', 185.00, 21.50, NULL, NULL, 4325.00, 'Water', 18.60, 40.00, 1.70, '', '2025-08-19 18:50:14.461', '2025-08-25 00:05:45.035', NULL, 66, 80.70, 'MB3037/3039/3042', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwdpd2000f8g16zg95rk3r', 'MB3034', 'AV5', 'Canadian Rockies Hemp', 1000.20, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.50, NULL, NULL, 4254.00, 'Water', 20.00, 40.00, 2.00, '', '2025-08-19 18:49:01.093', '2025-08-19 18:50:19.735', NULL, 65, 84.70, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwi78b000i8g16td5vvxjd', 'MB3040', 'AV5', 'Canadian Rockies Hemp', 1000.20, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4301.00, 'Water', 18.80, 40.00, NULL, '', '2025-08-19 18:52:30.875', '2025-08-19 18:52:30.875', NULL, 68, 80.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwkngf000k8g160mkkcor7', 'MB3044', 'AV5', 'Canadian Rockies Hemp', 1000.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 25.00, NULL, NULL, 4316.00, 'Water', 20.20, 40.00, NULL, '', '2025-08-19 18:54:25.215', '2025-08-19 18:54:25.215', NULL, 70, 82.40, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwnw60000n8g1690jw56xo', 'MB3048', 'AV5', 'Canadian Rockies Hemp', 1000.20, 1.00, 0.10, 'Sulfuric Acid', 160.00, 23.00, NULL, NULL, 4275.00, 'Water', 23.90, NULL, 3.60, '', '2025-08-19 18:56:56.465', '2025-08-19 18:56:56.465', NULL, 73, 80.20, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwms3i000m8g16knmto2tp', 'MB3047', 'AV5', 'Canadian Rockies Hemp', 1000.10, 1.00, 0.10, 'Sulfuric Acid', 160.00, 24.00, NULL, NULL, 3836.00, 'Water', 22.70, NULL, 5.30, '', '2025-08-19 18:56:04.542', '2025-08-19 18:58:22.117', NULL, 72, 81.10, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwlpq0000l8g16h7zj9fvf', 'MB3045', 'AV5', 'Canadian Rockies Hemp', 1000.10, 1.00, 0.10, 'Sulfuric Acid', 160.00, 23.00, NULL, NULL, 3964.00, 'Water', 22.80, NULL, 5.10, '', '2025-08-19 18:55:14.808', '2025-08-19 18:58:33.865', NULL, 71, 82.80, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirh24n001z3zyas4e9nvhh', 'MB3005', 'AV5', 'Canadian Rockies Hemp', 999.40, 1.00, 0.10, 'Sulfuric Acid', 200.00, 24.00, NULL, NULL, 4280.00, 'Water', 19.00, 40.00, 2.00, '', '2025-08-19 16:31:39.527', '2025-08-24 19:48:25.686', NULL, 43, 81.40, 'MB3005/3008/3010', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirjdx700213zya9kovha7r', 'MB3008', 'AV5', 'Canadian Rockies Hemp', 1000.20, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4238.00, 'Water', 18.00, 40.00, 2.60, '', '2025-08-19 16:33:28.123', '2025-08-24 19:48:25.686', NULL, 45, 82.20, 'MB3005/3008/3010', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeirkdgy00223zyakxeuf0kb', 'MB3010', 'AV5', 'Canadian Rockies Hemp', 1000.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 24.00, NULL, NULL, 4235.00, 'Water', 18.90, 40.00, 2.00, '', '2025-08-19 16:34:14.194', '2025-08-24 19:48:25.686', NULL, 46, 81.30, 'MB3005/3008/3010', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeivjepx00028g165was0fi4', 'MB3020', 'AV5', 'Canadian Rockies Hemp', 1000.20, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4278.00, 'Water', 18.90, 40.00, 1.70, '', '2025-08-19 18:25:27.62', '2025-08-24 19:48:58.588', NULL, 52, 81.10, 'MB3016/3018/3020', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwgwt5000h8g16thln60v3', 'MB3039', 'AV5', 'Canadian Rockies Hemp', 1000.00, 1.00, 0.10, 'Sulfuric Acid', 180.00, 25.00, NULL, NULL, 4353.00, 'Water', 19.10, 40.00, 1.80, '', '2025-08-19 18:51:30.703', '2025-08-25 00:05:45.035', NULL, 67, 81.20, 'MB3037/3039/3042', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeiwj965000j8g16otwq6apv', 'MRa3042', 'AV5', 'Canadian Rockies Hemp', 999.90, 1.00, 0.10, 'Sulfuric Acid', 185.00, 26.00, NULL, NULL, 4026.00, 'Water', 19.30, 40.00, NULL, '', '2025-08-19 18:53:20.045', '2025-08-25 00:05:45.035', NULL, 69, 80.00, 'MB3037/3039/3042', 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeq73apo003me12uxdi5h5x3', 'TB1168', 'Pilot Plant', 'Canadian Rockies Hemp', NULL, NULL, NULL, '', 180.00, 24.00, 8.00, 12.00, NULL, '', 685.00, NULL, NULL, '', '2025-08-24 21:23:14.556', '2025-08-27 21:38:17.591', NULL, NULL, 3000.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeq7w88m005fe12ugdllfbzy', 'TB1170', 'Pilot Plant', '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, '', 620.00, NULL, NULL, '', '2025-08-24 21:45:44.374', '2025-08-27 21:38:26.626', NULL, NULL, 3000.00, NULL, 'Curia - Germany');
INSERT INTO public.biochar VALUES ('cmeqbeo7n009ge12ucm49crum', 'TB1173', 'Pilot Plant', '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, '', '2025-08-24 23:24:03.73', '2025-08-29 19:23:11.452', '2025-05-01 06:00:00', NULL, NULL, NULL, 'Curia - Germany');


--
-- Data for Name: biochar_lots; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.biochar_lots VALUES ('cmegjnu7m0003gs6ub601bddp', 'MRa231', NULL, 'Combined and Homogenized into Lot MRa231', '2025-08-18 03:17:26.578', '2025-08-18 03:17:26.578');
INSERT INTO public.biochar_lots VALUES ('cmehhig3x00093zyae76o1pgc', 'MB2946X', NULL, 'Combined and homogenized as lot # MB2946X', '2025-08-18 19:05:01.965', '2025-08-18 19:05:01.965');
INSERT INTO public.biochar_lots VALUES ('cmeq3pd5f001re12ube3c6n7e', 'MB3005/3008/3010', NULL, NULL, '2025-08-24 19:48:25.683', '2025-08-24 19:48:25.683');
INSERT INTO public.biochar_lots VALUES ('cmeq3q2jf001te12uv83ucc8s', 'MB3016/3018/3020', NULL, NULL, '2025-08-24 19:48:58.587', '2025-08-24 19:48:58.587');
INSERT INTO public.biochar_lots VALUES ('cmeqcwa8800bqe12ukcwlen2h', 'MB3037/3039/3042', NULL, NULL, '2025-08-25 00:05:45.033', '2025-08-25 00:05:45.033');


--
-- Data for Name: compound_batch_sem_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: compound_batch_update_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: compound_batches; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.compound_batches VALUES ('cmew211ea0000bv3qdynebuuw', 'HG103S1', 'TB1180A', NULL, NULL, 154.20, '2025-08-28 23:48:08.145', '2025-08-28 23:48:08.145');
INSERT INTO public.compound_batches VALUES ('cmew2p4hf000abv3qwax6okzd', 'HG102S2', 'TB1180B', NULL, NULL, 88.90, '2025-08-29 00:06:51.891', '2025-08-29 00:06:51.891');
INSERT INTO public.compound_batches VALUES ('cmf36qf1900114agdnl9hn88j', 'HG100SX', 'TB1175A', 'TB1175A - This was a compound batch with mixed data used for initial micronization testing, hence the X moniker for species. ', NULL, 41.71, '2025-09-02 23:34:13.911', '2025-09-02 23:34:13.911');
INSERT INTO public.compound_batches VALUES ('cmf36ocjb00004agdoyhauipv', 'HG101S1', 'TB1175B', NULL, NULL, 725.79, '2025-09-02 23:32:37.367', '2025-09-03 00:00:03.364');
INSERT INTO public.compound_batches VALUES ('cmf6082om000g54hpxuo2s036', 'MB300A1/3004A', NULL, NULL, '2024-12-12 07:00:00', 1.08, '2025-09-04 22:55:18.933', '2025-09-04 22:55:18.933');


--
-- Data for Name: conductivity_tests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.conductivity_tests VALUES ('cmf4k0znm0001pjt5m8ysv5jp', '2025-05-03 00:00:00', 'MRa389C', '', 4.100000, 11.900000, 14.500000, 18.400000, '', '2025-09-03 22:34:08.385', '2025-09-03 23:12:53.418', NULL, 'conductivity-reports/MRa389C-1_1756941173406.xlsm', 'MRa389C-1');
INSERT INTO public.conductivity_tests VALUES ('cmf4n1ipi0001jostyofvyxxo', '2025-05-03 00:00:00', 'MRa389A', '', 3.600000, 10.800000, 13.300000, 16.900000, '', '2025-09-03 23:58:31.914', '2025-09-03 23:58:31.914', NULL, 'conductivity-reports/MRa389A-2_1756943911911.xlsm', 'MRa389-A2');
INSERT INTO public.conductivity_tests VALUES ('cmeqied6m000125yf6gmmzmb4', '2025-05-03 00:00:00', 'MRa389A', '', 4.200000, 12.100000, 14.600000, 18.400000, '', '2025-08-25 02:39:46.741', '2025-09-03 23:58:56.483', NULL, 'conductivity-reports/MRa389A-1_1756943936480.xlsm', 'MRa389A-1');
INSERT INTO public.conductivity_tests VALUES ('cmf4n3lzy0003jost0nmmmm5w', '2025-05-03 00:00:00', 'MRa389C', '', 4.200000, 12.200000, 14.800000, 18.800000, '', '2025-09-04 00:00:09.501', '2025-09-04 00:00:09.501', NULL, 'conductivity-reports/MRa389C-2_1756944009496.xlsm', 'MRa389-C2');
INSERT INTO public.conductivity_tests VALUES ('cmf4n7zdj0005jostwzanpaxv', '2025-05-20 00:00:00', NULL, 'This was the batch that was sent to Albany for micronization. ', 3.900000, 11.100000, 13.400000, 17.000000, '', '2025-09-04 00:03:33.454', '2025-09-04 00:03:33.454', 'HG101S1', 'conductivity-reports/TB1175B-1_1756944213450.xlsm', 'TB1175B-1');
INSERT INTO public.conductivity_tests VALUES ('cmf4n90ii0007jostzpjqtdiv', '2025-05-20 00:00:00', NULL, 'Sent to Albany for micronization', 4.200000, 114.000000, 13.700000, 17.300000, '', '2025-09-04 00:04:21.593', '2025-09-04 00:04:21.593', 'HG101S1', 'conductivity-reports/TB1175B-2_1756944261589.xlsm', 'TB1175B-2');


--
-- Data for Name: content_processing_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.content_processing_logs VALUES ('cmfbrb3xd008rmb9h8efrkpy8', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-08 23:32:21.025');
INSERT INTO public.content_processing_logs VALUES ('cmfbrb44z008tmb9hw3sjpoba', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-08 23:32:21.3');
INSERT INTO public.content_processing_logs VALUES ('cmfbrb67r00c7mb9hresa08e4', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'connect ECONNREFUSED 207.24.42.235:443', NULL, '2025-09-08 23:32:23.991');
INSERT INTO public.content_processing_logs VALUES ('cmfbrb6kh00c9mb9hq8vu7t68', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-08 23:32:24.449');
INSERT INTO public.content_processing_logs VALUES ('cmfcqd8xz003t57jlez4p4jai', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-09 15:53:47.4');
INSERT INTO public.content_processing_logs VALUES ('cmfcqd973003v57jleeb223cy', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 15:53:47.727');
INSERT INTO public.content_processing_logs VALUES ('cmfcqd9hk004157jlxs66j4ck', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-09 15:53:48.105');
INSERT INTO public.content_processing_logs VALUES ('cmfcqekb4004557jlom37oasd', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'Request timed out after 60000ms', NULL, '2025-09-09 15:54:48.784');
INSERT INTO public.content_processing_logs VALUES ('cmfcqekk5004757jl14y378vs', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 15:54:49.109');
INSERT INTO public.content_processing_logs VALUES ('cmfcwgd95000111desedbdr2k', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-09 18:44:10.649');
INSERT INTO public.content_processing_logs VALUES ('cmfcwgdgr000311dexsr1hzlp', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 18:44:10.924');
INSERT INTO public.content_processing_logs VALUES ('cmfcwgdso000711dep8noo67e', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-09 18:44:11.353');
INSERT INTO public.content_processing_logs VALUES ('cmfcwge22000911de54p9s2ac', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'connect ECONNREFUSED 207.24.42.235:443', NULL, '2025-09-09 18:44:11.691');
INSERT INTO public.content_processing_logs VALUES ('cmfcwgeg5000b11de4mx2a2kp', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 18:44:12.198');
INSERT INTO public.content_processing_logs VALUES ('cmfd18nhv000113h24g6146fg', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-09 20:58:08.755');
INSERT INTO public.content_processing_logs VALUES ('cmfd18nv0000313h24kau068u', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 20:58:09.228');
INSERT INTO public.content_processing_logs VALUES ('cmfd18oa1000713h25962md0p', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-09 20:58:09.77');
INSERT INTO public.content_processing_logs VALUES ('cmfd18opp000913h25ar27qm6', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', '', NULL, '2025-09-09 20:58:10.334');
INSERT INTO public.content_processing_logs VALUES ('cmfd18p6h000b13h2nmbcre10', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 20:58:10.937');
INSERT INTO public.content_processing_logs VALUES ('cmfd6d8ur009169bnp6e2jil6', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-09 23:21:41.14');
INSERT INTO public.content_processing_logs VALUES ('cmfd6d95j009369bnewp7fh1g', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 23:21:41.527');
INSERT INTO public.content_processing_logs VALUES ('cmfd6d9i4009769bn4s5urpwk', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-09 23:21:41.98');
INSERT INTO public.content_processing_logs VALUES ('cmfd6d9ut00c369bnayb8qfc3', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'connect ECONNREFUSED 207.24.42.235:443', NULL, '2025-09-09 23:21:42.437');
INSERT INTO public.content_processing_logs VALUES ('cmfd6da9100c569bnw6h8uyyt', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 23:21:42.949');
INSERT INTO public.content_processing_logs VALUES ('cmfd770dx00911e8msl25jni3', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-09 23:44:49.846');
INSERT INTO public.content_processing_logs VALUES ('cmfd770ic00931e8mz3763l31', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 23:44:50.004');
INSERT INTO public.content_processing_logs VALUES ('cmfd770u300971e8mhmdzdke9', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-09 23:44:50.428');
INSERT INTO public.content_processing_logs VALUES ('cmfd7716100c31e8mfvtp8pgm', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'connect ECONNREFUSED 207.24.42.235:443', NULL, '2025-09-09 23:44:50.857');
INSERT INTO public.content_processing_logs VALUES ('cmfd771kq00c51e8m3420yig9', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-09 23:44:51.386');
INSERT INTO public.content_processing_logs VALUES ('cmfh147z3008xug5pd7u9112h', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-12 16:05:46.719');
INSERT INTO public.content_processing_logs VALUES ('cmfh14874008zug5p38yetj96', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-12 16:05:47.008');
INSERT INTO public.content_processing_logs VALUES ('cmfh1490h009bug5p6pjrdvxy', NULL, 'cmfbraghi0003yzw7qj5nisrd', 'PARSE', 'FAILED', '
Invalid `prisma.newsArticle.create()` invocation:


Unique constraint failed on the fields: (`url`)', NULL, '2025-09-12 16:05:48.066');
INSERT INTO public.content_processing_logs VALUES ('cmfh15jp900c7ug5piky4kl08', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'Request timed out after 60000ms', NULL, '2025-09-12 16:06:48.571');
INSERT INTO public.content_processing_logs VALUES ('cmfh15k6900c9ug5pjeadpaem', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-12 16:06:49.185');
INSERT INTO public.content_processing_logs VALUES ('cmfiognlr008vx58exybao4ck', NULL, 'cmfbraghj0006yzw7e1q51aft', 'FETCH', 'FAILED', 'Status code 403', NULL, '2025-09-13 19:47:04.191');
INSERT INTO public.content_processing_logs VALUES ('cmfiognx3008xx58ercexdzch', NULL, 'cmfbraghh0002yzw7abs4sb28', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-13 19:47:04.6');
INSERT INTO public.content_processing_logs VALUES ('cmfiogomd00c3x58ehrdk1yvn', NULL, 'cmfbraghk0008yzw7r0fksnr3', 'FETCH', 'FAILED', 'connect ECONNREFUSED 207.24.42.235:443', NULL, '2025-09-13 19:47:05.509');
INSERT INTO public.content_processing_logs VALUES ('cmfiogp5i00c5x58exl1ckvs7', NULL, 'cmfbraghk0009yzw710dwodd3', 'FETCH', 'FAILED', 'Status code 404', NULL, '2025-09-13 19:47:06.198');


--
-- Data for Name: graphene; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.graphene VALUES ('cmeh8stb40001syoh3ry47g46', 'TB1131', 'A', 1.20, 1.20, 'KOH', 90.00, 'manual', NULL, 'Ar', '24', 790.00, 1.00, 100.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.16, '', 'ground', '2025-08-18 15:01:09.087', '2025-08-18 15:01:09.087', NULL, 1, 'MB2933', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehg5c6f0001k73z4h7kwfjl', 'TB1132', 'A', 1.30, 1.30, 'KOH', 90.00, 'mill', 2.00, 'Ar', '25', 792.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.30, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 18:26:50.727', '2025-08-18 18:26:50.727', NULL, 2, 'MB2935', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehgmui60003r3l2qpaja2lu', 'TB1134', 'A', 1.00, 1.00, 'KOH', 90.00, 'mill', 2.00, 'Ar', '3', 771.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.30, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 18:40:27.624', '2025-08-18 18:40:27.624', NULL, 4, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MRa231', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhvpl1000l3zyaeg17mqwg', 'MB2947D', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'Ar', '3', 810.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.04, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:15:20.772', '2025-08-18 19:34:24.483', NULL, 10, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhl2gi000b3zya8bpy6mlj', 'MB2946', 'A', 1.00, 1.00, 'KOH', 90.00, 'mill', 1.00, 'Ar', '5', 770.00, 1.00, 22.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.30, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:07:04.237', '2025-08-25 00:16:48.934', '2024-06-07 06:00:00', 5, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhng8e000d3zya6drzkkxu', 'MB2947', 'A', 1.00, 1.00, 'KOH', 90.00, 'mill', 1.00, 'Ar', '5', 770.00, 1.00, 22.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.30, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:08:55.405', '2025-08-25 00:19:58.322', '2024-06-14 06:00:00', 6, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhs2t5000j3zya5btfjns3', 'MB2947C', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'Ar', '3', 806.00, 1.00, NULL, '', NULL, '', 'atm. Pressure', 0.00, '', '*BATCH DISCARDED* ground biochar: brown powder; see temp trend. ', '2025-08-18 19:12:31.283', '2025-08-25 00:20:51.708', '2024-06-14 06:00:00', 9, NULL, '{}', NULL, NULL, NULL, NULL, '', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhq6m3000h3zyat1fna370', 'MB2947B', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'Ar', '3', 804.00, 1.00, 10.00, 'HCl', 40.00, 'N2 stream', '210 mbar', 0.01, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:11:02.907', '2025-08-25 00:21:06.287', '2024-06-14 06:00:00', 8, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehhoolb000f3zyalvev321k', 'MB2947A', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'Ar', '3', 803.00, 1.00, 10.00, 'HCl', 40.00, 'N2 stream', '210 mbar', 0.01, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:09:52.895', '2025-08-25 00:21:21.227', '2024-06-14 06:00:00', 7, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehibmez000n3zya6s2jmzll', 'TB1135-1', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 14.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:27:43.162', '2025-08-25 00:22:40.698', '2024-06-17 06:00:00', 11, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehicg7g000p3zyavs646cuz', 'TB1135-2', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 14.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:28:21.771', '2025-08-25 00:22:55.817', '2024-06-17 06:00:00', 12, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehifaxx000t3zya0re8j781', 'MB2952C', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 3.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.05, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:30:34.916', '2025-08-25 00:23:49.394', '2024-06-19 06:00:00', 14, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehie0vo000r3zyajv2j6xjj', 'MB2952B', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:29:35.22', '2025-08-25 00:24:06.519', '2024-06-19 06:00:00', 13, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehigzfo000v3zyasf8ogzqo', 'MB2952C2', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 19:31:53.309', '2025-08-25 00:24:25.469', '2024-06-19 06:00:00', 15, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehij6xl000x3zyaoko7mnn8', 'MB2955A', 'A', 0.25, 0.25, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'Quartz tube schattered during experiment', '2025-08-18 19:33:36.344', '2025-08-25 00:25:09.157', '2024-06-28 06:00:00', 16, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehillwb000z3zya6m1qx2dy', 'MB2955A2', 'A', 0.25, 0.38, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'Ground biochar: brown powder; see temp trend', '2025-08-18 19:35:29.05', '2025-08-25 00:25:28.597', '2024-06-28 06:00:00', 17, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehimz0g00113zyambeggrfd', 'TB1136', 'A', 0.26, 0.39, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 14.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'Ground biochar: brown powder; see temp trend', '2025-08-18 19:36:32.704', '2025-08-25 00:26:04.1', '2024-07-08 06:00:00', 18, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehio9z400133zyayfr67mac', 'MB2962A', 'A', 0.25, 0.50, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'Ground biochar: brown powder; see temp trend', '2025-08-18 19:37:33.56', '2025-08-25 00:26:54.37', '2025-07-10 06:00:00', 19, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehip9so00153zyaa8wqhnga', 'MB2962B', 'A', 0.25, 0.50, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'Ground biochar: brown powder; see temp trend', '2025-08-18 19:38:19.992', '2025-08-25 00:27:08.751', '2024-07-10 06:00:00', 20, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmehitpbp00173zyayovzk9k4', 'MB2963A', 'A', 0.22, 0.22, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'Ground biochar: brown powder; see temp trend', '2025-08-18 19:41:46.74', '2025-08-25 00:27:56.7', '2025-07-12 06:00:00', 21, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1f4eb000u8g16b075a7hk', 'TB1137-1', 'A', 0.26, 1.06, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'Ground biochar: brown powder; see temp trend', '2025-08-19 21:10:05.307', '2025-08-25 00:28:54.194', '2024-07-17 06:00:00', 23, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1fwhv000w8g165rxy66ju', 'TB1137-2', 'A', 0.28, 1.13, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 23.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'Ground biochar: brown powder; see temp trend', '2025-08-19 21:10:41.731', '2025-08-25 00:29:10.132', '2024-07-17 06:00:00', 24, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1gwkz000y8g1674t56im0', 'TB1137-3', 'A', 0.26, 1.06, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 23.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'Ground biochar: brown powder; see temp trend', '2025-08-19 21:11:28.499', '2025-08-25 00:29:27.24', '2024-07-17 06:00:00', 25, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MB2946X', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1ikoo00108g167snrl3jp', 'MB2965A', 'A', 0.22, 1.08, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.02, '', 'Ground biochar/KOH mixture likely absorbed some moisture; see temp trend', '2025-08-19 21:12:46.391', '2025-08-25 00:30:10.47', '2024-07-25 06:00:00', 26, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1jicq00128g16j1ff1tjf', 'MB2965B', 'A', 0.22, 1.08, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.01, '', 'Ground biochar/KOH mixture likely absorbed some moisture; see temp trend', '2025-08-19 21:13:30.026', '2025-08-25 00:30:27.366', '2024-07-25 06:00:00', 27, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1kcz100148g16k1s9nclz', 'MB2965B2', 'B', 0.22, 1.08, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.01, '', 'Ground biochar/KOH mixture likely absorbed some moisture; see temp trend', '2025-08-19 21:14:09.708', '2025-08-25 00:30:45.105', '2024-07-25 06:00:00', 28, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej2595r002g8g16yjd5ow59', 'MB2980', 'A', 0.52, 0.78, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 21.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.23, '', 'ground biochar (brown powder) compacted to pellet', '2025-08-19 21:30:24.543', '2025-08-19 21:30:24.543', NULL, 51, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1n90q001a8g16txbqz53m', 'MB2967A', 'B', 0.26, 1.04, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:16:24.553', '2025-08-25 00:32:20.793', '2025-07-30 06:00:00', 31, 'MB2964', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1mciz00188g16ays64gej', 'MB2967B', 'A', 0.26, 1.04, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.05, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:15:42.434', '2025-08-25 00:32:36.812', '2024-07-30 06:00:00', 30, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1q41b001g8g16h2ql6xyx', 'MB2970B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.02, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:18:38.063', '2025-08-26 18:44:44.599', '2024-07-31 06:00:00', 33, 'MB2957', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1pbu1001e8g161qkjn2q7', 'MB2970A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:18:01.512', '2025-08-26 18:45:04.449', '2024-07-31 06:00:00', 32, 'MB2957', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1rupa001k8g167i8eqj0j', 'MB2971B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.07, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:19:59.277', '2025-08-26 18:45:27.701', '2024-08-08 06:00:00', 35, 'MB2958', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1r7vj001i8g162aerwvfk', 'MB2971A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.05, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:19:29.694', '2025-08-26 18:45:50.121', '2024-08-06 06:00:00', 34, 'MB2958', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1sljy001m8g16rx2pujk5', 'MB2972A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:20:34.077', '2025-08-26 18:50:34.872', '2024-08-07 06:00:00', 36, 'MB2961', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1t70e001o8g16dt1wu578', 'MB2972B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:21:01.881', '2025-08-26 18:50:50.628', '2024-08-07 06:00:00', 37, 'MB2961', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1tta2001q8g16mz1ccqij', 'MB2973A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.04, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:21:30.745', '2025-08-26 18:51:14.895', '2024-08-12 06:00:00', 38, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1uky4001s8g16z11dr8jv', 'MB2973B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:22:06.603', '2025-08-26 18:51:33.398', '2024-08-12 06:00:00', 39, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1vkq0001u8g16a9j1smaa', 'MB2974A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:22:52.968', '2025-08-26 18:51:54.323', '2024-08-15 06:00:00', 40, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1w8uy001w8g16p1lpnt5f', 'MB2974B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:23:24.249', '2025-08-26 18:52:12.35', '2024-08-15 06:00:00', 41, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1x937001y8g16xobh32nu', 'MB2975A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:24:11.202', '2025-08-26 18:53:00.113', '2024-08-19 06:00:00', 42, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1y3ay00208g16twdubz6j', 'MB2975B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:24:50.361', '2025-08-26 18:53:15.592', '2024-08-19 06:00:00', 43, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1ysiz00228g16h36hlp2a', 'MB2976A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:25:23.05', '2025-08-26 18:53:35.811', '2024-08-19 06:00:00', 44, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1zi7k00248g162vardwvt', 'MB2976B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.11, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:25:56.335', '2025-08-26 18:53:52.078', '2024-08-19 06:00:00', 45, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej208o400268g16tda585c0', 'MB2979A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:26:30.619', '2025-08-26 18:56:45.019', '2024-08-23 06:00:00', 46, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej20y1200288g16mrg3fk0q', 'MB2979B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.10, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:27:03.493', '2025-08-26 18:57:05.414', '2024-08-23 06:00:00', 47, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej22q7x002a8g16mgm0nbru', 'MB2980A', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.08, '', 'ground biochar (brown powder) compacted to pellet', '2025-08-19 21:28:26.685', '2025-08-26 18:57:45.286', '2024-08-29 06:00:00', 48, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej23ix8002c8g16l96x85uu', 'MB2980B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.10, '', 'ground biochar (brown powder) compacted to pellet', '2025-08-19 21:29:03.884', '2025-08-26 18:58:06.526', '2024-08-29 06:00:00', 49, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej24iwu002e8g168olgu3ah', 'MB2980C', 'B', 0.52, 0.78, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 21.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.16, '', 'ground biochar (brown powder) compacted to pellet', '2025-08-19 21:29:50.526', '2025-08-26 18:58:40.381', '2024-08-29 06:00:00', 50, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej26fhf002i8g16wx3kklpx', 'KJo-0165A', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'ground biochar: brown powder', '2025-08-19 21:31:19.394', '2025-08-26 18:59:43.454', '2024-08-29 06:00:00', 52, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej275eu002k8g16mstontze', 'KJo-0165B', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 11.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.15, '', 'ground biochar: brown powder', '2025-08-19 21:31:52.989', '2025-08-26 18:59:57.001', '2024-08-29 06:00:00', 53, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej27s0q002m8g16w9lerapp', 'KJo-0166A', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 11.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.13, '', 'ground biochar: brown powder', '2025-08-19 21:32:22.297', '2025-08-26 19:01:15.33', '2024-09-03 06:00:00', 54, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3rjrx002s8g16xfpiyh62', 'KJo-0167B', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 4.00, 11.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.06, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:03:30.524', '2025-08-26 19:03:11.519', '2024-09-03 06:00:00', 57, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek445v0003c8g1652gg7wgb', 'KJo-0176', 'B', 24.00, 0.36, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.10, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:13:19.02', '2025-08-29 19:14:56.262', '2024-09-16 06:00:00', 67, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek459h6003e8g16c1dd431d', 'KJo-0177', 'A', 1.60, 2.40, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 61.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.91, '', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:14:10.355', '2025-08-29 19:16:20.732', '2024-09-16 06:00:00', 68, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5rrq500074t6gvtcu5abv', 'MRa323', 'A', 1.06, 1.60, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:59:40.06', '2025-08-20 15:59:40.06', NULL, 75, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek61umg00094t6g7jqp8ij0', 'TB1141', 'A', 1.08, 1.62, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 30.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:07:30.37', '2025-08-20 16:07:30.37', NULL, 76, NULL, '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek64wte000b4t6gle3eu775', 'MRa327', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:09:53.186', '2025-08-20 16:10:24.751', NULL, 78, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek633kc000a4t6gy4z40gp2', 'MRa326', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.51, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:08:28.619', '2025-08-20 16:10:37.23', NULL, 77, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek6a1iv000d4t6g9yzcomtb', 'MB2988', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.42, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:13:52.561', '2025-08-20 16:13:52.561', NULL, 79, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek6b77n000f4t6gep2ls7ko', 'MRa328', 'B', 1.20, 1.80, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, '1', 'ground biochar: (sonicated, brown powder) compacted to two pellets of equal size', '2025-08-20 16:14:46.595', '2025-08-20 16:14:46.595', NULL, 80, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek6fyes000j4t6gj6g9r8n3', 'MB2990A', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.50, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:18:28.468', '2025-08-20 16:18:28.468', NULL, 82, 'MB2982', '{Black/Grey,Brittle}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3sna7002u8g161p4p0nmc', 'KJo-0168A', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 4.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.02, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:04:21.727', '2025-08-26 19:03:41.413', '2024-09-08 06:00:00', 58, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3thga002w8g16fhib2ms3', 'KJo-0168B', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.09, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:05:00.826', '2025-08-26 19:03:59.439', '2024-09-08 06:00:00', 59, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3v67b002y8g16vb6bcfoo', 'KJo-0169', 'B', 0.80, 1.20, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 30.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.23, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:06:19.559', '2025-08-26 19:05:21.918', '2024-09-05 06:00:00', 60, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3wayg00308g16g7qomlry', 'KJo-0170', 'B', 1.07, 1.61, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 38.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.62, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:07:12.375', '2025-08-26 19:05:51.421', '2024-09-05 06:00:00', 61, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3zd2i00348g16m1bbjgdj', 'KJo-0171B', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.13, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:09:35.081', '2025-08-26 19:06:33.754', '2024-09-09 06:00:00', 63, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek40adx00368g16y43ous1d', 'KJo-0172A', 'B', 0.50, 0.50, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 11.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.24, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:10:18.26', '2025-08-26 19:06:59.795', '2024-09-09 06:00:00', 64, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek414pt00388g16qih7z16t', 'KJo-0172B', 'A', 0.50, 0.50, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.17, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:10:57.569', '2025-08-26 19:07:14.221', '2024-09-09 06:00:00', 65, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek6ha6s000l4t6g9g9xwf9j', 'MB2990B', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.42, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:19:30.38', '2025-08-20 16:19:30.38', NULL, 83, 'MB2982', '{Black/Grey,Brittle}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek6cz73000h4t6gadyqksor', 'MRa329', 'A', 1.04, 1.56, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, '2', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 16:16:09.518', '2025-08-20 16:19:45.969', NULL, 81, 'KJo-0173', '{Shiny,Black/Grey,Voluminous}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekfmwnm000n4t6guygz9ayo', 'MRa331A', 'B', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.64, 'Mostly 1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 20:35:49.323', '2025-08-20 20:36:49.767', NULL, 84, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek46a9c003g8g16keywmjfg', 'KJo-0178', 'A', 1.60, 2.40, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 60.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.55, '', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:14:58.031', '2025-08-29 19:17:03.317', '2024-09-16 06:00:00', 69, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5dpgu000113l8y63dwlg4', 'MB2981', 'B', 1.44, 2.16, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 60.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, '', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:48:43.949', '2025-08-29 19:17:37.544', '2024-09-18 06:00:00', 70, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5gq7r000313l8i3h6rcnr', 'TB1138', 'A', 1.54, 2.31, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 59.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.59, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:51:04.887', '2025-08-29 19:18:41.852', '2024-09-18 06:00:00', 71, NULL, '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5jrm000014t6gcd18mldf', 'TB1139', 'A', 1.39, 2.08, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 50.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.54, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:53:26.663', '2025-08-29 19:20:00.917', '2024-09-26 06:00:00', 72, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5kydb00034t6g64irlclj', 'TB1140A', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 49.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:54:22.079', '2025-08-29 19:20:34.238', '2024-09-26 06:00:00', 73, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek5nxlk00054t6gs3xzn4i3', 'TB1140B', 'B', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 50.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.48, '1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 15:56:41.043', '2025-08-29 19:20:54.718', '2024-09-26 06:00:00', 74, 'KJo-0173', '{Black/Grey,Brittle}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekfp9bt0001n6rkafvy6i34', 'MRa331B', 'A', 1.04, 1.56, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, 'Mostly 1', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 20:37:39.064', '2025-08-20 20:37:39.064', NULL, 85, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekg4pl10001q1oama498e2i', 'MRa333B', 'B', 1.04, 0.94, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.26, '2', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 20:49:39.972', '2025-08-20 20:49:39.972', NULL, 87, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.62, 98.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekg74kr0003q1oa8t0dgfke', 'MRa334A', 'A', 1.04, 1.25, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.48, 'Mostly 2', 'EXTRA DRIED. ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-20 20:51:32.714', '2025-08-20 20:51:32.714', NULL, 88, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekg8wkx0005q1oa211v6pmx', 'MRa334B', 'B', 0.88, 1.06, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 33.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, 'Mostly 2', 'EXTRA DRIED. ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-20 20:52:55.664', '2025-08-20 20:52:55.664', NULL, 89, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.26, 98.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekg94tz0007q1oag8pqrdj6', 'MB29933', 'B', 0.88, 1.06, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 33.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, 'Mostly 2', 'EXTRA DRIED. ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-20 20:53:06.359', '2025-08-22 04:05:51.823', NULL, 90, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.26, 98.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekgbkct0009q1oahehknevs', 'MB2993A', 'A', 1.28, 1.15, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.22, 'Mostly 2', 'ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-20 20:54:59.782', '2025-08-22 12:37:40.025', NULL, 91, 'MB2982', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.77, 98.00, 'NaOH', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoql34u00042er8at56w7ks', 'TB1144B', 'B', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 54.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.36, '2', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-23 20:53:24.889', '2025-08-23 20:53:24.889', '2024-10-21 00:00:00', 96, 'KJo-0174', '{Black/Grey,Shiny}', NULL, false, 6.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmemtkfbl0001tsxyle6tbqsy', 'MB2993B', 'B', 1.04, 0.94, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.19, 'Mostly 2', 'ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-22 12:41:20.528', '2025-08-23 20:22:40.514', NULL, 92, 'MB2982', '{Voluminous,Shiny,Grey}', NULL, false, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', '/uploads/sem-reports/24-047052-1_TB1133_SEM_mit-Pt_1755980560487.pdf', 0.62, 98.00, 'NaOH', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeopv3ps0001snn80aafa1pa', 'MB2995B', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 4.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '1/2 Mix', 'EXTRA DRIED ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-23 20:33:12.58', '2025-08-23 20:37:40.52', NULL, 93, 'MB2983', '{Voluminous,Shiny,Grey}', NULL, NULL, 5.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoq2eui0003snn89x1gms8m', 'MB2995A', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 4.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.54, 'Mostly 1', 'EXTRA DRIED ground biochar: (brown powder) compacted to two pellets of equal size.', '2025-08-23 20:38:53.606', '2025-08-23 20:38:53.606', NULL, 94, 'MB2983', '{Voluminous,Shiny,Grey}', NULL, NULL, 3.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoqp24900092er8hvby7miq', 'MB2997A', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.55, '1', 'EXTRA DRIED ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-23 20:56:30.201', '2025-08-23 20:56:30.201', '2024-10-21 00:00:00', 97, 'MB2985', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 3.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoq8mu00005snn8e6xhcb82', 'TB1144A', 'A', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 38.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.61, 'Mostly 1', 'ground biochar: (brown powder) NOT compacted', '2025-08-23 20:43:43.896', '2025-08-23 20:48:15.898', '2024-10-21 00:00:00', 95, 'KJo-0174', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 5.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoqrh80000e2er8rivrncds', 'MB2997B', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 40.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.45, '1', 'EXTRA DRIED ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-23 20:58:23.087', '2025-08-23 20:58:23.087', '2024-10-21 00:00:00', 98, 'MB2985', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 2.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoqu3rc000j2er8yvgttikf', 'MB2999A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.68, 'Mostly 1/2 Mix', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-23 21:00:25.603', '2025-08-23 21:00:25.603', '2024-10-24 00:00:00', 99, 'KJo-0174', '{Black/Grey,Shiny,Voluminous}', NULL, false, 4.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 25.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoqvqus000o2er82eqx1bz8', 'MB2999B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '1 + Fibres', 'ground biochar: (brown powder) NOT compacted', '2025-08-23 21:01:42.195', '2025-08-23 21:01:42.195', '2024-10-24 00:00:00', 100, 'KJo-0174', '{Black/Grey,Shiny,Voluminous}', NULL, false, 4.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 25.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeor5clr000y2er8cg966ayl', 'TB1147', 'B', 1.08, 1.62, 'KOH', 90.00, 'mill', 4.00, 'N2', '3', 800.00, 1.00, 37.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.36, 'Mostly 1', 'EXTRA DRIED ground biochar/KOH mix: (brown powder, MB2990) dried at 100C, then compacted to two pellets of equal size', '2025-08-23 21:09:10.286', '2025-08-23 21:09:10.286', '2024-10-24 00:00:00', 102, 'MB2982', '{Black/Grey,"Somewhat Shiny"}', NULL, NULL, 5.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmekfriy90003n6rkofuxvehm', 'MRa333A', 'A', 1.28, 1.15, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.21, '2', 'ground biochar: (brown powder) compacted to two pellets of equal size', '2025-08-20 20:39:24.848', '2025-08-25 01:04:10.692', NULL, 86, 'MB2985', '{Voluminous,Shiny,Grey}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.77, 98.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeor8ps200132er8h0iifns3', 'MB3001A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.49, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 21:11:47.324', '2025-08-23 21:11:47.324', '2024-10-28 00:00:00', 103, 'KJo-0174', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, NULL, 10.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeor28b9000t2er8cap2gaun', 'TB1146', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 51.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.52, '1', 'ground biochar/KOH mix: (brown powder, MB2990) dried at 100C, then compacted to two pellets of equal size', '2025-08-23 21:06:44.749', '2025-08-23 21:12:11.457', '2024-10-24 00:00:00', 101, 'MB2982', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 4.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeosk9z1001d2er8ml76rr5i', 'MB3003A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.57, 'Mostly 1', 'freshly ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 21:48:46.332', '2025-08-23 21:48:46.332', '2024-10-28 00:00:00', 105, 'MB2986', '{Black/Grey,"Somewhat Shiny"}', NULL, NULL, 5.70, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeosmeiq001i2er8e5bnhts3', 'MB3003B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, '1/2 Mix', 'freshly ground biochar (brown powder) NOT compacted', '2025-08-23 21:50:25.538', '2025-08-23 21:50:25.538', '2024-10-28 00:00:00', 106, 'MB2986', '{Black/Grey,Shiny,Voluminous}', NULL, NULL, 9.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeosoeil001n2er8031ybv1c', 'MB3004A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.59, 'Mostly 2', 'freshly ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 21:51:58.839', '2025-08-23 21:51:58.839', '2024-10-29 00:00:00', 107, 'MB2986', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, NULL, 17.40, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoshnyz00182er87pu3dt7u', 'MB3001B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.48, 'Mostly 2', 'ground biochar (brown powder) NOT compacted', '2025-08-23 21:46:44.502', '2025-08-23 21:52:21.106', '2024-10-28 00:00:00', 104, 'KJo-0174', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 8.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoss2vy001s2er8gbkuvey1', 'MB3004B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.41, 'Mostly 1/2 Mix', 'ground biochar (brown powder) NOT compacted', '2025-08-23 21:54:50.397', '2025-08-23 21:54:50.397', '2024-10-29 00:00:00', 108, 'MB2986', '{Black/Grey,Shiny,Voluminous}', NULL, NULL, 8.40, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeosvtfd001x2er8rp3jvj20', 'TB1151A', 'A', 1.40, 2.10, 'KOH', 90.00, 'ball_mill', 1.20, 'N2', '3', 800.00, 1.00, 51.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 21:57:44.756', '2025-08-23 21:57:44.756', '2024-10-31 00:00:00', 109, 'KJo-0174', '{Black/Grey,Brittle}', NULL, true, 2.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeosxhi100222er8sunls3r4', 'TB1151B', 'B', 1.08, 1.62, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.45, '1', 'ground biochar (brown powder) NOT compacted', '2025-08-23 21:59:02.616', '2025-08-23 21:59:02.616', '2024-10-31 00:00:00', 110, 'KJo-0174', '{Black/Grey,Brittle}', NULL, true, 2.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoszhln00272er8ucxikcgs', 'MB3007A', 'A', 1.20, 1.80, 'KOH', 90.00, 'ball_mill', 30.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.50, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:00:36.059', '2025-08-23 22:00:36.059', '2024-10-31 00:00:00', 111, 'KJo-0174', '{Black/Grey,"Barely Shiny"}', NULL, true, 6.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeot0wuv002c2er8ujr22a3e', 'MB3007B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 30.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, '1', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:01:42.486', '2025-08-23 22:01:42.486', '2024-10-31 00:00:00', 112, 'KJo-0174', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeot4l7r002h2er8wuetij5i', 'MB3009', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.41, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:04:34.019', '2025-08-23 22:04:34.019', '2024-11-05 00:00:00', 113, 'MB2992', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeot6nlk002m2er8711jvdit', 'MB3012A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.64, '1/2 Mix', 'ground biochar (brown powder) NOT compacted ', '2025-08-23 22:06:10.423', '2025-08-23 22:06:10.423', '2024-11-07 00:00:00', 114, 'MB2983', '{Black/Grey,Shiny,Voluminous}', NULL, false, 10.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeote90u002r2er8d8ihy3cl', 'MB3012B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, 'Mostly 1/2 Mix', 'ground biochar (brown powder) NOT compacted ', '2025-08-23 22:12:04.776', '2025-08-23 22:12:04.776', '2024-11-11 00:00:00', 115, 'MB2983', '{Black/Grey,Shiny,Voluminous}', NULL, false, 10.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotg256002t2er8yrp6sjwn', 'MB3013A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.58, 'Mostly 1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:13:29.177', '2025-08-23 22:13:29.177', '2024-11-11 00:00:00', 116, 'MB2983', '{Black/Grey,Shiny}', NULL, false, 4.30, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeothm2b002y2er8m9f974df', 'MB3013B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:14:41.65', '2025-08-23 22:14:41.65', '2024-11-11 00:00:00', 117, 'MB2983', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 12.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotjavh00332er8ievv08wr', 'MB3015A', 'A', 1.20, 1.80, 'KOH', 90.00, 'ball_mill', 31.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:16:00.461', '2025-08-23 22:16:00.461', '2024-11-12 00:00:00', 118, 'MB2986', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 8.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotmew200382er8ac2mw7yf', 'MB3015B', 'B', 1.00, 1.50, 'KOH', 90.00, 'ball_mill', 31.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.36, 'Mostly 2', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:18:25.626', '2025-08-23 22:18:25.626', '2024-11-11 00:00:00', 119, 'MB2986', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 8.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoto0ix003d2er8wzgows5s', 'MRa340A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 120.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.49, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:19:40.328', '2025-08-23 22:19:40.328', '2024-11-12 00:00:00', 120, 'MB2996', '{Black/Grey,"Barely Shiny"}', NULL, true, 4.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotplvj003i2er8xnd235v3', 'MRa340B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 120.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, '1', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:20:54.654', '2025-08-23 22:20:54.654', '2024-11-12 00:00:00', 121, 'MB2996', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeottwb0003n2er8fh8p8otr', 'TB1155A', 'A', 1.28, 1.54, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.69, '', 'NaOH not fully ground! ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:24:14.785', '2025-08-23 22:24:14.785', NULL, 122, 'MB2986', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 4.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.38, 98.00, 'NaOH', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotvcl6003p2er8raa6jvtb', 'TB1155B', 'B', 1.04, 1.25, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.45, '', 'NaOH not fully ground! ground biochar (brown powder) NOT compacted', '2025-08-23 22:25:22.553', '2025-08-23 22:25:22.553', NULL, 123, 'MB2986', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 4.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeoty1dh003r2er8wbdq9p0y', 'MB3017A', 'A', 1.28, 1.54, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:27:27.989', '2025-08-23 22:27:27.989', '2024-11-19 00:00:00', 124, 'MB3002', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 19.10, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.38, 98.00, 'NaOH', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeotzsfo003w2er8v917iodi', 'MB3017B', 'B', 1.04, 1.25, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.33, '2', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:28:49.715', '2025-08-23 22:28:49.715', '2024-11-19 00:00:00', 125, 'MB3002', '{Black/Grey,Shiny,Voluminous}', NULL, true, 12.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', 35.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeou1jrz00412er845359u2g', 'MB3019A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.47, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:30:11.8', '2025-08-23 22:30:11.8', '2024-11-19 00:00:00', 126, 'MB3002', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 15.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeou32yo00462er80skmdgx2', 'MB3019B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 11.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, 'Mostly 2', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:31:23.328', '2025-08-23 22:31:23.328', '2024-11-19 00:00:00', 127, 'MB3002', '{Black/Grey,Shiny,Voluminous}', NULL, false, 9.30, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 15.00, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeou5j8k004b2er8h2uvyi3w', 'MB3021A', 'A', 1.28, 1.92, 'KOH', 90.00, 'mill', 2.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.52, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-23 22:33:17.732', '2025-08-23 22:33:17.732', '2024-11-22 00:00:00', 128, 'MB3002', '{Black/Grey,Shiny}', NULL, false, 7.30, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeou75tm004g2er8c1lvb3fq', 'MB3021B', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 2.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, 'Mostly 1', 'ground biochar (brown powder) NOT compacted', '2025-08-23 22:34:33.657', '2025-08-24 14:50:06.468', '2024-11-22 07:00:00', 129, 'MB3002', '{Black/Grey,Shiny}', NULL, NULL, 5.30, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(2% Water)', NULL);
INSERT INTO public.graphene VALUES ('cmepth8ed0001rbcz8kbdzgu3', 'MB3023A', 'A', 1.08, 1.30, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.28, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 15:02:10.11', '2025-08-24 15:02:10.11', '2024-11-26 07:00:00', 130, 'MB2989', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 16.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.32, NULL, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepxue7h0001gqvgj5qirhx2', 'MB3023B', 'B', 0.80, 0.96, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.25, 'Mostly 2', 'ground biochar (brown powder) NOT compacted', '2025-08-24 17:04:22.628', '2025-08-24 17:04:22.628', '2024-11-26 07:00:00', 131, 'MB2989', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 13.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.24, NULL, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepxxhdg0006gqvg1mnjpr81', 'MRa352A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.62, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:06:46.707', '2025-08-24 17:06:46.707', '2024-12-02 07:00:00', 132, 'MB3002', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, '(2% Water)', NULL);
INSERT INTO public.graphene VALUES ('cmepxys7k000bgqvgoz888bzm', 'MRa352B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, '1', 'ground biochar (brown powder) NOT compacted', '2025-08-24 17:07:47.408', '2025-08-24 17:07:47.408', '2024-12-02 07:00:00', 133, 'MB3002', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, '(2% Water)', NULL);
INSERT INTO public.graphene VALUES ('cmepy1cqa000ggqvgrfqpneg8', 'MRa353A', 'A', 1.28, 1.92, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:09:47.309', '2025-08-24 17:09:47.309', '2024-12-03 07:00:00', 134, 'MB2991', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepy2wcu000lgqvg7xz1i0yq', 'MRa353B', 'B', 1.04, 1.39, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:10:59.406', '2025-08-24 17:10:59.406', '2024-12-03 07:00:00', 135, 'MB2991', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.17, 98.00, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzjfrd000qgqvgixrkxqy1', 'TB1158A', 'A', 1.04, 1.25, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 50.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:51:50.658', '2025-08-24 17:51:50.658', '2024-12-05 07:00:00', 136, 'MB2991', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 17.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzmdrt0010gqvgvrhb1xdr', 'TB1160A', 'A', 1.04, 1.25, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:54:08.057', '2025-08-24 17:54:08.057', '2024-12-12 07:00:00', 138, 'MB2991', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 17.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzkr2d000vgqvgumzxp83p', 'TB1158B', 'B', 0.96, 1.37, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:52:51.972', '2025-08-24 17:54:15.382', '2024-12-05 07:00:00', 137, 'MB2991', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.08, 98.00, 'NaOH', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepznrqv0015gqvgq0t6hace', 'TB1160B', 'B', 1.04, 1.56, 'KOH', 90.00, 'ball_mill', 10.00, 'N2', '3', 800.00, 1.00, 41.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:55:12.822', '2025-08-24 17:55:12.822', '2024-12-12 07:00:00', 139, 'MB2991', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', 35.00, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzp96e001agqvgdxptizo4', 'TB1162A', 'A', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:56:22.07', '2025-08-24 17:56:22.07', '2024-12-16 07:00:00', 140, 'MB2991', '{Black/Grey,Shiny}', NULL, true, 4.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzqh0g001fgqvg58z7pw6w', 'TB1162B', 'B', 1.04, 1.25, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 45.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.32, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 17:57:18.875', '2025-08-24 17:57:18.875', '2024-12-16 07:00:00', 141, 'MB2989', '{Black/Grey,Shiny}', NULL, true, 8.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', NULL, '', NULL);
INSERT INTO public.graphene VALUES ('cmepzwabb001pgqvgeq9ot5ep', 'MB3027', 'B', 1.04, 1.25, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.28, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:01:50.134', '2025-08-24 18:01:50.134', '2025-01-15 07:00:00', 143, 'MB3005', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 18.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', NULL, '(2% Water)', NULL);
INSERT INTO public.graphene VALUES ('cmepzuxwg001kgqvgl06xss1r', 'MB3026', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:00:47.391', '2025-08-24 18:02:00.998', '2025-01-15 07:00:00', 142, 'MB3005', '{Black/Grey,Shiny,Voluminous}', NULL, true, 8.30, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(2% Water)', NULL);
INSERT INTO public.graphene VALUES ('cmepzxsy9001ugqvgdpg2lptx', 'MB3028', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.42, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:03:00.94', '2025-08-24 18:03:00.94', '2025-01-15 07:00:00', 144, 'MB2989', '{Black/Grey,Shiny}', NULL, true, 5.10, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', NULL);
INSERT INTO public.graphene VALUES ('cmeq00ge6001zgqvgidw0thmm', 'MB3030', 'A', 1.04, 1.25, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.29, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:05:04.637', '2025-08-24 18:05:04.637', '2025-01-15 07:00:00', 145, 'MB2989', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 16.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', NULL, '', NULL);
INSERT INTO public.graphene VALUES ('cmeq02xjl0024gqvg26v64aca', 'TB1165', 'C', 12.40, 18.50, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 193.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 4.55, '1', 'Rotating oven, powder not compacted', '2025-08-24 18:07:00.177', '2025-08-24 18:15:50.528', '2025-01-15 07:00:00', 146, 'MB2992', '{Black/Grey}', NULL, true, 35.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 5);
INSERT INTO public.graphene VALUES ('cmeq0li8j0001e12u2sfj3c4z', 'TB1166', 'C', 7.80, 9.41, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 210.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 3.25, '1/2 Mix', 'Rotating oven, powder not compacted', '2025-08-24 18:21:26.797', '2025-08-24 18:21:26.797', '2025-01-16 07:00:00', 147, 'MB3006', '{Black/Grey,Shiny}', NULL, true, 65.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(2% Water)', 4);
INSERT INTO public.graphene VALUES ('cmeq0xw1a0006e12ueyg0yytc', 'MB3036', 'B', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.34, '1', 'water added to mill => 7-8% (calc), ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:31:04.551', '2025-08-24 18:31:04.551', '2025-01-26 07:00:00', 148, 'MB2992', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(2% Water)', 1);
INSERT INTO public.graphene VALUES ('cmeq0zrwv000be12us42r9b7g', 'TB1167', 'C', 14.80, 22.30, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 200.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 6.40, 'Mostly 1', 'Rotating oven, powder not compacted', '2025-08-24 18:32:32.526', '2025-08-24 18:32:32.526', '2025-01-26 07:00:00', 149, 'MB2994', '{Black/Grey,Shiny}', NULL, true, 50.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq12exm000de12uu9uwe83k', 'MB3038', 'B', 1.04, 1.56, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.53, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:34:35.674', '2025-08-24 18:34:35.674', '2025-01-28 07:00:00', 150, 'MB2994', '{Black/Grey,"Barely Shiny"}', NULL, true, 2.40, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq17o7x000ie12ufle13bqn', 'MRa373', 'A', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, 'Mostly 1', 'water added to biochar => 8% (KFT), ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:38:40.983', '2025-08-24 18:38:40.983', '2025-01-28 07:00:00', 151, 'MB2989', '{Black/Grey,Shiny}', NULL, true, 3.50, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq1a7jz000ne12ug8i2yr8j', 'MRa375', 'A', 1.04, 1.56, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 40.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.51, 'Mostly 1', 'water added to mill => 9% (calc), ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:40:39.358', '2025-08-24 18:40:39.358', '2025-02-03 07:00:00', 152, 'MB2996', '{Black/Grey,Shiny}', NULL, true, 3.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 1);
INSERT INTO public.graphene VALUES ('cmeq1c0xx000se12up6ozdhwz', 'MRa376', 'C', 16.70, 25.00, 'KOH', 90.00, 'blender', 1.20, 'N2', '3', 800.00, 1.00, 189.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.60, 'Mostly 1', 'water added to blender => 7-8% (calc), rotating oven, powder not compacted', '2025-08-24 18:42:04.101', '2025-08-24 18:42:04.101', '2025-02-03 07:00:00', 153, 'MB2998', '{Black/Grey,Shiny}', NULL, NULL, 60.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 10);
INSERT INTO public.graphene VALUES ('cmeq1e1om000xe12uxrrf8lbr', 'MB3041', 'B', 1.30, 1.30, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:43:38.374', '2025-08-24 18:43:38.374', '2025-02-03 07:00:00', 154, 'MB2996', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq1ffrp0012e12u6ni6a06w', 'MB3043', 'C', 16.50, 24.72, 'KOH', 90.00, 'blender', 1.20, 'N2', '3', 800.00, 1.00, 285.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.11, 'Mostly 1', 'Rotating oven, powder not compacted', '2025-08-24 18:44:43.279', '2025-08-24 18:44:43.279', '2025-02-03 07:00:00', 155, 'MB3000', '{Black/Grey,"Barely Shiny"}', NULL, true, 70.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq1hl7z0017e12uqp1zcqwu', 'MRa380', 'A', 1.00, 1.00, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.48, '1/2 Mix', 'water added to biochar => 11.5% (KFT), ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:46:23.662', '2025-08-24 18:46:23.662', '2025-02-05 07:00:00', 156, 'MB2996', '{Black/Grey,Shiny}', NULL, true, 5.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 1);
INSERT INTO public.graphene VALUES ('cmeq1k8op001ce12ukemb2mm5', 'MB3046', 'C', 15.60, 24.20, 'KOH', 90.00, 'blender', 1.20, 'N2', '3', 800.00, 1.00, 311.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.05, '', 'KOH not milled, rotating over, powder not compacted', '2025-08-24 18:48:27.384', '2025-08-24 18:48:27.384', '2025-02-06 07:00:00', 157, 'MB3032', '{Black/Grey,Shiny}', NULL, true, 95.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 1);
INSERT INTO public.graphene VALUES ('cmeq1mnvx001he12uby0dq79q', 'MRa385', 'C', 17.80, 26.60, 'KOH', 90.00, 'blender', 0.20, 'N2', '3', 800.00, 1.00, 183.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 8.60, 'Mostly 1/2 Mix', 'Rotating oven, powder not compacted', '2025-08-24 18:50:20.392', '2025-08-24 18:50:20.392', '2025-02-11 07:00:00', 158, 'MRa367', '{Black/Grey,Shiny}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 6);
INSERT INTO public.graphene VALUES ('cmeq1nz6h001me12uv53g5did', 'MRa386', 'A', 2.10, 2.10, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 60.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.65, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 18:51:21.688', '2025-08-24 18:51:21.688', '2025-02-11 07:00:00', 159, 'MRa368', '{Black/Grey,"Barely Shiny"}', NULL, true, 3.70, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq3s9nw001ve12utssxw3vs', 'MRa389A', 'C', 17.20, 25.80, 'KOH', 90.00, 'blender', 0.80, 'N2', '3', 800.00, 1.00, 178.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 8.20, '1', 'water added to blender => 5% (calc), rotating oven, powder not compacted', '2025-08-24 19:50:41.132', '2025-08-24 19:50:41.132', '2025-02-17 07:00:00', 160, NULL, '{Black/Grey,"Barely Shiny"}', NULL, NULL, 70.00, 10.00, '+ Water', 'MB3005/3008/3010', 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 2);
INSERT INTO public.graphene VALUES ('cmeq3tekg0020e12uhbkwtqwn', 'MRa389B', 'C', 16.50, 24.80, 'KOH', 90.00, 'blender', 0.80, 'N2', '3', 800.00, 1.00, 114.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 5.20, '1', 'water added to blender => 5% (calc), rotating oven, powder not compacted', '2025-08-24 19:51:34.143', '2025-08-24 19:51:34.143', '2025-02-17 07:00:00', 161, NULL, '{Black/Grey,"Somewhat Shiny"}', NULL, NULL, 50.00, 10.00, '+ Water', 'MB3005/3008/3010', 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 2);
INSERT INTO public.graphene VALUES ('cmeq3umgx0025e12ubpt6a60i', 'MRa389C', 'C', 15.20, 22.90, 'KOH', 90.00, 'blender', 0.80, 'N2', '3', 800.00, 1.00, 154.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 8.20, '1', 'water added to blender => 5% (calc), rotating oven, powder not compacted', '2025-08-24 19:52:31.041', '2025-08-24 19:52:31.041', '2025-02-18 07:00:00', 162, NULL, '{Black/Grey,"Barely Shiny"}', NULL, NULL, 60.00, 10.00, '+ Water', 'MB3005/3008/3010', 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(+ H20)', 2);
INSERT INTO public.graphene VALUES ('cmeq40888002ae12u0p8066pt', 'MB3050', 'C', 17.80, 17.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 125.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 8.10, 'Mostly 1', 'Rotating oven, powder not compacted', '2025-08-24 19:56:52.514', '2025-08-24 19:58:07.279', '2025-02-18 07:00:00', 163, 'MB3044', '{Black/Grey,Dull}', NULL, true, 40.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq4340e002ke12u80dv38cv', 'MRa394', 'C', 21.40, 21.40, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 148.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.20, 'Mostly 1', 'Rotating oven, powder not compacted', '2025-08-24 19:59:07.021', '2025-09-05 17:26:56.321', '2025-02-24 07:00:00', 165, 'MB3045', '{Black/Grey,Dull}', NULL, false, 40.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq6qt53002ze12uaajcy23d', 'MRa398A', 'C', 25.60, 38.50, 'KOH', 90.00, 'blender', 0.70, 'N2', '3', 800.00, 1.00, 256.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 12.60, '1', 'Rotating over, powder not compacted, powder turned dark during milling', '2025-08-24 21:13:31.902', '2025-09-05 17:27:39.603', '2025-02-28 07:00:00', 168, NULL, '{Black/Grey,Dull}', NULL, false, 100.00, 10.00, '+ Water', 'MB3016/3018/3020', 'Curia - Germany', NULL, NULL, NULL, '', 'Quality acceptable, batch size increase for milling leading to color change (due to excessive heating?; beneficial?), reaction batch size unproblematic and further scale-up possible', '57.2 g biochar (MB3016/3018/3020 combined, KFT 4.6%) milled (Blendtec, 2x45 sec) with 85.8 g KOH, unloaded in glove box -> 140.2 g dark brown powder, color change from light brown to dark brown during milling (consequence of excessive heating?), no further change in appearance during bottling
A: Rotating oven, 800 °C, 1 h, 3 °C/min, 64.1 g powder used, 12.6 g (110 ml) output
B: Rotating oven, 800 °C, 1 h, 3 °C/min, 76.0 g powder used, 14.2 g (90 ml) output', '1:1.5 test with increasing batch sizes', 'Continue scale increase, investigate cause and effect of color change', 'Normal yield (49%, 47%), mostly species 1, lower amount of atypical structures or species 2 compared to earlier experiments without color change', NULL, '', 2);
INSERT INTO public.graphene VALUES ('cmeq6vzuu003ee12ug7sppypk', 'MRa399', 'C', 47.70, 71.50, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 488.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.70, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:17:33.893', '2025-08-24 21:17:33.893', '2025-03-11 06:00:00', 171, NULL, '{Black/Grey,Dull}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 3);
INSERT INTO public.graphene VALUES ('cmeq6xsiq003ie12uhg30e4oo', 'MRa401', 'C', 48.70, 73.10, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 517.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.90, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:18:57.69', '2025-08-24 21:24:02.418', '2025-03-11 06:00:00', 172, 'TB1168', '{Black/Grey,Dull}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 3);
INSERT INTO public.graphene VALUES ('cmeq76ies003oe12u1d2r3xpp', 'MRa402', 'C', 48.80, 73.30, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 500.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.60, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:25:44.499', '2025-08-24 21:25:44.499', '2025-03-11 06:00:00', 173, 'TB1168', '{Black/Grey,Dull}', NULL, false, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq79gyb003te12ukl5lzwo1', 'MRa403', 'C', 44.90, 67.40, 'KOH', 90.00, 'blender', 0.70, 'N2', '3', 800.00, 1.00, 504.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.40, '1', 'Rotating oven, powder not compacted, powder turned dark during milling', '2025-08-24 21:28:02.578', '2025-08-24 21:28:02.578', '2025-03-11 06:00:00', 174, NULL, '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 2);
INSERT INTO public.graphene VALUES ('cmeq7bdnb003ye12ulbbqzxfi', 'MRa404', 'B', 1.30, 1.90, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 37.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.46, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:29:31.6', '2025-08-24 21:29:31.6', '2025-03-13 06:00:00', 175, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, true, 13.60, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq7dcar0043e12uhggdvfgv', 'MRa405', 'A', 1.00, 1.20, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.23, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:31:03.17', '2025-08-24 21:31:03.17', '2025-03-13 06:00:00', 176, 'TB1168', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, true, 14.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 0.31, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq7gxdb004de12ubelu991o', 'MB3057', 'C', 51.90, 77.80, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 547.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 25.20, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:33:50.447', '2025-08-24 21:33:50.447', '2025-03-18 06:00:00', 178, 'TB1168', '{Black/Grey,Dull}', NULL, true, 155.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq7id44004ie12u3458207o', 'MRa406', 'A', 1.30, 1.90, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 48.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.39, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:34:57.502', '2025-08-24 21:35:04.455', '2025-03-18 06:00:00', 179, 'TB1168', '{Black/Grey,Shiny,"Very Voluminous"}', NULL, false, 30.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq7jnd9004ne12umsr0oj9s', 'MRa407', 'B', 1.00, 1.60, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:35:57.452', '2025-08-24 21:35:57.452', '2025-03-18 06:00:00', 180, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, false, 13.10, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1 + H20)', 1);
INSERT INTO public.graphene VALUES ('cmeq7mhwd004se12uv0b5lilh', 'MRa408', 'C', 28.40, 34.00, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 471.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 14.10, '2', 'Rotating oven, powder not compacted', '2025-08-24 21:38:10.332', '2025-09-04 22:59:53.493', '2025-03-18 06:00:00', 181, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, false, 320.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.50, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #1)', 3);
INSERT INTO public.graphene VALUES ('cmeq7xfob005he12u5x4cp57z', 'MRa411B', 'B', 0.90, 1.30, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 33.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.35, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:46:40.658', '2025-09-05 02:06:09.286', '2025-03-24 06:00:00', 187, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, true, 6.40, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Still low consistency, Conditions identical to MRa409A (mostly S1), MRa404 (mostly S2) and MRa406 (S2), no apparent difference between using biochar batches #1 and #2', '3.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (3 min) with 4.5 g KOH –> 6.0 g brown powder, no change in appearance during bottling
A: 800 °C, 1 h, 3 °C/min, 2 x 1.4 g pellets pressed, standard inertion (oven A), 429 mg (12.0 ml) output
B: 800 °C, 1 h, 3 °C/min, 2 x 1.1 g pellets pressed, standard inertion (oven B), 352 mg (6.4 ml) output', 'Side-by-side identical small-scale 1:1.5 tests with pilot plant biochar (batch #2) as investigation in consistency and suitability of material', 'Further investigation of consistency', 'good yield (38/40%), A: Mostly species 2, B: Mix of species 1&2', NULL, '(Pilot Plant #2)', 1);
INSERT INTO public.graphene VALUES ('cmeq881jp005ze12u04qu30sx', 'MB413A', 'A', 1.00, 1.40, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 21.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:54:55.573', '2025-09-05 02:06:49.895', '2025-03-25 06:00:00', 190, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, true, 14.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Outcome different than MRa413, reason unclear: Aging of powder? Different degree of air contact during handling? Start temperature?', 'Milled material from MRa413 used
A: 800 °C, 1 h, 3 °C/min, 2 portions (1.2 g + 1.3 g) pressed to pellets, standard inertion with nitrogen bottle (oven A), 396 mg (2.1 ml) output
B: 800 °C, 1 h, 3 °C/min, 1 portion (1.3 g) pressed to a pellet, standard inertion (oven B), 237 mg (0.9 ml) output', 'Repeat of MRa413 as consistency test', 'Further investigation of consistency', 'good yield (40/46%), A, B: (Mostly) species 1', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq81007005re12uzdj5c778', 'MB3060', 'C', 46.40, 69.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 458.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.60, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:49:26.982', '2025-09-05 20:46:34.605', '2025-04-01 06:00:00', 189, 'TB1168', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (Blendtec, 10 sec) with 0.7 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 120.0 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 116.0 g powder used, 22.6 g (120 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', 'Continue production', 'Normal yield (49%), (mostly) species 1, comparable to previous experiments Conclusion: Standard production batch, no apparent material spillover', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq8cwgv0069e12u8vusyo83', 'MB414A', 'A', 1.00, 1.50, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 13.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.40, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:58:42.265', '2025-08-24 21:58:56.169', '2025-04-01 06:00:00', 192, 'TB1168', '{Black/Grey,Dull}', NULL, true, 2.10, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq8e71n006ee12uwtka89bu', 'MB414B', 'B', 0.50, 0.80, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 9.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.24, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:59:42.635', '2025-08-24 21:59:42.635', '2025-04-01 06:00:00', 193, 'TB1168', '{Black/Grey,Dull}', NULL, true, 0.90, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq8y08l006te12u2gifxcax', 'MB416A', 'A', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 7.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.23, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:15:06.916', '2025-08-24 22:15:06.916', '2025-04-03 06:00:00', 196, NULL, '{Black/Grey,Dull}', NULL, false, 1.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeqa3hoa006ye12uate4uxme', 'MB416B', 'B', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.22, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:47:22.395', '2025-08-24 22:47:22.395', '2025-04-03 06:00:00', 197, NULL, '{Black/Grey,Dull}', NULL, false, 1.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqa61z50073e12ukzgnkzy2', 'MB3063', 'C', 47.80, 71.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 466.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.80, '1', 'Rotating oven, powder not compacted', '2025-08-24 22:49:22.048', '2025-08-24 22:49:22.048', '2025-04-10 06:00:00', 198, 'TB1168', '{Black/Grey,Dull}', NULL, true, 130.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqa7aae0078e12u6dmeblna', 'MB417A', 'A', 0.50, 0.50, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.19, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:50:19.478', '2025-08-24 22:50:19.478', '2025-04-07 06:00:00', 198, NULL, '{Black/Grey,Dull}', NULL, false, 1.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqa8s3u007de12u9yk2q06k', 'MB417B', 'B', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.20, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:51:29.225', '2025-08-24 22:51:29.225', '2025-04-07 06:00:00', 199, NULL, '{Black/Grey,Dull}', NULL, false, 1.70, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqab8u1007ie12uoyz2t6ua', 'MB3064', 'C', 47.20, 70.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 493.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.40, '1', 'Rotating oven, powder not compacted', '2025-08-24 22:53:24.209', '2025-08-24 22:53:24.209', '2025-04-09 06:00:00', 199, 'TB1168', '{Black/Grey,Dull}', NULL, true, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqad5bp007ke12uip90i3ms', 'MB3065', 'C', 49.00, 73.40, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 514.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.30, '1', 'Rotating oven, powder not compacted', '2025-08-24 22:54:52.98', '2025-08-24 22:54:52.98', '2025-04-09 06:00:00', 200, 'TB1170', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqaf4ox007pe12uhmrwjwd1', 'MB418A', 'A', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.17, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:56:25.466', '2025-08-24 22:56:25.466', '2025-04-07 06:00:00', 200, NULL, '{Black/Grey,Dull}', NULL, false, 1.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqake0w007ze12ufizh1sht', 'MB3066', 'C', 49.20, 73.90, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 479.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.80, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:00:30.839', '2025-08-24 23:00:30.839', '2025-04-09 06:00:00', 202, 'TB1170', '{Black/Grey,Dull}', NULL, false, 130.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqam5g50081e12ub3vut6eu', 'MB419A', 'A', 0.40, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.11, '2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 23:01:53.045', '2025-08-24 23:01:53.045', '2025-04-09 06:00:00', 203, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, false, 2.70, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 1);
INSERT INTO public.graphene VALUES ('cmeqan33g0086e12ub3c2k8xt', 'MB419B', 'B', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.12, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 23:02:36.652', '2025-08-24 23:02:36.652', '2025-04-09 06:00:00', 204, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, false, 2.70, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 1);
INSERT INTO public.graphene VALUES ('cmeqap6ih008be12u19btaw55', 'MRa420', 'C', 49.30, 73.90, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 588.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.30, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:04:14.391', '2025-08-24 23:04:14.391', '2025-04-10 06:00:00', 203, 'TB1170', '{Black/Grey,Dull}', NULL, false, 135.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqaqlqr008de12uxl4u7cpi', 'MB421A', 'A', 0.40, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 8.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.10, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 23:05:20.786', '2025-08-24 23:05:20.786', '2025-04-10 06:00:00', 205, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, false, 2.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 1);
INSERT INTO public.graphene VALUES ('cmeqarnvw008ie12uonu2fra3', 'MB421B', 'B', 0.40, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 7.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.11, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 23:06:10.207', '2025-08-24 23:06:10.207', '2025-04-10 06:00:00', 206, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, false, 3.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 1);
INSERT INTO public.graphene VALUES ('cmeqatzfg008ne12ud32swsh8', 'MRa423', 'C', 49.40, 74.10, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 555.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.50, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:07:58.491', '2025-08-24 23:07:58.491', '2025-04-17 06:00:00', 204, 'TB1170', '{Black/Grey,Dull}', NULL, false, 130.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqazz8e008se12ufk85438r', 'MB3067', 'C', 46.60, 70.00, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 468.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.93, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:12:38.166', '2025-08-24 23:12:38.166', '2025-04-17 06:00:00', 205, 'TB1170', '{Black/Grey,Dull}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqaghyl007ue12un1fsp7po', 'MB418B', 'B', 0.50, 0.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 7.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.18, '1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 22:57:29.324', '2025-09-09 23:07:05.937', '2025-04-07 06:00:00', 201, NULL, '{Black/Grey,Dull}', NULL, false, 1.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqb1itz008ue12u0hp2fqba', 'MB3068', 'C', 45.60, 68.40, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 454.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.40, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:13:50.23', '2025-08-24 23:15:24.379', '2025-04-17 06:00:00', 207, 'TB1170', '{Black/Grey,Dull}', NULL, true, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqb7x8x0093e12uyrlkcfku', 'MB307`', 'C', 46.60, 69.90, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 441.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.00, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:18:48.848', '2025-08-24 23:18:48.848', '2025-04-24 06:00:00', 210, 'TB1170', '{Black/Grey,Dull}', NULL, true, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbp9a6009se12u4grl0o7t', 'MB3076', 'C', 47.90, 71.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 459.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 20.10, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:32:17.597', '2025-08-24 23:32:17.597', '2025-05-12 06:00:00', 216, 'TB1173', '{Black/Grey,Dull}', NULL, true, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbocyk009ne12u6ji33cpf', 'MB3074', 'C', 47.70, 71.50, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 471.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 20.50, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:31:35.699', '2025-08-24 23:32:34.293', '2025-05-12 06:00:00', 215, 'TB1173', '{Black/Grey,Dull}', NULL, true, 130.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbutjm009ue12u7915yuib', 'MRa427', 'C', 48.90, 73.30, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 562.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.30, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:36:37.13', '2025-08-24 23:36:37.13', '2025-05-13 06:00:00', 217, 'TB1173', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbvmj5009ze12ults5wefz', 'MRa428', 'C', 48.80, 73.10, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 562.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.00, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:37:14.703', '2025-08-24 23:37:14.703', '2025-05-13 06:00:00', 218, 'TB1173', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbyi0900a1e12urcdim3fr', 'MB3078', 'C', 28.00, 33.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 354.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 11.40, '1/2 Mix', 'Rotating oven, powder not compacted', '2025-08-24 23:39:28.809', '2025-08-24 23:39:28.809', '2025-05-19 06:00:00', 219, 'TB1173', '{Black/Grey,"Somewhat Shiny"}', NULL, true, 170.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.40, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #3)', 3);
INSERT INTO public.graphene VALUES ('cmeqbzmej00a6e12uh3g0noaz', 'MB3079', 'C', 28.40, 31.40, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 327.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 12.00, '1/2 Mix', 'Rotating oven, powder not compacted', '2025-08-24 23:40:21.163', '2025-08-24 23:40:21.163', '2025-05-19 06:00:00', 220, 'TB1173', '{Black/Grey,"Somewhat Shiny"}', NULL, true, 175.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.52, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #3)', 3);
INSERT INTO public.graphene VALUES ('cmeqc1ci000abe12u645l642p', 'MRa429', 'C', 29.20, 35.00, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 475.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 12.80, '1/2 Mix', 'Rotating oven, powder not compacted', '2025-08-24 23:41:41.632', '2025-08-24 23:41:41.632', '2025-05-19 06:00:00', 221, 'TB1173', '{Black/Grey,"Somewhat Shiny"}', NULL, false, 200.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.70, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #3)', 3);
INSERT INTO public.graphene VALUES ('cmeqcjytn00b1e12ur5oudoci', 'MRa437', 'C', 22.30, 26.70, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 284.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 10.50, 'Mostly 2', 'Rotating oven, powder not compacted', '2025-08-24 23:56:10.366', '2025-08-24 23:56:10.366', '2025-06-10 06:00:00', 228, 'TB1170', '{Black/Grey,Voluminous,"Somewhat Shiny"}', NULL, true, 170.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 6.68, 98.00, 'NaOH', '', '', '', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqca1ef00ape12uze8g51o2', 'MRa433', 'C', 48.80, 73.20, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 502.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.70, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:48:27.158', '2025-09-05 02:31:03.656', '2025-05-27 06:00:00', 225, 'TB1173', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Standard output of species 1 process', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then
milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.4 g light brown
powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 122.0 g powder used, 21.7 g (120 ml) output', 'Species 1 production at 50 g batch size', 'None', 'Slightly reduced yield (44%), volume and appearance similar to previous species 1
experiments, REM result too (combined sample MRa430/MRa431/MRa432/MRa433)', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqcfxzy00awe12uf6ocu671', 'MRa436', 'C', 25.50, 30.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 326.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 12.50, 'Mostly 2', 'Rotating oven, powder not compacted', '2025-08-24 23:53:02.678', '2025-09-05 02:31:36.31', '2025-06-02 06:00:00', 227, 'TB1168', '{Black/Grey,Voluminous,"Somewhat Shiny"}', NULL, true, 270.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 7.64, 98.00, 'NaOH', 'Standard output of species 2 process', '26.3 g biochar (batch MB3059, KFT 1.9%) milled (Blendtec, 3x30 sec) with 7.9 g NaOH and
31.6 g KOH, unloaded in glove box -> 64.1 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 63.7 g powder used, 12.5 g (270 ml) output', 'Species 2 production at ~30 g batch size', 'None', 'Good yield (48%), volume and appearance similar to previous species 2 experiments,
REM result too.', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqb72em0091e12u0hukynzq', 'MB3070', 'C', 48.00, 72.00, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 478.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.50, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:18:08.867', '2025-09-05 20:28:15.248', '2025-04-24 06:00:00', 209, 'TB1170', '{Black/Grey,Dull}', NULL, true, 140.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (Blendtec, 10 sec) with 0.4 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 120.4 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 120.0 g powder used, 22.5 g (140 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Normal yield (47%), Species 1 (combined sample MB3069/MB3070/MB3071)', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbdtjv009ce12urxx5omxc', 'MB3073', 'C', 47.80, 71.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 461.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 20.60, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:23:23.989', '2025-09-05 20:39:30.653', '2025-05-02 06:00:00', 213, 'TB1173', '{Black/Grey,Dull}', NULL, true, 105.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 119.9 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 119.6 g powder used, 20.6 g (110 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Slightly reduced yield (43%), Species 1', NULL, '(Pilot Plant #3)', 3);
INSERT INTO public.graphene VALUES ('cmeqcq9s900bbe12upzeqzv7s', 'MB3081', 'C', 20.00, 24.00, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 245.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 6.90, '', 'Rotating oven, powder not compacted', '2025-08-25 00:01:04.52', '2025-08-25 00:01:04.52', '2025-06-17 06:00:00', 230, 'MB3047', '{Black/Grey,"Somewhat Shiny"}', NULL, true, 70.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 6.00, 98.00, 'NaOH', '', '', '', '', '', NULL, '(+ H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqcswy900bge12u1b4juu4i', 'MB3082', 'C', 47.70, 71.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 452.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.00, '', 'Rotating oven, powder not compacted', '2025-08-25 00:03:07.849', '2025-08-25 00:03:07.849', '2025-06-16 06:00:00', 231, 'TB1173', '{Black/Grey,Dull}', NULL, true, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqcy1jq00bse12u4g7934n4', 'MRa440', 'C', 48.80, 73.90, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 468.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.30, '1', 'Rotating oven, powder not compacted', '2025-08-25 00:07:07.093', '2025-08-25 00:07:07.093', '2025-06-17 06:00:00', 233, NULL, '{Black/Grey,Dull}', NULL, false, 130.00, 10.00, '+ Water', 'MB3037/3039/3042', 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 3);
INSERT INTO public.graphene VALUES ('cmeqcvcik00ble12upxc48um0', 'MRa439', 'C', 49.30, 73.90, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 484.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 24.60, '1', 'Rotating oven, powder not compacted', '2025-08-25 00:05:01.339', '2025-08-25 00:07:20.351', '2025-06-17 06:00:00', 232, NULL, '{Black/Grey,Dull}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 3);
INSERT INTO public.graphene VALUES ('cmeqd00f600bxe12uyoz7fkqh', 'MRa445', 'C', 30.10, 45.20, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 327.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 14.20, '1', 'Rotating oven, powder not compacted', '2025-08-25 00:08:38.937', '2025-08-25 00:11:00.687', '2025-07-08 06:00:00', 234, NULL, '{Black/Grey,Dull}', NULL, false, 85.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '', 3);
INSERT INTO public.graphene VALUES ('cmehgk5mu0001r3l2euavns2l', 'TB1133', 'A', 1.00, 1.00, 'KOH', 90.00, 'mill', 1.00, 'Ar', '3', 785.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.30, '', 'ground biochar: brown powder; see temp trend. ', '2025-08-18 18:38:22.085', '2025-08-25 00:15:31.26', '2024-05-27 06:00:00', 3, NULL, '{}', NULL, NULL, NULL, 10.00, '+ Water', 'MRa231', 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1clg0000s8g16xtwv6dt1', 'MB2963B', 'A', 0.29, 0.22, 'KOH', 90.00, 'mill', 1.00, 'N2', '3', 800.00, 2.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.12, '', 'Ground biochar: brown powder; see temp trend', '2025-08-19 21:08:07.44', '2025-08-25 00:28:13.327', '2024-07-12 06:00:00', 22, 'MB2960', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmej1lj6z00168g16996f7oo4', 'MB2966A', 'B', 0.26, 1.04, 'KOH', 90.00, 'mill', 2.50, 'N2', '3', 800.00, 1.00, 20.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.05, '', 'ground biochar: brown powder; see temp trend', '2025-08-19 21:15:04.426', '2025-08-25 00:31:26.616', '2024-07-30 06:00:00', 29, 'MB2959', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeqcmdck00b6e12u3pvfwce4', 'MB3080', 'C', 24.80, 29.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 306.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 11.90, 'Mostly 2', 'Rotating oven, powder not compacted', '2025-08-24 23:58:02.515', '2025-08-25 21:21:23.186', '2025-06-10 06:00:00', 229, NULL, '{Black/Grey,"Somewhat Shiny"}', NULL, true, 201.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 7.45, 98.00, 'NaOH', 'Biochar unsuitable due to having only reached 160 °C in step 1', '20.8 g biochar (Batch MB3047, KFT 2.0%) milled (Blendtec, 3x30 sec) with 6.2 g NaOH and
25.0 g KOH, unloaded in glove box -> 50.4 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 50.0 g powder used, 6.9 g (70 ml) output', 'Species 2 production at ~30 g batch size', 'Disregard biochar of same quality for production', 'Ok yield (45%), volume and appearance more similar to species 1 experiments, SEM
shows atypical structure (compact chunks with very large pores, some sheet-like fragments
and surfaces).', NULL, '(+ H20)', 3);
INSERT INTO public.graphene VALUES ('cmej28f7l002o8g16zknhj2gw', 'KJo-0166B', 'B', 0.24, 0.36, 'KOH', 90.00, 'mill', 20.00, 'N2', '3', 800.00, 1.00, 11.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.11, '', 'ground biochar: brown powder', '2025-08-19 21:32:52.353', '2025-08-26 19:01:31.352', '2024-09-03 06:00:00', 55, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3pz1z002q8g16ojhsqi44', 'KJo-0167A', 'A', 0.24, 0.36, 'KOH', 90.00, 'mill', 10.00, 'N2', '3', 800.00, 4.00, 10.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.10, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:02:17.01', '2025-08-26 19:02:56.586', '2024-09-03 06:00:00', 56, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek42jbz003a8g169jlntz1j', 'KJo-0175', 'A', 1.60, 2.40, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 61.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.71, '', 'ground biochar: (brown powder) compacted to two pellets of equal size, quartz tube shattered', '2025-08-20 15:12:03.166', '2025-08-29 19:14:27.333', '2024-09-16 06:00:00', 66, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmek3xvxa00328g1672z3f5fx', 'KJo-0171A', 'B', 1.60, 2.40, 'KOH', 90.00, 'mill', 5.00, 'N2', '3', 800.00, 1.00, 60.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.64, '', 'ground biochar: (brown powder) compacted to pellet', '2025-08-20 15:08:26.199', '2025-08-29 19:15:57.45', '2024-09-16 06:00:00', 62, 'MB2978', '{}', NULL, NULL, NULL, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.graphene VALUES ('cmeq7ftn60048e12up1jq4u2h', 'MB3056', 'C', 55.00, 82.60, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 600.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 26.50, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:32:58.961', '2025-09-04 02:21:18.189', '2025-03-18 06:00:00', 177, 'TB1168', '{Black/Grey,Dull}', NULL, true, 145.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '', '', '', '', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq7o5g8004xe12uhtnelks3', 'MB3058', 'C', 51.10, 76.70, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 548.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 24.40, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:39:27.512', '2025-09-05 02:03:09.536', '2025-03-24 06:00:00', 182, 'TB1168', '{Black/Grey,Dull}', NULL, true, 135.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '55.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (Blendtec, 10 sec) with 0.8 g water, then milled (Blendtec, 3x30 sec) with 82.5 g KOH, unloaded in glove box -> 131.3 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 127.8 g powder used, 24.4 g (135 ml) output', 'Material production at 1:1.5 ratio and 55 g batch size', 'Continue production', 'Normal yield (48%), (mostly) species 1, comparable to previous experiments Conclusion: Standard production batch, no apparent material spillover', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq7u74z0056e12u18d35iiz', 'MRa410', 'C', 48.40, 72.70, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 502.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 24.00, '1', 'Rotating oven, powder not compacted', '2025-08-24 21:44:09.634', '2025-09-05 02:03:41.892', '2025-03-25 06:00:00', 185, 'TB1168', '{Black/Grey,Dull}', NULL, true, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.1 g biochar (pilot plant batch #1, KFT 3.6%) milled (Blendtec, 10 sec) with 0.7 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.4 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 121.1 g powder used, 24.0 g (110 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', 'Continue production', 'Normal yield (50%), (mostly) species 1, comparable to previous experiments Conclusion: Standard production batch, no apparent material spillover', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmf36x2dn00294agdiegee97p', 'MB3071', 'C', 46.60, 69.90, 'KOH', 90.00, 'blender', 0.50, 'N2', '3', 800.00, 1.00, 441.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.00, '1', 'Rotating oven, powder not compacted', '2025-09-02 23:39:24.098', '2025-09-05 20:37:55.981', '2025-04-24 06:00:00', NULL, 'TB1170', '{Dull,Black/Grey}', NULL, true, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (Blendtec, 10 sec) with 0.4 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 116.9 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 116.5 g powder used, 22.0 g (110 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Normal yield (47%), Species 1 (combined sample MB3069/MB3070/MB3071)', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq7zsh6005me12u0ker7an9', 'MRa412', 'C', 49.20, 73.70, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 553.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.90, '1', 'ground biochar (brown powder) NOT compacted', '2025-08-24 21:48:30.569', '2025-09-05 02:04:01.083', '2025-03-25 06:00:00', 188, 'TB1168', '{Black/Grey,Dull}', NULL, false, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (Blendtec, 10 sec) with 0.7 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 123.2 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 122.9 g powder used, 23.9 g (110 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', 'Continue production', 'Normal yield (49%), (mostly) species 1, comparable to previous experiments Conclusion: Standard production batch, no apparent material spillover', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq8q9ou006je12uha8vxh44', 'MB3062', 'C', 26.80, 32.20, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 357.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 13.70, '2', 'Rotating oven, powder not compacted', '2025-08-24 22:09:05.928', '2025-09-05 02:04:33.477', '2025-04-02 06:00:00', 194, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, false, 260.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.00, 98.00, 'NaOH', '', '', 'Test at 1:1.5 ratio (20% NaOH) and 30 g batch size, extra-dried biochar Experiment details
30.0 g biochar (pilot plant batch #1, dried in lab to 1.4% moisture) milled (Blendtec, 3x30 sec) with 36.0 g KOH and 9.0 g NaOH, unloaded in glove box -> 67.5 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 67.0 g powder used, 13.7 g (260 ml) output
 temperature ramp slightly different due to defective thermoelement', '', 'Normal yield (51%), (mostly) species 2, comparable to previous experiment MRa408 Conclusion: No significant effect of extra drying, no apparent material spillover Recommended action: None', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq8vzer006oe12uugl6w7au', 'MRa415', 'C', 28.80, 34.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 431.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 14.40, '2', 'Rotating oven, powder not compacted', '2025-08-24 22:13:32.546', '2025-09-05 02:05:28.373', '2025-04-03 06:00:00', 195, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, false, 260.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 8.70, 98.00, 'NaOH', '', '', 'Test at 1:1.5 ratio (20% NaOH) and 30 g batch size, repeat of MRa408 Experiment details
30.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (Blendtec, 3x30 sec) with 36.0 g KOH and 9.0 g NaOH, unloaded in glove box -> 72.3 g light brown powder, no color change Rotating oven, 800 °C, 1 h, 3 °C/min, 72.1 g powder used, 14.4 g (260 ml) output
 temperature ramp slightly different due to defective thermoelement', 'None', 'Normal yield (50%), (mostly) species 2, comparable to previous experiment MRa408 Conclusion: MRa408 result reproduced, no apparent material spillover', NULL, '(Pilot Plant #1)', 3);
INSERT INTO public.graphene VALUES ('cmeq7qljn0052e12ug7gmd8av', 'MRa409A', 'B', 1.10, 1.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 42.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.44, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:41:21.672', '2025-09-05 02:05:44.761', '2025-03-24 06:00:00', 183, 'TB1168', '{Black/Grey,Shiny}', NULL, true, 2.80, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Still low consistency, Conditions of MRa409A (mostly S1) identical to MRa404 (mostly S2) and MRa406 (S2), no apparent consequence of lack of pellet pressing in B Recommended action: Further investigation', '3.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (3 min) with 4.5 g KOH –> 6.0 g brown powder, no change in appearance during bottling
A: 800 °C, 1 h, 3 °C/min, 2 x 1.4 g pellets pressed, standard inertion (oven B), 443 mg (2.8 ml) output
B: 800 °C, 1 h, 3 °C/min, 2.1 g powder used, standard inertion (oven A), 354 mg (8.2 ml) output Result: good yield (40/42%), A: Mostly species 1, B: Mix of species 1&2', 'Side-by-side (pressed/unpressed) small-scale 1:1.5 tests with pilot plant biochar as investigation in consistency', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq7rlnx0054e12uhisj1tnv', 'MRa409B', 'A', 1.30, 1.30, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 32.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.35, '1/2 Mix', 'ground biochar (brown powder) NOT compacted', '2025-08-24 21:42:08.491', '2025-09-05 02:05:52.487', '2025-03-24 06:00:00', 184, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, true, 8.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Still low consistency, Conditions of MRa409A (mostly S1) identical to MRa404 (mostly S2) and MRa406 (S2), no apparent consequence of lack of pellet pressing in B Recommended action: Further investigation', '3.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (3 min) with 4.5 g KOH –> 6.0 g brown powder, no change in appearance during bottling
A: 800 °C, 1 h, 3 °C/min, 2 x 1.4 g pellets pressed, standard inertion (oven B), 443 mg (2.8 ml) output
B: 800 °C, 1 h, 3 °C/min, 2.1 g powder used, standard inertion (oven A), 354 mg (8.2 ml) output Result: good yield (40/42%), A: Mostly species 1, B: Mix of species 1&2', 'Side-by-side (pressed/unpressed) small-scale 1:1.5 tests with pilot plant biochar as investigation in consistency', '', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeq7vtl6005be12uegs2q0wp', 'MRa411A', 'A', 1.10, 1.70, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 42.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.43, 'Mostly 2', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:45:25.385', '2025-09-05 02:06:20.581', '2025-03-24 06:00:00', 186, 'TB1170', '{Black/Grey,Shiny,Voluminous}', NULL, true, 12.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Still low consistency, Conditions identical to MRa409A (mostly S1), MRa404 (mostly S2) and MRa406 (S2), no apparent difference between using biochar batches #1 and #2', '3.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (3 min) with 4.5 g KOH –> 6.0 g brown powder, no change in appearance during bottling
A: 800 °C, 1 h, 3 °C/min, 2 x 1.4 g pellets pressed, standard inertion (oven A), 429 mg (12.0 ml) output
B: 800 °C, 1 h, 3 °C/min, 2 x 1.1 g pellets pressed, standard inertion (oven B), 352 mg (6.4 ml) output', 'Side-by-side identical small-scale 1:1.5 tests with pilot plant biochar (batch #2) as investigation in consistency and suitability of material', 'Further investigation of consistency', 'good yield (38/40%), A: Mostly species 2, B: Mix of species 1&2', NULL, '(Pilot Plant #2)', 1);
INSERT INTO public.graphene VALUES ('cmeq89dge0064e12uvpqe66n7', 'MB413B', 'B', 1.00, 1.40, 'KOH', 90.00, 'mill', 3.00, 'N2', '3', 800.00, 1.00, 21.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.41, '1/2 Mix', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 21:55:57.662', '2025-09-05 02:06:36.963', '2025-03-26 06:00:00', 191, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, true, 7.20, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '4.0 g biochar (pilot plant batch #1, KFT 3.6%) milled (3 min) in glovebox with 6.0 g KOH –> 5x 1.2 g + 2x 1.3 g portions of brown powder, no change in appearance during bottling in glovebox A: 800 °C, 1 h, 3 °C/min, 2 portions (2 x 1.2 g) pressed to pellets, standard inertion with nitrogen bottle (oven A), 398 mg (14.2 ml) output
B: 800 °C, 1 h, 3 °C/min, 2 portions (2 x 1.2 g) pressed to pellets, standard inertion (oven B), 412 mg (7.2 ml) output
- Curia confidential - Page 3 of 27
Result: good yield (41/43%), A, B: Mix of species 1&2 (but different ratio, more species 1 in B) Conclusion: Still low consistency, no clear consequence of milling, weighing and bottling in the glovebox', 'Start of a series of side-by-side identical small-scale 1:1.5 tests with pilot plant biochar (batch #1) as investigation in consistency and suitability of material', 'Further investigation of consistency', '', NULL, '(Pilot Plant #1)', 1);
INSERT INTO public.graphene VALUES ('cmeqc37jv00age12uc8t3my3i', 'MRa430', 'C', 48.80, 73.20, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 528.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 20.90, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:43:08.538', '2025-09-05 02:30:10.776', '2025-05-27 06:00:00', 222, 'TB1173', '{Black/Grey,Dull}', NULL, false, 125.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Standard output of species 1 proc', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then
milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.4 g light brown
powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 122.0 g powder used, 20.9 g (125 ml) output', 'Species 1 production at 50 g batch size', '', 'Slightly reduced yield (43%), volume and appearance similar to previous species 1
experiments, REM result too (combined sample MRa430/MRa431/MRa432/MRa433)', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqc67pg00ale12upe9bg8ns', 'MRa431', 'C', 49.00, 73.60, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 527.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 20.90, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:45:28.707', '2025-09-05 02:30:25.077', '2025-05-27 06:00:00', 223, 'TB1173', '{Black/Grey,Dull}', NULL, false, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Standard output of species 1 process', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then
milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.9 g light brown
powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 122.6 g powder used, 20.9 g (110 ml) output', 'Species 1 production at 50 g batch size', 'Continue production', 'Slightly reduced yield (43%), volume and appearance similar to previous species 1
experiments, REM result too (combined sample MRa430/MRa431/MRa432/MRa433)', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqc7b0e00ane12uwztkz37d', 'MRa432', 'C', 48.80, 73.30, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 534.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.80, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:46:19.646', '2025-09-05 02:30:54.274', '2025-05-27 06:00:00', 224, 'TB1173', '{Black/Grey,Dull}', NULL, false, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Standard output of species 1 process', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then
milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.4 g light brown
powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 122.1 g powder used, 21.8 g (110 ml) output', 'Species 1 production at 50 g batch size', 'Continue production', 'Slightly reduced yield (45%), volume and appearance similar to previous species 1
experiments, REM result too (combined sample MRa430/MRa431/MRa432/MRa433)', NULL, '(Pilot Plant #3 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqccqrc00are12uxjkqakes', 'MRa435', 'C', 25.70, 30.80, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 341.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 11.80, '2', 'Rotating oven, powder not compacted', '2025-08-24 23:50:33.335', '2025-09-05 02:31:20.184', '2025-06-02 06:00:00', 226, 'TB1168', '{Black/Grey,Shiny,Voluminous}', NULL, true, 240.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, 7.70, 98.00, 'NaOH', 'Standard output of species 2 process', '26.5 g biochar (batch MB3059, KFT 1.9%) milled (Blendtec, 3x30 sec) with 8.0 g NaOH and
31.8 g KOH, unloaded in glove box -> 64.5 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 64.2 g powder used, 11.8 g (240 ml) output', 'Species 2 production at ~30 g batch size', 'None', 'Good yield (45%), volume and appearance similar to previous species 2 experiments,
REM result too.', NULL, '(Pilot Plant #1 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeq41oy4002fe12u1h7847bk', 'MB3051', 'C', 16.30, 24.50, 'KOH', 90.00, 'blender', 0.70, 'N2', '3', 800.00, 1.00, 269.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.20, 'Mostly 1', 'Rotating oven, powder not compacted', '2025-08-24 19:58:00.844', '2025-09-05 17:26:33.458', '2025-02-24 07:00:00', 164, 'MB3040', '{Black/Grey,"Somewhat Shiny"}', NULL, true, 90.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'No apparent benefit of longer milling', '18.3 g biochar (MB3040, KFT 4.3%) milled (Blendtec, 4x45 sec, active cooling between milling intervals) with 27.5 g KOH, unloaded in glove box -> 41.5 g brown powder, no change in appearance during bottling
Rotating oven, 800 °C, 1 h, 3 °C/min, 40.8 g powder used, 7.2 g (90 ml) output', 'Test longer milling (4x45 sec)', 'Use standard 90 sec milling time for further experiments', 'Typical yield, mostly species 1', NULL, '', 4);
INSERT INTO public.graphene VALUES ('cmeq4512f002pe12um387u7dh', 'MB3054', 'C', 16.00, 16.00, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 124.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 7.51, '', 'Rotating oven, powder not compacted', '2025-08-24 20:00:36.519', '2025-09-05 17:27:16.481', '2025-02-24 07:00:00', 166, 'MB3034', '{Black/Grey,Dull}', NULL, false, 70.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Conditions not suitable for production,', '19.6 g biochar (MB3034, KFT 2.0%) milled (Blendtec, 90 sec) with 19.6 g KOH, unloaded in glove box -> 36.1 g brown powder, no change in appearance during bottling
Rotating oven, 800 °C, 1 h, 3 °C/min, 32.0 g powder used, 7.5 g (70 ml) output', '1:1 test with 2% wet biochar', 'Focus on 1:1.5 experiments', 'Normal yield (47%), species 1 + atypical structures, material unusually voluminous (9 ml/g)', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeq6rvh90034e12ug9zegyde', 'MRa398B', 'C', 30.40, 45.60, 'KOH', 90.00, 'blender', 0.70, 'N2', '3', 800.00, 1.00, 303.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 14.20, '1', 'Rotating over, powder not compacted, powder turned dark during milling', '2025-08-24 21:14:21.597', '2025-09-05 17:27:33.087', '2025-02-28 07:00:00', 169, NULL, '{Black/Grey,Dull}', NULL, false, 90.00, 10.00, '+ Water', 'MB3016/3018/3020', 'Curia - Germany', NULL, NULL, NULL, '', 'Quality acceptable, batch size increase for milling leading to color change (due to excessive heating?; beneficial?), reaction batch size unproblematic and further scale-up possible', '57.2 g biochar (MB3016/3018/3020 combined, KFT 4.6%) milled (Blendtec, 2x45 sec) with 85.8 g KOH, unloaded in glove box -> 140.2 g dark brown powder, color change from light brown to dark brown during milling (consequence of excessive heating?), no further change in appearance during bottling
A: Rotating oven, 800 °C, 1 h, 3 °C/min, 64.1 g powder used, 12.6 g (110 ml) output
B: Rotating oven, 800 °C, 1 h, 3 °C/min, 76.0 g powder used, 14.2 g (90 ml) output', '1:1.5 test with increasing batch sizes', 'Continue scale increase, investigate cause and effect of color change', 'Normal yield (49%, 47%), mostly species 1, lower amount of atypical structures or species 2 compared to earlier experiments without color change', NULL, '', 2);
INSERT INTO public.graphene VALUES ('cmeq6uihd0039e12uuyczihw9', 'MB3055', 'C', 40.60, 45.60, 'KOH', 90.00, 'blender', 0.70, 'N2', '3', 800.00, 1.00, 573.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.70, '1', 'Rotating over, powder not compacted, powder turned dark during milling', '2025-08-24 21:16:24.72', '2025-09-05 17:28:01.156', '2025-03-04 07:00:00', 170, NULL, '{Black/Grey,Dull}', NULL, false, 105.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Quality acceptable, batch size increase for milling leading to color change (due to excessive heating?; beneficial?), reaction batch size unproblematic and further scale-up possible', '87.2 g biochar (various combined lab batches, KFT 4.7%) milled (Blendtec, 2x45 sec) with 130.8 g KOH, unloaded in glove box -> 214.2 g dark brown powder, color change from light brown to dark brown during milling (consequence of excessive heating?), no further change in appearance during bottling
Rotating oven, 800 °C, 1 h, 3 °C/min, 101.6 g powder used, 19.4 g (105 ml) output', '1:1.5 test with increasing batch sizes', 'Continue scale increase, investigate cause and effect of color change', 'Normal yield (48%), mostly species 1, lower amount of atypical structures or species 2 compared to earlier experiments without color change', NULL, '', 2);
INSERT INTO public.graphene VALUES ('cmeq46dhn002ue12u6agtpzsx', 'MRa395', 'A', 1.30, 1.30, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 39.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 0.60, 'Mostly 1', 'ground biochar (brown powder) compacted to two pellets of equal size', '2025-08-24 20:01:39.274', '2025-09-05 17:28:15.719', '2025-02-24 07:00:00', 167, 'MB3034', '{Black/Grey,Dull}', NULL, false, 3.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', 'Conditions not suitable for production, poor performance due to poor milling or low moisture content of biochar', '19.6 g biochar (MB3034, KFT 2.0%) milled (Blendtec, 90 sec) with 19.6 g KOH, unloaded in glove box -> 36.1 g brown powder, no change in appearance during bottling
800 °C, 1 h, 3 °C/min, 2 x 1.3 g pellets pressed, standard inertion (oven A), 601 mg (3.0 ml) output', '1:1 test with 2% wet biochar as comparison to MB3054', 'Focus on 1:1.5 experiments', 'Normal yield (46%), higher degree of species 1 (compared to MB3054), product inhomogeneous, uneven pore size distribution, compact', NULL, '', 1);
INSERT INTO public.graphene VALUES ('cmeqb675a008we12upw9g3onl', 'MB3069', 'C', 47.60, 71.40, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 479.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.40, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:17:28.366', '2025-09-05 17:30:51.724', '2025-04-24 06:00:00', 208, 'TB1170', '{Black/Grey,Dull}', NULL, true, 130.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (Blendtec, 10 sec) with 0.4 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 119.4 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 119.0 g powder used, 22.4 g (130 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Normal yield (47%), Species 1 (combined sample MB3069/MB3070/MB3071)', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbac2s0095e12usyqghonm', 'MB3072', 'C', 47.70, 69.90, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 457.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 22.60, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:20:41.379', '2025-09-05 20:38:25.963', '2025-05-02 06:00:00', 211, 'TB1170', '{Black/Grey,Dull}', NULL, true, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (Blendtec, 10 sec) with 0.4 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 119.8 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 119.2 g powder used, 22.6 g (110 ml) output
- Curia confidential - Page 1 of 28
 temperature ramp slightly different due to defective thermoelement Result: Normal yield (47%), Species 1 (combined sample MB3072/MRa425)', 'Material production at 1:1.5 ratio and 50 g batch size', '', '', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbbbmw009ae12u5lyorl2c', 'MRa425', 'C', 48.60, 72.90, 'KOH', 90.00, 'blender', 1.50, 'N2', '3', 800.00, 1.00, 567.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 23.30, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:21:27.464', '2025-09-05 20:39:08.381', '2025-05-02 06:00:00', 212, 'TB1170', '{Black/Grey,Dull}', NULL, true, 110.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #2, KFT 4.3%) milled (Blendtec, 10 sec) with 0.4 g water, then milled (Blendtec, 3x30 sec) with 75.0 g KOH, unloaded in glove box -> 122.4 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 121.5 g powder used, 23.3 g (110 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Normal yield (48%), Species 1 (combined sample MB3072/MRa425)', NULL, '(Pilot Plant #2 + H20)', 3);
INSERT INTO public.graphene VALUES ('cmeqbh53z009ie12u6t20fpqh', 'MRa426', 'C', 48.60, 72.80, 'KOH', 90.00, 'blender', 0.10, 'N2', '3', 800.00, 1.00, 574.00, 'HCl', 100.00, 'N2 stream', 'atm. Pressure', 21.30, '1', 'Rotating oven, powder not compacted', '2025-08-24 23:25:58.942', '2025-09-05 20:39:45.517', '2025-05-05 06:00:00', 214, 'TB1173', '{Black/Grey,Dull}', NULL, false, 120.00, 10.00, '+ Water', NULL, 'Curia - Germany', NULL, NULL, NULL, '', '', '50.0 g biochar (pilot plant batch #3, KFT 4.9%) milled (Blendtec, 10 sec) with 0.1 g water, then milled (Blendtec, 30 sec + 12x5 sec – blender defective) with 75.0 g KOH, unloaded in glove box -> 122.1 g light brown powder, no color change
Rotating oven, 800 °C, 1 h, 3 °C/min, 121.4 g powder used, 21.3 g (120 ml) output
 temperature ramp slightly different due to defective thermoelement', 'Material production at 1:1.5 ratio and 50 g batch size', '', 'Slightly reduced yield (44%), Species 1', NULL, '(Pilot Plant #3 + H20)', 18);
INSERT INTO public.graphene VALUES ('cmfj4npqv00058ucpoqligv1i', 'TEST', 'A', 2.00, 234.00, 'KOH', 23.00, 'mill', 3.00, 'N2', '123', 123.00, 123.00, 123.00, 'HCl', 123.00, 'N2 stream', 'atm. Pressure', 123.00, '2', 'ground biochar (brown powder) NOT compacted', '2025-09-14 03:20:27.414', '2025-09-14 04:24:12.407', NULL, NULL, 'MB2928', '{"Very Voluminous"}', NULL, true, 123.00, 123.00, '+ Water', NULL, 'Curia - Germany', NULL, 123.00, 123.00, 'NaOH', NULL, NULL, NULL, NULL, NULL, NULL, '', 1);


--
-- Data for Name: graphene_compound_batches; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000022t2uhxd0fdb', 'cmeq1ffrp0012e12u6ni6a06w', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000122t2c433ls4r', 'cmeq41oy4002fe12u1h7847bk', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000222t2b54r28vj', 'cmeq6uihd0039e12uuyczihw9', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0001bv3qv46a06tu', 'cmeqcswy900bge12u1b4juu4i', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0002bv3qb96lpkjq', 'cmeqc37jv00age12uc8t3my3i', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0003bv3qjcyy7gp9', 'cmeqc67pg00ale12upe9bg8ns', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0004bv3qgo6qjqfj', 'cmeqc7b0e00ane12uwztkz37d', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0005bv3qh1zbmqm0', 'cmeqca1ef00ape12uze8g51o2', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0006bv3qi06d033o', 'cmeqcvcik00ble12upxc48um0', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew211ed0007bv3qpi7pip0d', 'cmeqcy1jq00bse12u4g7934n4', 'cmew211ea0000bv3qdynebuuw', '2025-08-28 23:48:08.149');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000bbv3qyxtz2swj', 'cmeq8q9ou006je12uha8vxh44', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000cbv3qeanvfze7', 'cmeqcmdck00b6e12u3pvfwce4', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000dbv3qa3kqrqhh', 'cmeq7mhwd004se12uv0b5lilh', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000ebv3qc8tpudu6', 'cmeq8vzer006oe12uugl6w7au', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000fbv3q4919jdbc', 'cmeqccqrc00are12uxjkqakes', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000gbv3q5tr85f2b', 'cmeqcfxzy00awe12uf6ocu671', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmew2p4hl000hbv3q1iepl33t', 'cmeqcjytn00b1e12ur5oudoci', 'cmew2p4hf000abv3qwax6okzd', '2025-08-29 00:06:51.898');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000322t2oqdjelm2', 'cmeq7ftn60048e12up1jq4u2h', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000422t2cvuctapi', 'cmeq7gxdb004de12ubelu991o', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000522t2c82w040j', 'cmeq7o5g8004xe12uhtnelks3', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000622t2d991p6jp', 'cmeq81007005re12uzdj5c778', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000722t2dn05tn2s', 'cmeqa61z50073e12ukzgnkzy2', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000822t2uztxlkgk', 'cmeqab8u1007ie12uoyz2t6ua', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000922t2vfb0rczf', 'cmeqad5bp007ke12uip90i3ms', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000a22t2esmq0dju', 'cmeqake0w007ze12ufizh1sht', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000b22t2vdytzt8c', 'cmeqazz8e008se12ufk85438r', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000c22t2suu3gasf', 'cmeqb1itz008ue12u0hp2fqba', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000d22t2c7g6rhpw', 'cmeqb675a008we12upw9g3onl', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000e22t2sxore7nt', 'cmeqb72em0091e12u0hukynzq', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000f22t22nwv64f6', 'cmeqbac2s0095e12usyqghonm', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000g22t26xaunve7', 'cmeqbdtjv009ce12urxx5omxc', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000h22t2tj3crm8p', 'cmeqbocyk009ne12u6ji33cpf', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000i22t21tdyi5j5', 'cmeqbp9a6009se12u4grl0o7t', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000j22t2wh2op9vv', 'cmeq3s9nw001ve12utssxw3vs', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000k22t26w7r75lk', 'cmeq3tekg0020e12uhbkwtqwn', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000l22t2t5bbgb5b', 'cmeq3umgx0025e12ubpt6a60i', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000m22t2c0bh5629', 'cmeq6vzuu003ee12ug7sppypk', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000n22t2vqnq01ui', 'cmeq6xsiq003ie12uhg30e4oo', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000o22t2r9i9yhe1', 'cmeq76ies003oe12u1d2r3xpp', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000p22t2wt3hkdzh', 'cmeq79gyb003te12ukl5lzwo1', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000q22t2nwm4ehui', 'cmeq7u74z0056e12u18d35iiz', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000r22t2lspqszv1', 'cmeq7zsh6005me12u0ker7an9', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000s22t27qggnlnc', 'cmeqap6ih008be12u19btaw55', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000t22t2ong0ncpv', 'cmeqatzfg008ne12ud32swsh8', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000u22t2djn56shq', 'cmeqbbbmw009ae12u5lyorl2c', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000v22t244yjo1mb', 'cmeqbh53z009ie12u6t20fpqh', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000w22t21qfx9lnz', 'cmeqbutjm009ue12u7915yuib', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000x22t2ry1kc53z', 'cmeqbvmj5009ze12ults5wefz', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000y22t2i9ynfs6j', 'cmeq02xjl0024gqvg26v64aca', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla000z22t2ybn9omxl', 'cmeq0zrwv000be12us42r9b7g', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf37nmla001022t2zmu1qgr4', 'cmf36x2dn00294agdiegee97p', 'cmf36ocjb00004agdoyhauipv', '2025-09-03 00:00:03.358');
INSERT INTO public.graphene_compound_batches VALUES ('cmf6082or000h54hp3o9wj61h', 'cmeor8ps200132er8h0iifns3', 'cmf6082om000g54hpxuo2s036', '2025-09-04 22:55:18.94');
INSERT INTO public.graphene_compound_batches VALUES ('cmf6082or000i54hph2x0bplc', 'cmeosoeil001n2er8031ybv1c', 'cmf6082om000g54hpxuo2s036', '2025-09-04 22:55:18.94');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00124agd4yjvyv8s', 'cmeq1k8op001ce12ukemb2mm5', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00134agdsyq50sjr', 'cmeq40888002ae12u0p8066pt', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00144agddcl62g7j', 'cmeq4512f002pe12um387u7dh', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00154agdxzjke50c', 'cmeq1mnvx001he12uby0dq79q', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00164agdakafw8lo', 'cmeq4340e002ke12u80dv38cv', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');
INSERT INTO public.graphene_compound_batches VALUES ('cmf36qf1d00174agdqphnm0u9', 'cmeq0li8j0001e12u2sfj3c4z', 'cmf36qf1900114agdnl9hn88j', '2025-09-02 23:34:13.921');


--
-- Data for Name: graphene_sem_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.graphene_sem_reports VALUES ('cmeoqegpr00022er8edkj6a8j', 'cmeoq8mu00005snn8e6xhcb82', 'cmeoqegpq00002er8t9hdkk97', '2025-08-23 20:48:15.903');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoql35300072er8fq2dii69', 'cmeoql34u00042er8at56w7ks', 'cmeoql35200052er8vh9em3hb', '2025-08-23 20:53:24.904');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoqp24g000c2er8jecc1x56', 'cmeoqp24900092er8hvby7miq', 'cmeoqp24e000a2er8hvgo7lrc', '2025-08-23 20:56:30.208');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoqrh84000h2er8j1yalodu', 'cmeoqrh80000e2er8rivrncds', 'cmeoqrh83000f2er84t3920wt', '2025-08-23 20:58:23.092');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoqu3rl000m2er8g18t94al', 'cmeoqu3rc000j2er8yvgttikf', 'cmeoqu3rk000k2er86a4uoecy', '2025-08-23 21:00:25.618');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoqvquw000r2er8o6qg1fib', 'cmeoqvqus000o2er82eqx1bz8', 'cmeoqvquv000p2er8ehsszlb9', '2025-08-23 21:01:42.201');
INSERT INTO public.graphene_sem_reports VALUES ('cmeor28bg000w2er8xc8masiv', 'cmeor28b9000t2er8cap2gaun', 'cmeor28bf000u2er81fob6gfo', '2025-08-23 21:06:44.765');
INSERT INTO public.graphene_sem_reports VALUES ('cmeor5clv00112er8zdav5siq', 'cmeor5clr000y2er8cg966ayl', 'cmeor5clu000z2er844wf1tsv', '2025-08-23 21:09:10.292');
INSERT INTO public.graphene_sem_reports VALUES ('cmeor8psb00162er8889hqqep', 'cmeor8ps200132er8h0iifns3', 'cmeor8ps900142er8i29nhoit', '2025-08-23 21:11:47.34');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoshnz8001b2er8hv5a14si', 'cmeoshnyz00182er87pu3dt7u', 'cmeoshnz600192er8j8l1hftj', '2025-08-23 21:46:44.516');
INSERT INTO public.graphene_sem_reports VALUES ('cmeosk9z5001g2er8504w8s80', 'cmeosk9z1001d2er8ml76rr5i', 'cmeosk9z5001e2er8u7l3xiug', '2025-08-23 21:48:46.338');
INSERT INTO public.graphene_sem_reports VALUES ('cmeosmeiu001l2er8gl734qn7', 'cmeosmeiq001i2er8e5bnhts3', 'cmeosmeit001j2er8k6i7mr1q', '2025-08-23 21:50:25.543');
INSERT INTO public.graphene_sem_reports VALUES ('cmeosoeit001q2er88yc8371h', 'cmeosoeil001n2er8031ybv1c', 'cmeosoeir001o2er8vli36pgk', '2025-08-23 21:51:58.853');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoss2w3001v2er8dgmyl6zm', 'cmeoss2vy001s2er8gbkuvey1', 'cmeoss2w2001t2er8v6gt5ona', '2025-08-23 21:54:50.403');
INSERT INTO public.graphene_sem_reports VALUES ('cmeosvtfl00202er80bdrdjft', 'cmeosvtfd001x2er8rp3jvj20', 'cmeosvtfj001y2er878feg3b1', '2025-08-23 21:57:44.769');
INSERT INTO public.graphene_sem_reports VALUES ('cmeosxhi600252er8osd7czxw', 'cmeosxhi100222er8sunls3r4', 'cmeosxhi500232er8cer8i45p', '2025-08-23 21:59:02.622');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoszhlr002a2er87fi19ma2', 'cmeoszhln00272er8ucxikcgs', 'cmeoszhlq00282er8hsejdc8u', '2025-08-23 22:00:36.063');
INSERT INTO public.graphene_sem_reports VALUES ('cmeot0wuz002f2er8lfysvwde', 'cmeot0wuv002c2er8ujr22a3e', 'cmeot0wuy002d2er85x0cdp5i', '2025-08-23 22:01:42.491');
INSERT INTO public.graphene_sem_reports VALUES ('cmeot4l7z002k2er8fjhmperu', 'cmeot4l7r002h2er8wuetij5i', 'cmeot4l7y002i2er8cvc2mrrq', '2025-08-23 22:04:34.032');
INSERT INTO public.graphene_sem_reports VALUES ('cmeot6nlm002p2er8vpg4ei43', 'cmeot6nlk002m2er8711jvdit', 'cmeot6nll002n2er82oz6umjx', '2025-08-23 22:06:10.427');
INSERT INTO public.graphene_sem_reports VALUES ('cmeotg25a002w2er8o8m5oky3', 'cmeotg256002t2er8yrp6sjwn', 'cmeotg259002u2er8a6qtnyv8', '2025-08-23 22:13:29.183');
INSERT INTO public.graphene_sem_reports VALUES ('cmeothm2e00312er8n0p2n2yu', 'cmeothm2b002y2er8m9f974df', 'cmeothm2d002z2er8eeu54zfr', '2025-08-23 22:14:41.655');
INSERT INTO public.graphene_sem_reports VALUES ('cmeotjavl00362er8d5ijbnd8', 'cmeotjavh00332er8ievv08wr', 'cmeotjavk00342er8ycs3a6al', '2025-08-23 22:16:00.465');
INSERT INTO public.graphene_sem_reports VALUES ('cmeotmewa003b2er8aruts9n7', 'cmeotmew200382er8ac2mw7yf', 'cmeotmew800392er8e8g94gi9', '2025-08-23 22:18:25.643');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoto0j0003g2er8k21ege6l', 'cmeoto0ix003d2er8wzgows5s', 'cmeoto0iz003e2er8by6qu9u2', '2025-08-23 22:19:40.332');
INSERT INTO public.graphene_sem_reports VALUES ('cmeotplvn003l2er80wix4zt5', 'cmeotplvj003i2er8xnd235v3', 'cmeotplvm003j2er838rr89jg', '2025-08-23 22:20:54.659');
INSERT INTO public.graphene_sem_reports VALUES ('cmeoty1dq003u2er8swi0l438', 'cmeoty1dh003r2er8wbdq9p0y', 'cmeoty1dl003s2er8rdhjtgt3', '2025-08-23 22:27:27.998');
INSERT INTO public.graphene_sem_reports VALUES ('cmeotzsfs003z2er8d6yeol1p', 'cmeotzsfo003w2er8v917iodi', 'cmeotzsfr003x2er8mujz308f', '2025-08-23 22:28:49.72');
INSERT INTO public.graphene_sem_reports VALUES ('cmeou1js800442er8iricw481', 'cmeou1jrz00412er845359u2g', 'cmeou1js600422er8oxoqaz5m', '2025-08-23 22:30:11.816');
INSERT INTO public.graphene_sem_reports VALUES ('cmeou32ys00492er8f26rsw6e', 'cmeou32yo00462er80skmdgx2', 'cmeou32yr00472er8f6t608ql', '2025-08-23 22:31:23.332');
INSERT INTO public.graphene_sem_reports VALUES ('cmeou5j8o004e2er807lpgb51', 'cmeou5j8k004b2er8h2uvyi3w', 'cmeou5j8n004c2er89ial1vsd', '2025-08-23 22:33:17.736');
INSERT INTO public.graphene_sem_reports VALUES ('cmeou75to004j2er8yonzcomg', 'cmeou75tm004g2er8c1lvb3fq', 'cmeou75to004h2er88xqmplu8', '2025-08-23 22:34:33.661');
INSERT INTO public.graphene_sem_reports VALUES ('cmepth8en0004rbczte6ucarj', 'cmepth8ed0001rbcz8kbdzgu3', 'cmepth8el0002rbczh2zd6bhi', '2025-08-24 15:02:10.127');
INSERT INTO public.graphene_sem_reports VALUES ('cmepxue7r0004gqvgcxtwfe0s', 'cmepxue7h0001gqvgj5qirhx2', 'cmepxue7o0002gqvg364lwvtz', '2025-08-24 17:04:22.647');
INSERT INTO public.graphene_sem_reports VALUES ('cmepxxhdj0009gqvgpiibamiz', 'cmepxxhdg0006gqvg1mnjpr81', 'cmepxxhdj0007gqvggqdksl83', '2025-08-24 17:06:46.712');
INSERT INTO public.graphene_sem_reports VALUES ('cmepxys7o000egqvglzc9v449', 'cmepxys7k000bgqvgoz888bzm', 'cmepxys7n000cgqvgu5i9o2fx', '2025-08-24 17:07:47.412');
INSERT INTO public.graphene_sem_reports VALUES ('cmepy1cqi000jgqvgqnkmupiw', 'cmepy1cqa000ggqvgrfqpneg8', 'cmepy1cqg000hgqvg8tzk7i6v', '2025-08-24 17:09:47.322');
INSERT INTO public.graphene_sem_reports VALUES ('cmepy2wcz000ogqvg9d1cuo11', 'cmepy2wcu000lgqvg7xz1i0yq', 'cmepy2wcy000mgqvg6l5qtis5', '2025-08-24 17:10:59.411');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzjfrn000tgqvg7g2ler3i', 'cmepzjfrd000qgqvgixrkxqy1', 'cmepzjfrl000rgqvg90io9e0j', '2025-08-24 17:51:50.675');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzkr2h000ygqvgapoz4go6', 'cmepzkr2d000vgqvgumzxp83p', 'cmepzkr2g000wgqvgik4c7fet', '2025-08-24 17:52:51.978');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzmdrx0013gqvgi09qf9yx', 'cmepzmdrt0010gqvgvrhb1xdr', 'cmepzmdrx0011gqvgpxko324f', '2025-08-24 17:54:08.062');
INSERT INTO public.graphene_sem_reports VALUES ('cmepznrqy0018gqvgjcccmllf', 'cmepznrqv0015gqvgq0t6hace', 'cmepznrqx0016gqvgm6utzp2u', '2025-08-24 17:55:12.827');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzp96j001dgqvgko5szdln', 'cmepzp96e001agqvgdxptizo4', 'cmepzp96i001bgqvg1wukddrc', '2025-08-24 17:56:22.075');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzqh0n001igqvgaemgx8ph', 'cmepzqh0g001fgqvg58z7pw6w', 'cmepzqh0l001ggqvgrtemjnas', '2025-08-24 17:57:18.888');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzuxwk001ngqvgwd1dd2z6', 'cmepzuxwg001kgqvgl06xss1r', 'cmepzuxwj001lgqvg9pmqfquj', '2025-08-24 18:00:47.396');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzwabp001sgqvgcijuui6s', 'cmepzwabb001pgqvgeq9ot5ep', 'cmepzwabl001qgqvgo3ws2abn', '2025-08-24 18:01:50.149');
INSERT INTO public.graphene_sem_reports VALUES ('cmepzxsyf001xgqvgi2kp0tqs', 'cmepzxsy9001ugqvgdpg2lptx', 'cmepzxsye001vgqvg1pfidir2', '2025-08-24 18:03:00.952');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq00geb0022gqvg43kvdo7d', 'cmeq00ge6001zgqvgidw0thmm', 'cmeq00gea0020gqvgkacbxek8', '2025-08-24 18:05:04.643');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq02xjq0027gqvgcoyzhue4', 'cmeq02xjl0024gqvg26v64aca', 'cmeq02xjo0025gqvgfhj4nc1x', '2025-08-24 18:07:00.182');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq0li8t0004e12u48a4fqx6', 'cmeq0li8j0001e12u2sfj3c4z', 'cmeq0li8q0002e12umsczq3fo', '2025-08-24 18:21:26.813');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq0xw1k0009e12u64h8hxnf', 'cmeq0xw1a0006e12ueyg0yytc', 'cmeq0xw1i0007e12ugx6uc4ut', '2025-08-24 18:31:04.568');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq12exq000ge12uk27gv4al', 'cmeq12exm000de12uu9uwe83k', 'cmeq12exo000ee12u8qqiwwoh', '2025-08-24 18:34:35.678');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq17o84000le12umjg1zjbc', 'cmeq17o7x000ie12ufle13bqn', 'cmeq17o83000je12u85ovz4nl', '2025-08-24 18:38:40.997');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1a7k3000qe12uojwc7zya', 'cmeq1a7jz000ne12ug8i2yr8j', 'cmeq1a7k2000oe12ubmrwinij', '2025-08-24 18:40:39.363');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1c0y2000ve12uxpjs76ce', 'cmeq1c0xx000se12up6ozdhwz', 'cmeq1c0y0000te12u74prvi5i', '2025-08-24 18:42:04.106');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1e1oq0010e12u395c936i', 'cmeq1e1om000xe12uxrrf8lbr', 'cmeq1e1op000ye12u8c1c0y94', '2025-08-24 18:43:38.378');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1ffrx0015e12ubt043xh2', 'cmeq1ffrp0012e12u6ni6a06w', 'cmeq1ffrw0013e12ux29zsx6o', '2025-08-24 18:44:43.293');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1hl82001ae12u8aljw612', 'cmeq1hl7z0017e12uqp1zcqwu', 'cmeq1hl820018e12u2rnegg72', '2025-08-24 18:46:23.667');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1k8os001fe12uarvq5xmk', 'cmeq1k8op001ce12ukemb2mm5', 'cmeq1k8or001de12un81haa0w', '2025-08-24 18:48:27.389');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1mnw4001ke12ufd00emhp', 'cmeq1mnvx001he12uby0dq79q', 'cmeq1mnw3001ie12uc9zlftzt', '2025-08-24 18:50:20.404');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq1nz6k001pe12ubwgum5h0', 'cmeq1nz6h001me12uv53g5did', 'cmeq1nz6k001ne12u8ovfyaua', '2025-08-24 18:51:21.693');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq3s9o0001ye12u1kzuxqxw', 'cmeq3s9nw001ve12utssxw3vs', 'cmeq3s9ny001we12ufsflcsze', '2025-08-24 19:50:41.136');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq3tekj0023e12u5qst6ds9', 'cmeq3tekg0020e12uhbkwtqwn', 'cmeq3tekj0021e12uxowjijkm', '2025-08-24 19:51:34.148');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq3umh10028e12uxyp00syg', 'cmeq3umgx0025e12ubpt6a60i', 'cmeq3umh00026e12utd26ubfv', '2025-08-24 19:52:31.045');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq4088g002de12u2pl6hfti', 'cmeq40888002ae12u0p8066pt', 'cmeq4088e002be12u8kfpkz4d', '2025-08-24 19:56:52.528');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq41oy9002ie12uzt1z47j9', 'cmeq41oy4002fe12u1h7847bk', 'cmeq41oy8002ge12uw8891f0j', '2025-08-24 19:58:00.849');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq4340i002ne12urn5haopx', 'cmeq4340e002ke12u80dv38cv', 'cmeq4340h002le12ubiloju28', '2025-08-24 19:59:07.027');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq4512k002se12uksctypbu', 'cmeq4512f002pe12um387u7dh', 'cmeq4512i002qe12u25rkhk0s', '2025-08-24 20:00:36.524');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq46dhr002xe12ub5j81rdz', 'cmeq46dhn002ue12u6agtpzsx', 'cmeq46dhq002ve12uq2jwpcv8', '2025-08-24 20:01:39.279');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq6qt5c0032e12ui8eh6u43', 'cmeq6qt53002ze12uaajcy23d', 'cmeq6qt5a0030e12u9q84fe00', '2025-08-24 21:13:31.92');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq6rvhe0037e12u1duewp8y', 'cmeq6rvh90034e12ug9zegyde', 'cmeq6rvhd0035e12u3ovhc5h9', '2025-08-24 21:14:21.602');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq6uihh003ce12ucvzwo9ej', 'cmeq6uihd0039e12uuyczihw9', 'cmeq6uihg003ae12uep3w2jla', '2025-08-24 21:16:24.725');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq6vzux003he12utxrvl8d9', 'cmeq6vzuu003ee12ug7sppypk', 'cmeq6vzuw003fe12uiu518o73', '2025-08-24 21:17:33.898');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq6xsix003le12ulfitxuta', 'cmeq6xsiq003ie12uhg30e4oo', 'cmeq6xsiv003je12ug2t915g5', '2025-08-24 21:18:57.706');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq76if2003re12ux7rj3fdt', 'cmeq76ies003oe12u1d2r3xpp', 'cmeq76iew003pe12u536c0nnt', '2025-08-24 21:25:44.51');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq79gyf003we12ut1dwhznf', 'cmeq79gyb003te12ukl5lzwo1', 'cmeq79gye003ue12uirygcqcu', '2025-08-24 21:28:02.583');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7bdni0041e12u1j7rdxg8', 'cmeq7bdnb003ye12ulbbqzxfi', 'cmeq7bdng003ze12upkf7o7yd', '2025-08-24 21:29:31.614');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7dcaw0046e12u7q5tasp6', 'cmeq7dcar0043e12uhggdvfgv', 'cmeq7dcav0044e12ut8al3hvi', '2025-08-24 21:31:03.177');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7ftnb004be12uclo9fyq5', 'cmeq7ftn60048e12up1jq4u2h', 'cmeq7ftn90049e12ui0c0hlft', '2025-08-24 21:32:58.968');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7gxdg004ge12ulvfagx63', 'cmeq7gxdb004de12ubelu991o', 'cmeq7gxdf004ee12uxv4aw4fw', '2025-08-24 21:33:50.452');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7id4c004le12u919up6el', 'cmeq7id44004ie12u3458207o', 'cmeq7id4a004je12usjewqvnm', '2025-08-24 21:34:57.516');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7jndd004qe12u5bymvjj2', 'cmeq7jnd9004ne12umsr0oj9s', 'cmeq7jndc004oe12uu19bzf56', '2025-08-24 21:35:57.457');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7mhwh004ve12ulzqs1u5n', 'cmeq7mhwd004se12uv0b5lilh', 'cmeq7mhwg004te12uvd6iz8zu', '2025-08-24 21:38:10.337');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7o5ge0050e12ufp3m8kqv', 'cmeq7o5g8004xe12uhtnelks3', 'cmeq7o5gd004ye12u87dehbxb', '2025-08-24 21:39:27.518');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7u7540059e12uu801y8v6', 'cmeq7u74z0056e12u18d35iiz', 'cmeq7u7530057e12uqmgenvos', '2025-08-24 21:44:09.641');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7vtla005ee12ugculdbl2', 'cmeq7vtl6005be12uegs2q0wp', 'cmeq7vtl9005ce12ujh4srrq1', '2025-08-24 21:45:25.39');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7xfok005ke12um1mzbicw', 'cmeq7xfob005he12u5x4cp57z', 'cmeq7xfoi005ie12unheb2zlj', '2025-08-24 21:46:40.676');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq7zsha005pe12udlobviyp', 'cmeq7zsh6005me12u0ker7an9', 'cmeq7zsh9005ne12ufw6hgkol', '2025-08-24 21:48:30.575');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8392l005xe12ui3205jaj', 'cmeq81007005re12uzdj5c778', 'cmeq8392l005ve12uob4to6gj', '2025-08-24 21:51:12.046');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq881jw0062e12urkxvzhfg', 'cmeq881jp005ze12u04qu30sx', 'cmeq881ju0060e12uhs4ntmrn', '2025-08-24 21:54:55.58');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq89dgi0067e12uqqnyh4dm', 'cmeq89dge0064e12uvpqe66n7', 'cmeq89dgh0065e12u43wm2981', '2025-08-24 21:55:57.666');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8cwh4006ce12u1gjfeyue', 'cmeq8cwgv0069e12u8vusyo83', 'cmeq8cwh2006ae12u6boib8pp', '2025-08-24 21:58:42.28');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8e71r006he12u4tdlnhlr', 'cmeq8e71n006ee12uwtka89bu', 'cmeq8e71q006fe12ulefvp44l', '2025-08-24 21:59:42.639');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8q9p3006me12ubyjhtkmn', 'cmeq8q9ou006je12uha8vxh44', 'cmeq8q9p1006ke12uieu08lxc', '2025-08-24 22:09:05.943');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8vzew006re12uzoe8s8w1', 'cmeq8vzer006oe12uugl6w7au', 'cmeq8vzev006pe12urdaj5zqk', '2025-08-24 22:13:32.552');
INSERT INTO public.graphene_sem_reports VALUES ('cmeq8y095006we12u3mhn6eki', 'cmeq8y08l006te12u2gifxcax', 'cmeq8y093006ue12ufj22dw3t', '2025-08-24 22:15:06.954');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqa3hok0071e12uvzqojere', 'cmeqa3hoa006ye12uate4uxme', 'cmeqa3hoi006ze12u8xpzdjo1', '2025-08-24 22:47:22.436');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqa61za0076e12ust7bunzh', 'cmeqa61z50073e12ukzgnkzy2', 'cmeqa61z90074e12uonspb98c', '2025-08-24 22:49:22.055');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqa7aai007be12url1qy3d9', 'cmeqa7aae0078e12u6dmeblna', 'cmeqa7aah0079e12u5v6nm0er', '2025-08-24 22:50:19.483');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqa8s45007ge12u2bmf3yba', 'cmeqa8s3u007de12u9yk2q06k', 'cmeqa8s43007ee12u2gai2k9l', '2025-08-24 22:51:29.237');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqad5bu007ne12unfp59d1u', 'cmeqad5bp007ke12uip90i3ms', 'cmeqad5bs007le12uinvahfvw', '2025-08-24 22:54:52.986');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqaf4p2007se12ueycsua1i', 'cmeqaf4ox007pe12uhmrwjwd1', 'cmeqaf4p1007qe12unuwcnmlf', '2025-08-24 22:56:25.479');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqaghyo007xe12ugvmxphw4', 'cmeqaghyl007ue12un1fsp7po', 'cmeqaghyn007ve12uo93fbb3y', '2025-08-24 22:57:29.328');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqam5gc0084e12u1vz3v7q4', 'cmeqam5g50081e12ub3vut6eu', 'cmeqam5ga0082e12um301key8', '2025-08-24 23:01:53.052');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqan33k0089e12uj1fo3axx', 'cmeqan33g0086e12ub3c2k8xt', 'cmeqan33i0087e12uz36u523s', '2025-08-24 23:02:36.656');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqaqlqx008ge12up6crj7ij', 'cmeqaqlqr008de12uxl4u7cpi', 'cmeqaqlqv008ee12ulavzsc2i', '2025-08-24 23:05:20.793');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqarnw4008le12uh8yb20fp', 'cmeqarnvw008ie12uonu2fra3', 'cmeqarnw2008je12uay0ou4ld', '2025-08-24 23:06:10.228');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqatzfl008qe12u41k8yw9v', 'cmeqatzfg008ne12ud32swsh8', 'cmeqatzfj008oe12ugvw6bdx5', '2025-08-24 23:07:58.497');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqb675i008ze12um7dwus68', 'cmeqb675a008we12upw9g3onl', 'cmeqb675e008xe12uf6ox8sal', '2025-08-24 23:17:28.374');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbac2x0098e12u2n2mue56', 'cmeqbac2s0095e12usyqghonm', 'cmeqbac2v0096e12u36nt8qrv', '2025-08-24 23:20:41.385');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbdtk3009fe12udyhkqbj7', 'cmeqbdtjv009ce12urxx5omxc', 'cmeqbdtk1009de12uq3zk2guj', '2025-08-24 23:23:24.003');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbh542009le12ut2vy2hbq', 'cmeqbh53z009ie12u6t20fpqh', 'cmeqbh542009je12ufcbe8mqy', '2025-08-24 23:25:58.947');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbocyv009qe12uk7zlseon', 'cmeqbocyk009ne12u6ji33cpf', 'cmeqbocyt009oe12u8x5nxvi4', '2025-08-24 23:31:35.72');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbutjw009xe12uf5esloma', 'cmeqbutjm009ue12u7915yuib', 'cmeqbutju009ve12uxpfmrqyf', '2025-08-24 23:36:37.148');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbyi0d00a4e12uhlqw3ix9', 'cmeqbyi0900a1e12urcdim3fr', 'cmeqbyi0c00a2e12uduv8aes6', '2025-08-24 23:39:28.813');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqbzmen00a9e12uhptlysjf', 'cmeqbzmej00a6e12uh3g0noaz', 'cmeqbzmem00a7e12ue8iihhv9', '2025-08-24 23:40:21.167');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqc1ci800aee12uzhck9pwc', 'cmeqc1ci000abe12u645l642p', 'cmeqc1ci600ace12u8ghqwsnu', '2025-08-24 23:41:41.648');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqc37jy00aje12ulcjjnghj', 'cmeqc37jv00age12uc8t3my3i', 'cmeqc37jx00ahe12unw26ezib', '2025-08-24 23:43:08.542');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqccqrq00aue12ubh0k3z2t', 'cmeqccqrc00are12uxjkqakes', 'cmeqccqrg00ase12uhj0rmnkn', '2025-08-24 23:50:33.35');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcfy0700aze12u1unpa4so', 'cmeqcfxzy00awe12uf6ocu671', 'cmeqcfy0500axe12ugjfc4zn5', '2025-08-24 23:53:02.696');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcjytw00b4e12ufps9thkw', 'cmeqcjytn00b1e12ur5oudoci', 'cmeqcjytu00b2e12ubhqj1771', '2025-08-24 23:56:10.388');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcmdco00b9e12ukq4d7bcs', 'cmeqcmdck00b6e12u3pvfwce4', 'cmeqcmdcn00b7e12ugu2j7xlv', '2025-08-24 23:58:02.521');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcq9sh00bee12u0sof9un0', 'cmeqcq9s900bbe12upzeqzv7s', 'cmeqcq9sg00bce12ud17rgb38', '2025-08-25 00:01:04.53');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcswyj00bje12uz1dkhtd2', 'cmeqcswy900bge12u1b4juu4i', 'cmeqcswyh00bhe12uwt26zi9b', '2025-08-25 00:03:07.867');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcvcio00boe12ur6g6vdil', 'cmeqcvcik00ble12upxc48um0', 'cmeqcvcin00bme12ugcjfr6kf', '2025-08-25 00:05:01.345');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqcy1jv00bve12uzf9xqog7', 'cmeqcy1jq00bse12u4g7934n4', 'cmeqcy1jt00bte12ujm82i768', '2025-08-25 00:07:07.099');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqd31sm00c0e12ukvovdpn4', 'cmeqd00f600bxe12uyoz7fkqh', 'cmeqd31sk00bye12unxplrt5c', '2025-08-25 00:11:00.694');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqd8ukg00c3e12uzscbaapf', 'cmehgk5mu0001r3l2euavns2l', 'cmeqd8ukf00c1e12uzan6q2yg', '2025-08-25 00:15:31.264');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdaii100c6e12u4q3bgtw6', 'cmehhl2gi000b3zya8bpy6mlj', 'cmeqdaii000c4e12ui24mvhry', '2025-08-25 00:16:48.937');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdcfdb00c8e12uxtxwh6do', 'cmehhl2gi000b3zya8bpy6mlj', 'cmeqdcfd900c7e12uwse5hin8', '2025-08-25 00:18:18.191');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdekmw00cbe12umnfl4zi6', 'cmehhng8e000d3zya6drzkkxu', 'cmeqdekmv00c9e12u43y5lyph', '2025-08-25 00:19:58.329');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdi1xa00cee12u1hhhkt2i', 'cmehibmez000n3zya6s2jmzll', 'cmeqdi1x900cce12usywfvdr3', '2025-08-25 00:22:40.702');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdidl800che12uas25n81r', 'cmehicg7g000p3zyavs646cuz', 'cmeqdidl700cfe12u75bjbueq', '2025-08-25 00:22:55.82');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdjixj00cke12uzogi5v5j', 'cmehifaxx000t3zya0re8j781', 'cmeqdjixh00cie12u5yxr0xa3', '2025-08-25 00:23:49.4');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdjw5600cne12uxbsptbs1', 'cmehie0vo000r3zyajv2j6xjj', 'cmeqdjw5600cle12udssv3f00', '2025-08-25 00:24:06.523');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdkarl00cqe12uk1ddj10g', 'cmehigzfo000v3zyasf8ogzqo', 'cmeqdkark00coe12uxore1fjy', '2025-08-25 00:24:25.473');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdl8h500cte12up93wa7d4', 'cmehij6xl000x3zyaoko7mnn8', 'cmeqdl8h400cre12uur9160n0', '2025-08-25 00:25:09.161');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdlnh500cwe12u7xi6o8hl', 'cmehillwb000z3zya6m1qx2dy', 'cmeqdlnh400cue12u5536uagc', '2025-08-25 00:25:28.601');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdmeva00cze12u0xbwkjp6', 'cmehimz0g00113zyambeggrfd', 'cmeqdmev900cxe12u9oqvqiil', '2025-08-25 00:26:04.102');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdnhnp00d2e12uqshlykws', 'cmehio9z400133zyayfr67mac', 'cmeqdnhno00d0e12uth3okzb9', '2025-08-25 00:26:54.374');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdnsr700d5e12uco8xnwbw', 'cmehip9so00153zyaa8wqhnga', 'cmeqdnsr600d3e12uihsc7fv1', '2025-08-25 00:27:08.755');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdotr400d8e12u8hzscavv', 'cmehitpbp00173zyayovzk9k4', 'cmeqdotr300d6e12u9glyueh6', '2025-08-25 00:27:56.704');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdp6kz00dbe12u3grpt045', 'cmej1clg0000s8g16xtwv6dt1', 'cmeqdp6ky00d9e12ulfl9mg22', '2025-08-25 00:28:13.331');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdq24700dee12umfiqc6zv', 'cmej1f4eb000u8g16b075a7hk', 'cmeqdq24500dce12uuedepk0e', '2025-08-25 00:28:54.2');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdqeev00dhe12uw6dky66s', 'cmej1fwhv000w8g165rxy66ju', 'cmeqdqeeu00dfe12ux27y5vh9', '2025-08-25 00:29:10.136');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdqrm400dke12u4vejevp2', 'cmej1gwkz000y8g1674t56im0', 'cmeqdqrm300die12u6c4aru2n', '2025-08-25 00:29:27.244');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdroyy00dne12ulboepjod', 'cmej1ikoo00108g167snrl3jp', 'cmeqdroyx00dle12u5c1xyy6f', '2025-08-25 00:30:10.474');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqds20900dqe12uld8e6qhx', 'cmej1jicq00128g16j1ff1tjf', 'cmeqds20800doe12un5n0wqsw', '2025-08-25 00:30:27.37');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdsfp000dte12u8m52p9pz', 'cmej1kcz100148g16k1s9nclz', 'cmeqdsfoz00dre12u20k5m5yn', '2025-08-25 00:30:45.108');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdtbq300dwe12ujvk57vtt', 'cmej1lj6z00168g16996f7oo4', 'cmeqdtbq300due12u2k1u3wtr', '2025-08-25 00:31:26.62');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqduhiz00dze12utnpacle9', 'cmej1n90q001a8g16txbqz53m', 'cmeqduhiz00dxe12u5ajhiuwu', '2025-08-25 00:32:20.796');
INSERT INTO public.graphene_sem_reports VALUES ('cmeqdutvz00e2e12u49ma9782', 'cmej1mciz00188g16ays64gej', 'cmeqdutvy00e0e12ugac0lv60', '2025-08-25 00:32:36.815');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswb64q000625yfg3h71svs', 'cmej1q41b001g8g16h2ql6xyx', 'cmeswb64k000425yfzandce5a', '2025-08-26 18:44:44.618');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswblfn000925yf7vo3z9h2', 'cmej1pbu1001e8g161qkjn2q7', 'cmeswblfm000725yfbrq2lkl3', '2025-08-26 18:45:04.451');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswc3dk000c25yfhmrbfbje', 'cmej1rupa001k8g167i8eqj0j', 'cmeswc3dj000a25yfbqxztin8', '2025-08-26 18:45:27.705');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswckoc000f25yfl0i4xnu4', 'cmej1r7vj001i8g162aerwvfk', 'cmeswckob000d25yfjveecifh', '2025-08-26 18:45:50.124');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswioe7000i25yfqac5tvx1', 'cmej1sljy001m8g16rx2pujk5', 'cmeswioe5000g25yfuotq1max', '2025-08-26 18:50:34.88');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswj0jr000l25yfv7q8s65o', 'cmej1t70e001o8g16dt1wu578', 'cmeswj0jq000j25yftnovb8eh', '2025-08-26 18:50:50.632');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswjj9x000o25yflx9jq5f2', 'cmej1tta2001q8g16mz1ccqij', 'cmeswjj9w000m25yfc325z84k', '2025-08-26 18:51:14.902');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswjxjt000r25yfxcb94t9p', 'cmej1uky4001s8g16z11dr8jv', 'cmeswjxjs000p25yfzfmvgc6h', '2025-08-26 18:51:33.401');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswkdp1000u25yf4ug3hpmi', 'cmej1vkq0001u8g16a9j1smaa', 'cmeswkdp1000s25yf9vxw4p0v', '2025-08-26 18:51:54.326');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswkrls000x25yfc3o3dfss', 'cmej1w8uy001w8g16p1lpnt5f', 'cmeswkrls000v25yfmg5va5xg', '2025-08-26 18:52:12.353');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswlsgm001025yfv4949hlu', 'cmej1x937001y8g16xobh32nu', 'cmeswlsgk000y25yfq7y3zb1x', '2025-08-26 18:53:00.118');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswm4ei001325yfkwotb0fb', 'cmej1y3ay00208g16twdubz6j', 'cmeswm4ei001125yf9cy7p7me', '2025-08-26 18:53:15.595');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswmk04001625yfjutozjkw', 'cmej1ysiz00228g16h36hlp2a', 'cmeswmk04001425yf1nxngql8', '2025-08-26 18:53:35.813');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswmwk0001925yf0yg2909p', 'cmej1zi7k00248g162vardwvt', 'cmeswmwjz001725yf7shc2pv3', '2025-08-26 18:53:52.08');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswqlzy001c25yfbaubu34k', 'cmej208o400268g16tda585c0', 'cmeswqlzx001a25yfkicwi4hy', '2025-08-26 18:56:45.022');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswr1qg001f25yfh9a8nrzh', 'cmej20y1200288g16mrg3fk0q', 'cmeswr1qg001d25yfwmkvrako', '2025-08-26 18:57:05.417');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswrwi1001i25yf34rn8zi2', 'cmej22q7x002a8g16mgm0nbru', 'cmeswrwi0001g25yf3ruusbdj', '2025-08-26 18:57:45.289');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswscw0001l25yfotcbezis', 'cmej23ix8002c8g16l96x85uu', 'cmeswscvz001j25yf98ph1b6o', '2025-08-26 18:58:06.528');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswt30h001o25yfzzd3t4sq', 'cmej24iwu002e8g168olgu3ah', 'cmeswt30e001m25yff8tsrbci', '2025-08-26 18:58:40.385');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswufoh001r25yfx1jjbfci', 'cmej26fhf002i8g16wx3kklpx', 'cmeswufog001p25yftvblarmh', '2025-08-26 18:59:43.457');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswuq4r001u25yfgkma30fm', 'cmej275eu002k8g16mstontze', 'cmeswuq4r001s25yf9gm0fpsf', '2025-08-26 18:59:57.004');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswwekm001x25yf0oef8wnb', 'cmej27s0q002m8g16w9lerapp', 'cmeswwekk001v25yfhffv4a0q', '2025-08-26 19:01:15.335');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswwqxn002025yfc1h2hb9y', 'cmej28f7l002o8g16zknhj2gw', 'cmeswwqxm001y25yfaarnc83j', '2025-08-26 19:01:31.356');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswykpd002325yfa24fkyfh', 'cmek3pz1z002q8g16ojhsqi44', 'cmeswykpc002125yfeg8qr9yr', '2025-08-26 19:02:56.594');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswyw82002625yfkfshsyvv', 'cmek3rjrx002s8g16xfpiyh62', 'cmeswyw82002425yfq98arku3', '2025-08-26 19:03:11.523');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswzjaf002925yfsx23cdyg', 'cmek3sna7002u8g161p4p0nmc', 'cmeswzjaf002725yfl290jd9v', '2025-08-26 19:03:41.416');
INSERT INTO public.graphene_sem_reports VALUES ('cmeswzx75002c25yfzp50qst0', 'cmek3thga002w8g16fhib2ms3', 'cmeswzx75002a25yf6lkvjsba', '2025-08-26 19:03:59.442');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx1ou8002f25yfuq04d67j', 'cmek3v67b002y8g16vb6bcfoo', 'cmesx1ou7002d25yfz6f4r7jd', '2025-08-26 19:05:21.92');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx2blr002i25yfoumjgat3', 'cmek3wayg00308g16g7qomlry', 'cmesx2blr002g25yff5i8c410', '2025-08-26 19:05:51.424');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx2w8u002l25yfdqbx2att', 'cmek3xvxa00328g1672z3f5fx', 'cmesx2w8s002j25yfg69b8cd8', '2025-08-26 19:06:18.175');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx389q002o25yf89847muz', 'cmek3zd2i00348g16m1bbjgdj', 'cmesx389p002m25yfr6igzchz', '2025-08-26 19:06:33.759');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx3sd1002r25yfvwq2ce04', 'cmek40adx00368g16y43ous1d', 'cmesx3sd0002p25yfidknufnf', '2025-08-26 19:06:59.798');
INSERT INTO public.graphene_sem_reports VALUES ('cmesx43hs002u25yf4qmtyaxb', 'cmek414pt00388g16qih7z16t', 'cmesx43hr002s25yfta1a4l9z', '2025-08-26 19:07:14.224');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7oxow0003vjz5mo0nib37', 'cmek42jbz003a8g169jlntz1j', 'cmex7oxou0001vjz5viwswhfa', '2025-08-29 19:14:27.344');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7pk080006vjz5ypb49mze', 'cmek445v0003c8g1652gg7wgb', 'cmex7pk070004vjz5aakzrqum', '2025-08-29 19:14:56.264');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7qv7y0009vjz5e1qxckpj', 'cmek3xvxa00328g1672z3f5fx', 'cmex7qv7x0007vjz5lx7m2rnd', '2025-08-29 19:15:57.454');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7rd6m000cvjz5mt65r2s4', 'cmek459h6003e8g16c1dd431d', 'cmex7rd6l000avjz5z4y8r0ct', '2025-08-29 19:16:20.734');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7sa1k000fvjz5mdpbs1x3', 'cmek46a9c003g8g16keywmjfg', 'cmex7sa1k000dvjz5yhgcvtki', '2025-08-29 19:17:03.321');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7t0gb000ivjz5sw9q3fn6', 'cmek5dpgu000113l8y63dwlg4', 'cmex7t0ga000gvjz5gw3t9f3f', '2025-08-29 19:17:37.547');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7ue2p000lvjz5ynmwt4qw', 'cmek5gq7r000313l8i3h6rcnr', 'cmex7ue2o000jvjz5sy8ak617', '2025-08-29 19:18:41.858');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7w32x000ovjz5e8fbcumu', 'cmek5jrm000014t6gcd18mldf', 'cmex7w32w000mvjz5v9omfcic', '2025-08-29 19:20:00.921');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7wssj000rvjz5ojxxauz3', 'cmek5kydb00034t6g64irlclj', 'cmex7wssi000pvjz5ubz2vw6y', '2025-08-29 19:20:34.243');
INSERT INTO public.graphene_sem_reports VALUES ('cmex7x8ld000uvjz5d4qdxcpx', 'cmek5nxlk00054t6gs3xzn4i3', 'cmex7x8lc000svjz5oux50ueu', '2025-08-29 19:20:54.722');
INSERT INTO public.graphene_sem_reports VALUES ('cmfj6xq2a000212siqkw8u9e2', 'cmfj4npqv00058ucpoqligv1i', 'cmfj6xq25000012sihffr2g73', '2025-09-14 04:24:13.618');


--
-- Data for Name: graphene_update_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg001ykj2b366irf53', 'cmeq41oy4002fe12u1h7847bk', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg001zkj2bqze0hamz', 'cmeq4340e002ke12u80dv38cv', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg0020kj2b6c98112j', 'cmeq4512f002pe12um387u7dh', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg0021kj2b9mz4har6', 'cmeq6rvh90034e12ug9zegyde', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000214bc0azimq63', 'cmeq7o5g8004xe12uhtnelks3', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000314bcasa78opn', 'cmeq7u74z0056e12u18d35iiz', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000414bc3zmshhae', 'cmeq7zsh6005me12u0ker7an9', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000614bca25mkcch', 'cmeq8q9ou006je12uha8vxh44', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000714bcj5jjasvb', 'cmeq8vzer006oe12uugl6w7au', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000814bczba2u8w3', 'cmeq7rlnx0054e12uhisj1tnv', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000914bczlneqy0i', 'cmeq7qljn0052e12ug7gmd8av', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000a14bcswgjm9ky', 'cmeq7xfob005he12u5x4cp57z', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000b14bc2i87ss4r', 'cmeq7vtl6005be12uegs2q0wp', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000c14bcwf2yynb0', 'cmeq89dge0064e12uvpqe66n7', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000d14bccoxafepd', 'cmeq881jp005ze12u04qu30sx', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000e14bclv0spm97', 'cmeq8e71n006ee12uwtka89bu', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf72flh6000f14bcq64p7ru5', 'cmeq8cwgv0069e12u8vusyo83', 'cmf72e8py000014bcwozde15r', '2025-09-05 16:44:55.291');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg0022kj2b0d6sbbmr', 'cmeq6qt53002ze12uaajcy23d', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg0023kj2bcmnrp5fc', 'cmeq6uihd0039e12uuyczihw9', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf7410lg0024kj2brmhxft74', 'cmeq46dhn002ue12u6agtpzsx', 'cmf7400gn001xkj2bxejj7ilp', '2025-09-05 17:29:34.277');
INSERT INTO public.graphene_update_reports VALUES ('cmf742ocz0026kj2baih2gzjv', 'cmeqb675a008we12upw9g3onl', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 17:30:51.732');
INSERT INTO public.graphene_update_reports VALUES ('cmf7ar91u0028kj2bcelefu5d', 'cmf36x2dn00294agdiegee97p', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:37:55.987');
INSERT INTO public.graphene_update_reports VALUES ('cmf7arw6n0029kj2bvpniavuw', 'cmeqbac2s0095e12usyqghonm', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:38:25.967');
INSERT INTO public.graphene_update_reports VALUES ('cmf7asswy002akj2b2utkgicc', 'cmeqbbbmw009ae12u5lyorl2c', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:39:08.386');
INSERT INTO public.graphene_update_reports VALUES ('cmf7ata3l002bkj2bd4zj5v0y', 'cmeqbdtjv009ce12urxx5omxc', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:39:30.658');
INSERT INTO public.graphene_update_reports VALUES ('cmf7atlkj002ckj2bh3hqcept', 'cmeqbh53z009ie12u6t20fpqh', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:39:45.523');
INSERT INTO public.graphene_update_reports VALUES ('cmf7aesyk0027kj2bml575s2b', 'cmeqb72em0091e12u0hukynzq', 'cmf7428vh0025kj2bzakb2xwm', '2025-09-05 20:28:15.26');
INSERT INTO public.graphene_update_reports VALUES ('cmf7b2d85002ekj2b67zhexl6', 'cmeq81007005re12uzdj5c778', 'cmf72e8py000014bcwozde15r', '2025-09-05 20:46:34.613');
INSERT INTO public.graphene_update_reports VALUES ('cmf7b2d85002fkj2b78p0mkzh', 'cmeq81007005re12uzdj5c778', 'cmf7b1rq3002dkj2b2n855lsk', '2025-09-05 20:46:34.613');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpo0000kj2b7ea7jvpf', 'cmeh8stb40001syoh3ry47g46', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0001kj2bpi20e8ir', 'cmehg5c6f0001k73z4h7kwfjl', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0002kj2bl1kzo8u2', 'cmehgk5mu0001r3l2euavns2l', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0003kj2bf7s8c2li', 'cmehgmui60003r3l2qpaja2lu', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0004kj2btruftdr0', 'cmehhl2gi000b3zya8bpy6mlj', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0005kj2bolfgb2vt', 'cmehhoolb000f3zyalvev321k', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0006kj2bdjpughmr', 'cmehhq6m3000h3zyat1fna370', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0007kj2bcluj3xfy', 'cmehhs2t5000j3zya5btfjns3', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0008kj2biogtac9e', 'cmehhng8e000d3zya6drzkkxu', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0009kj2b1eixqsgp', 'cmehhvpl1000l3zyaeg17mqwg', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000akj2bblcs8y8i', 'cmehibmez000n3zya6s2jmzll', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000bkj2bnqy7uydb', 'cmehicg7g000p3zyavs646cuz', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000ckj2br7ivtj89', 'cmehie0vo000r3zyajv2j6xjj', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000dkj2b28cgq0ti', 'cmehifaxx000t3zya0re8j781', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000ekj2bhmamm1dd', 'cmehigzfo000v3zyasf8ogzqo', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000fkj2bphawuwha', 'cmehij6xl000x3zyaoko7mnn8', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000gkj2b9cr89lxw', 'cmehillwb000z3zya6m1qx2dy', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000hkj2bdwqajn7u', 'cmehimz0g00113zyambeggrfd', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000ikj2bil4bk9qw', 'cmehip9so00153zyaa8wqhnga', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000jkj2buj7u3on4', 'cmehio9z400133zyayfr67mac', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000kkj2bsz9l1omr', 'cmej1clg0000s8g16xtwv6dt1', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000lkj2broxhpjwd', 'cmehitpbp00173zyayovzk9k4', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000mkj2bc2ylbxsj', 'cmej1f4eb000u8g16b075a7hk', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000nkj2bmeubazfv', 'cmej1fwhv000w8g165rxy66ju', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000okj2bqf3s3vxn', 'cmej1gwkz000y8g1674t56im0', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000pkj2b6cbqig8c', 'cmej1ikoo00108g167snrl3jp', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000qkj2bflpspvbo', 'cmej1jicq00128g16j1ff1tjf', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000rkj2blnqha2j3', 'cmej1kcz100148g16k1s9nclz', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000skj2b6f4ghhcy', 'cmej1lj6z00168g16996f7oo4', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000tkj2blszi2hn5', 'cmej1n90q001a8g16txbqz53m', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000ukj2bnpz8uyhs', 'cmej1mciz00188g16ays64gej', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000vkj2b86w54wjn', 'cmej1pbu1001e8g161qkjn2q7', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000wkj2bnkp9phzx', 'cmej1q41b001g8g16h2ql6xyx', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000xkj2bmyls9u09', 'cmej1rupa001k8g167i8eqj0j', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000ykj2b9jqjwii8', 'cmej1r7vj001i8g162aerwvfk', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp000zkj2bob7uun7a', 'cmej1t70e001o8g16dt1wu578', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0010kj2bcm8xqq6e', 'cmej1sljy001m8g16rx2pujk5', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0011kj2bsvbwloq5', 'cmej1uky4001s8g16z11dr8jv', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0012kj2bpl0u49lw', 'cmej1tta2001q8g16mz1ccqij', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0013kj2b9obhpxvg', 'cmej1w8uy001w8g16p1lpnt5f', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0014kj2bd4somdw7', 'cmej1vkq0001u8g16a9j1smaa', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0015kj2bfkytd8x9', 'cmej1y3ay00208g16twdubz6j', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0016kj2b6d4dhe6a', 'cmej1x937001y8g16xobh32nu', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0017kj2bwa7dwivs', 'cmej1zi7k00248g162vardwvt', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0018kj2bi36945ev', 'cmej1ysiz00228g16h36hlp2a', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp0019kj2bwi3m1vgd', 'cmej20y1200288g16mrg3fk0q', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001akj2b0ghax06n', 'cmej208o400268g16tda585c0', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001bkj2b3foapv6j', 'cmej26fhf002i8g16wx3kklpx', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001ckj2bgky7h3kz', 'cmej275eu002k8g16mstontze', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001dkj2bi3hbv6z6', 'cmej28f7l002o8g16zknhj2gw', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001ekj2b0p2mlgfn', 'cmej27s0q002m8g16w9lerapp', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001fkj2b9vlund0v', 'cmek3rjrx002s8g16xfpiyh62', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001gkj2b8hunmjc0', 'cmek3pz1z002q8g16ojhsqi44', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001hkj2bxwewryiq', 'cmek3thga002w8g16fhib2ms3', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001ikj2bzyue6r6l', 'cmek3sna7002u8g161p4p0nmc', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001jkj2brsftqrjh', 'cmek3v67b002y8g16vb6bcfoo', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001kkj2bjok1mwq9', 'cmek3wayg00308g16g7qomlry', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001lkj2brc9dfpme', 'cmekfmwnm000n4t6guygz9ayo', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001mkj2bwzw61wn2', 'cmekfp9bt0001n6rkafvy6i34', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001nkj2b8k2v08ya', 'cmekg4pl10001q1oama498e2i', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73rbpp001okj2bf1cot3vi', 'cmekfriy90003n6rkofuxvehm', 'cmf737paj000g14bcbk1bwisu', '2025-09-05 17:22:02.125');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001rkj2buv0jx572', 'cmeqc37jv00age12uc8t3my3i', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001skj2bwe4gug3u', 'cmeqc67pg00ale12upe9bg8ns', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001tkj2bibup4zm1', 'cmeqc7b0e00ane12uwztkz37d', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001ukj2b2lsw6gaj', 'cmeqca1ef00ape12uze8g51o2', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001vkj2bsy1m1vwj', 'cmeqccqrc00are12uxjkqakes', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');
INSERT INTO public.graphene_update_reports VALUES ('cmf73wd0w001wkj2b1nvw0kka', 'cmeqcfxzy00awe12uf6ocu671', 'cmf73vjxk001pkj2bpxzqkq82', '2025-09-05 17:25:57.104');


--
-- Data for Name: knowledge_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: material_shipments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.material_shipments VALUES ('cmew281rr0009bv3qogguoe30', 'SHIP-2025-08-5222', 'Curia Frankfurt', 'Curia Albany', NULL, 164.00, 'g', 'Micronization', NULL, 'HG103S1', 'micronize to 5um', 'received', NULL, '2025-08-28 23:53:35.223', '2025-08-28 23:53:35.223', NULL);
INSERT INTO public.material_shipments VALUES ('cmf37h914000193joht40kqrp', 'SHIP-2025-09-5846', 'Curia Frankfurt', 'Mork Technologies', NULL, 10.00, 'g', 'Testing', NULL, 'HG101S1', 'To Ben Mork for sizing in lab', 'received', NULL, '2025-09-02 23:55:05.848', '2025-09-02 23:55:05.848', NULL);
INSERT INTO public.material_shipments VALUES ('cmf37lwvt00013mjmv6lx68hs', 'SHIP-2025-09-3366', 'Curia Frankfurt', 'Curia Albany', NULL, 739.00, 'g', 'Micronization', NULL, 'HG101S1', 'micronize to 5um', 'received', NULL, '2025-09-02 23:58:43.385', '2025-09-02 23:58:43.385', NULL);
INSERT INTO public.material_shipments VALUES ('cmf37rl02001222t2j8i0cem8', 'SHIP-2025-09-7919', 'Curia Frankfurt', 'Curia Albany', NULL, 40.00, 'g', 'Micronization', NULL, 'HG100SX', 'micronize to 5um', 'received', NULL, '2025-09-03 00:03:07.921', '2025-09-03 00:03:07.921', NULL);
INSERT INTO public.material_shipments VALUES ('cmf37saby001622t2yrb9ur1v', 'SHIP-2025-09-0748', 'Curia Frankfurt', 'Curia Albany', NULL, 89.00, 'g', 'Micronization', NULL, 'HG102S2', 'micronize to 5um', 'received', NULL, '2025-09-03 00:03:40.75', '2025-09-03 00:03:40.75', NULL);
INSERT INTO public.material_shipments VALUES ('cmf4alauo000xhx77j4wa1bxn', 'SHIP-2025-09-9854', 'Curia Albany', 'GEIC', NULL, 15.95, 'g', 'Testing', NULL, NULL, 'For GEIC Characterization Study', 'received', NULL, '2025-09-03 18:09:59.855', '2025-09-03 18:09:59.855', 'HG101S1_M20');
INSERT INTO public.material_shipments VALUES ('cmf4anjus000zhx77guvwwm9z', 'SHIP-2025-09-4833', 'Curia Frankfurt', 'GEIC', NULL, 1.20, 'g', 'Testing', NULL, 'HG101S1', 'Non Micronized small sample to GEIC', 'received', NULL, '2025-09-03 18:11:44.835', '2025-09-03 18:11:44.835', NULL);


--
-- Data for Name: micronizations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.micronizations VALUES ('cmf3dbph00001yq7e5lwbxs79', 'WBG-AT-1', NULL, 'HG100SX_M5', 4.90, 2.88, 0, NULL, NULL, 'HG100SX', '2025-09-03 02:38:44.896', '2025-09-03 19:16:23.155', NULL, 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3e3hik0001hx77gxi5zb1t', 'WBG-AT-2', NULL, 'HG100SX_M8', 8.58, 5.18, 40, NULL, NULL, 'HG100SX', '2025-09-03 03:00:20.972', '2025-09-03 19:16:23.155', '3.69', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3ebygq0003hx77wpy1l7zn', 'WBG-AT-4-2', NULL, 'HG100SX_M9', 9.10, 7.73, 40, NULL, NULL, 'HG100SX', '2025-09-03 03:06:56.178', '2025-09-03 19:16:23.155', '3.6', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3edk210005hx774sci5oka', 'WBG-AT-5-3', NULL, 'HG100SX_M10P40', 10.00, 6.79, 35, NULL, NULL, 'HG100SX', '2025-09-03 03:08:10.825', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3eej7c0007hx77vu86rpl7', 'WBG-AT-5-4', NULL, 'HG100SX_M10P30', 10.00, 8.21, 30, NULL, NULL, 'HG100SX', '2025-09-03 03:08:56.376', '2025-09-03 19:16:23.155', '4.78', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3efnhe0009hx777n4aujzo', 'WBG-AT-6-2', NULL, 'HG100SX_M20P40', 19.80, 14.09, 40, NULL, NULL, 'HG100SX', '2025-09-03 03:09:48.577', '2025-09-03 19:16:23.155', '5.9', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3eh7fj000bhx77wgx0a7j6', 'WBG-AT-7-2', NULL, 'HG101S1_M20', 19.90, 15.95, 40, NULL, NULL, 'HG101S1', '2025-09-03 03:11:01.087', '2025-09-03 19:16:23.155', '4', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf3ei6jd000dhx77124wasfk', 'WBG-AT-8-2', NULL, 'HG101S1_M100-1', 100.00, 86.20, 40, NULL, NULL, 'HG101S1', '2025-09-03 03:11:46.585', '2025-09-03 19:16:23.155', '4.1', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4abdh8000fhx77emltql7w', 'WBG-AT-9-2', NULL, 'HG101S1_M100-2', 102.16, 91.04, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:02:16.695', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4acsqz000hhx77x4fe5whd', 'WBG-AT-10-2', NULL, 'HG101S1_M100-3', 100.42, 92.49, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:03:23.145', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4adk7j000jhx772xocs0yq', 'WBG-AT-11-2', NULL, 'HG101S1_M100-4', 100.11, 92.83, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:03:58.734', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4ae87y000lhx77g31r37ei', 'WBG-AT-12-2', NULL, 'HG101S1_M100-5', 101.14, 92.43, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:04:29.853', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4aezdc000nhx77nt2wrjav', 'WBG-AT-13-2', NULL, 'HG101S1_M100-6', 102.75, 96.24, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:05:05.04', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4afq1n000phx77lp16pgm7', 'WBG-AT-14-2', NULL, 'HG101S1_M100-7', 120.28, 111.84, 40, NULL, NULL, 'HG101S1', '2025-09-03 18:05:39.611', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4ahqh4000thx77sj6eb4gb', 'WBG-AT-17-2', NULL, 'HG103S1_M80-2', 81.99, 78.04, 40, NULL, NULL, 'HG103S1', '2025-09-03 18:07:13.479', '2025-09-03 19:16:23.155', '', 'Curia Albany');
INSERT INTO public.micronizations VALUES ('cmf4aj6fl000vhx77t6rdbknc', 'WBG-AT-16-2', NULL, 'HG103S1_M80-1', 82.03, 77.77, 40, NULL, NULL, 'HG103S1', '2025-09-03 18:08:20.816', '2025-09-03 19:16:23.155', '', 'Curia Albany');


--
-- Data for Name: news_articles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.news_articles VALUES ('cmfbrb5wj0095mb9h08dcne7f', 'Graphene heat dissipation boosts micro-LED performance for AR displays', 'Shanghai University researchers have designed a blue-green light micro-LED for Augmented Reality Heads-up Displays (AR-HUD) using COMSOL software, coupling photo-thermal properties with multi-physical fields. By incorporating a graphene film and heat sink for heat dissipation, the thermal management scheme of the micro-LED was further optimized. 
The effect of graphene film thickness on heat dissipation performance was investigated, with the aim to improve photoelectric conversion efficiency and reduce the impact of high junction temperature on device reliability and performance.', '<p>Shanghai University researchers have designed a blue-green light <a href="https://www.microled-info.com/introduction">micro-LED</a> for Augmented Reality Heads-up Displays (AR-HUD) using COMSOL software, coupling photo-thermal properties with multi-physical fields. By incorporating a graphene film and heat sink for heat dissipation, the thermal management scheme of the micro-LED was further optimized.&nbsp;</p><p>The effect of graphene film thickness on heat dissipation performance was investigated, with the aim to improve photoelectric conversion efficiency and reduce the impact of high junction temperature on device reliability and performance.</p>', 'https://www.graphene-info.com/graphene-heat-dissipation-boosts-micro-led-performance-ar-displays', '2025-09-01 14:50:46', '2025-09-08 23:32:23.587', 'RESEARCH_BREAKTHROUGH', 1.20, 'e87df17bf12953c64624ec91dd0e03c7', '{}', '{graphene,research}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.587', '2025-09-09 23:41:52.697', '**Summary:**

Researchers at Shanghai University have achieved a breakthrough in micro-LED technology for Augmented Reality Heads-up Displays (AR-HUD) by integrating graphene for enhanced heat dissipation. This innovation significantly improves thermal management, leading to higher photoelectric conversion efficiency compared to existing micro-LED solutions. 

The commercialization timeline is projected within 2-3 years, with potential applications in consumer electronics, automotive displays, and wearable tech. The market opportunity for AR displays is estimated to reach $198 billion by 2025, driven by increasing demand for immersive experiences.

This advancement is particularly relevant to energy storage and supercapacitor technologies, as graphene''s thermal properties can also enhance energy efficiency in these applications, positioning companies to leverage dual benefits in product development', NULL, true, 1, '2025-09-09 23:41:52.696', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wh0093mb9hxesajq89', 'Korean researchers develop silicon-graphene composite anode material for lithium-ion batteries, plan to move it into mass production', 'The Korea Electrotechnology Research Institute (KERI) has announced it is preparing to move its silicon-graphene composite anode material for lithium-ion batteries into mass production, a step that could extend the range of electric vehicles and improve battery performance in consumer electronics.
Silicon has long been regarded as a promising alternative to graphite, the standard anode material in lithium-ion batteries, because it can store roughly 10 times more energy. But its tendency to swell and crack during charging cycles, coupled with low electrical conductivity, has limited its use. Researchers at the government-funded institute said they had overcome those hurdles by combining silicon with graphene. In the composite, graphene forms a mesh-like coating around silicon particles, reducing structural degradation and improving stability.', '<p>The Korea Electrotechnology Research Institute (KERI) has announced it is preparing to move its silicon-graphene composite anode material for lithium-ion batteries into mass production, a step that could extend the range of electric vehicles and improve battery performance in consumer electronics.</p><p>Silicon has long been regarded as a promising alternative to graphite, the standard anode material in lithium-ion batteries, because it can store roughly 10 times more energy. But its tendency to swell and crack during charging cycles, coupled with low electrical conductivity, has limited its use. Researchers at the government-funded institute said they had overcome those hurdles by combining silicon with graphene. In the composite, graphene forms a mesh-like coating around silicon particles, reducing structural degradation and improving stability.</p>', 'https://www.graphene-info.com/korean-researchers-develop-silicon-graphene-composite-anode-material-lithium', '2025-09-03 06:57:29', '2025-09-08 23:32:23.585', 'RESEARCH_BREAKTHROUGH', 2.40, '48504e16a5307db4f8fd286c1743816f', '{}', '{graphene,conductivity,battery,composite,research}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.585', '2025-09-09 23:41:56.773', 'Korean researchers at the Korea Electrotechnology Research Institute (KERI) have developed a silicon-graphene composite anode for lithium-ion batteries, poised for mass production. This breakthrough significantly enhances energy storage capacity—potentially storing 10 times more energy than traditional graphite anodes—while addressing issues of swelling and cracking that have historically hindered silicon''s adoption. 

Commercialization is expected within the next 12-18 months, targeting the rapidly growing electric vehicle and consumer electronics markets, which are projected to exceed $100 billion annually. This innovation is particularly relevant to energy storage solutions, as it promises to improve battery performance and longevity, thereby accelerating the transition to electric mobility and enhancing consumer electronics efficiency. Companies should consider partnerships or investments in this technology', NULL, true, 1, '2025-09-09 23:41:56.772', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wf0091mb9h2aecfeq2', 'Graphene Manufacturing Group secures US$5 million in public offering', 'Graphene Manufacturing Group (GMG) has announced it has closed a bought deal public offering, raising C$6.9 million (around US$5 million).
The proceeds will be used to support ongoing operations, including commercial and product development. The offering was managed by Red Cloud Securities and is expected to boost GMG’s efforts in scaling up its operations and expanding its market presence in the clean technology sector.', '<p><a href="https://www.graphene-info.com/graphene-manufacturing-group-gmg">Graphene Manufacturing Group (GMG)</a> has announced it has closed a bought deal public offering, raising C$6.9 million (around US$5 million).</p><p>The proceeds will be used to support ongoing operations, including commercial and product development. The offering was managed by Red Cloud Securities and is expected to boost GMG’s efforts in scaling up its operations and expanding its market presence in the clean technology sector.</p>', 'https://www.graphene-info.com/graphene-manufacturing-group-secures-us5-million-public-offering', '2025-09-04 05:17:31', '2025-09-08 23:32:23.584', 'MARKET_ANALYSIS', 1.00, 'e81b1ad56f353635b467f3a1e2ffb4ab', '{}', '{graphene,manufacturing}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.584', '2025-09-09 23:42:00.729', 'Graphene Manufacturing Group (GMG) has successfully raised approximately US$5 million through a public offering, signaling a strong market opportunity in the clean technology sector, particularly in graphene applications. The global graphene market is projected to grow at a CAGR of 38.7%, reaching an estimated US$1.5 billion by 2028, driven by increasing demand in energy storage and other advanced materials.

Key players include GMG and Red Cloud Securities, which managed the offering. Investors should consider the implications of GMG''s capital infusion, as it positions the company to enhance product development and scale operations, potentially capturing a larger market share.

This investment aligns with the broader energy storage market, where graphene''s unique properties can significantly improve battery performance, presenting a', NULL, true, 1, '2025-09-09 23:42:00.729', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wb008xmb9hqg30bupy', 'Midea unveils multi-functional oven featuring graphene teating tech', 'Midea, a global producer of smart home and lifestyle solutions, has unveiled the Midea Wave Range - a multi-functional free-standing oven that integrates microwave and graphene heating technologies, with emphasis on its applicability for compact European kitchens and efficient cooking. Key innovations and technical features include the incorporation of graphene heating tubes and integrated appliance design tailored to user needs in small domestic spaces.

  
  
    
    




  

The lower oven in the Wave Range uses graphene-enhanced heating tubes, which leverage graphene’s high thermal conductivity, electrical efficiency, and resilience at high temperatures. Laboratory assessments report that these tubes are capable of reaching temperatures up to 1300°C within 0.2 seconds, significantly reducing or eliminating traditional preheating times. This advancement could translate to shorter cooking durations and a reduction in energy usage, while the emission of near-infrared radiation facili', '<p>Midea, a global producer of smart home and lifestyle solutions, has unveiled the Midea Wave Range - a multi-functional free-standing oven that integrates microwave and graphene heating technologies, with emphasis on its applicability for compact European kitchens and efficient cooking. Key innovations and technical features include the incorporation of graphene heating tubes and integrated appliance design tailored to user needs in small domestic spaces.</p><div class="align-center">
  
  <a href="https://www.graphene-info.com/sites/default/files/2025-09/Midea-launches-graphene-based-oven-image.jpg" target="_blank">
    
    <img loading="lazy" src="https://www.graphene-info.com/sites/default/files/styles/large/public/2025-09/Midea-launches-graphene-based-oven-image.jpg?itok=7zrVq8pw" width="400" height="300" alt="Midea''s new graphene-based cooking oven image" typeof="Image" class="image-style-large">




  </a>
</div>
<p>The lower oven in the Wave Range uses graphene-enhanced heating tubes, which leverage graphene’s high thermal conductivity, electrical efficiency, and resilience at high temperatures. Laboratory assessments report that these tubes are capable of reaching temperatures up to 1300°C within 0.2 seconds, significantly reducing or eliminating traditional preheating times. This advancement could translate to shorter cooking durations and a reduction in energy usage, while the emission of near-infrared radiation facilitates uniform browning and moisture retention in food—a result said to be documented in comparative studies with conventional quartz and metal heating tubes.</p>', 'https://www.graphene-info.com/midea-unveils-multi-functional-oven-featuring-graphene-teating-tech', '2025-09-07 10:16:52', '2025-09-08 23:32:23.58', 'INDUSTRY_NEWS', 1.50, '3f4b2f156912a707bf534f53ac1977e3', '{https://www.graphene-info.com/sites/default/files/styles/large/public/2025-09/Midea-launches-graphene-based-oven-image.jpg?itok=7zrVq8pw}', '{graphene,conductivity}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.58', '2025-09-09 23:42:05.517', '**Key Development:** Midea has launched the Wave Range, a multi-functional oven that utilizes graphene heating technology alongside traditional microwave functions.

**Why It Matters for Business:** This innovation addresses the growing demand for efficient cooking solutions in compact living spaces, particularly in Europe, where kitchen size is often limited. By integrating advanced materials like graphene, Midea positions itself as a leader in smart home technology.

**Opportunities or Risks Created:** The introduction of graphene heating could open new markets and enhance product differentiation. However, reliance on emerging materials like graphene may pose supply chain risks and require significant investment in R&D.

**Industry Implications:** The move signifies a shift towards energy-efficient appliances, potentially influencing competitors to adopt similar technologies. It may also accelerate trends in smart', NULL, true, 1, '2025-09-09 23:42:05.516', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wo009bmb9hkppggf8p', 'Plastic 2 Green achieves breakthrough in turning plastic into graphene', 'Technology startup Plastic 2 Green has reported a “promising breakthrough” in converting plastic scrap into carbon products and carbon-free fuels.
The company says it successfully produced nitrogen-doped graphene from plastic scrap in a laboratory, a milestone tested and confirmed through advanced transmission electron microscopy at Colorado State University, with upcoming independent evaluation of its Raman Spectroscopy data from the Technical University of Munich.', '<p>Technology startup Plastic 2 Green has reported a “promising breakthrough” in converting plastic scrap into carbon products and carbon-free fuels.</p><p>The company says it successfully produced nitrogen-doped graphene from plastic scrap in a laboratory, a milestone tested and confirmed through advanced transmission electron microscopy at Colorado State University, with upcoming independent evaluation of its Raman Spectroscopy data from the Technical University of Munich.</p>', 'https://www.graphene-info.com/plastic-2-green-achieves-breakthrough-turning-plastic-graphene', '2025-08-30 09:29:04', '2025-09-08 23:32:23.592', 'RESEARCH_BREAKTHROUGH', 1.30, '63bd96e2b6e6161c64877d342e652878', '{}', '{graphene,breakthrough}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.592', '2025-09-09 23:41:37.837', 'Plastic 2 Green has achieved a significant breakthrough by successfully converting plastic scrap into nitrogen-doped graphene, a valuable material for energy storage and supercapacitors. This innovation enhances existing graphene production methods by utilizing waste plastics, thereby reducing environmental impact and production costs. The technology is expected to be commercialized within the next 2-3 years, positioning the company to capitalize on the growing demand for sustainable materials. The global market for graphene is projected to reach $1.5 billion by 2028, driven by its applications in energy storage and advanced materials. This development aligns with the increasing focus on sustainable energy solutions and circular economy principles, making it highly relevant for industries seeking eco-friendly alternatives. Executives should consider potential partnerships or investments in this technology to', NULL, true, 1, '2025-09-09 23:41:37.835', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wm0099mb9hbjjceuwz', 'Graphene Composites unveils next-gen graphene-enhanced ballistic and blast protection', 'Graphene Composites (GC), a UK-based advanced materials engineering company, has developed next-generation ballistic and blast protection with its graphene-enhanced GC Shield® technology.

  
  
    
    




  

GC’s RF2 Shield performs to STANAG 4569/AEP-55 Level 1 for superior blast and ballistic protection for armored vehicles, achieving up to 30% weight reduction versus standard vehicle armors. The technology features an unrivalled ability to disperse and reflect impact force – making it highly effective against blast threats.', '<p><a href="https://www.graphene-info.com/graphene-composites-company">Graphene Composites (GC)</a>, a UK-based advanced materials engineering company, has developed next-generation ballistic and blast protection with its graphene-enhanced GC Shield® technology.</p><div class="align-center">
  
  <a href="https://www.graphene-info.com/sites/default/files/2025-08/GC-Shield-image.jpg" target="_blank">
    
    <img loading="lazy" src="https://www.graphene-info.com/sites/default/files/styles/large/public/2025-08/GC-Shield-image.jpg?itok=mrTkP8Jk" width="400" height="163" alt="GC Shield image" typeof="Image" class="image-style-large">




  </a>
</div>
<p>GC’s RF2 Shield performs to STANAG 4569/AEP-55 Level 1 for superior blast and ballistic protection for armored vehicles, achieving up to 30% weight reduction versus standard vehicle armors. The technology features an unrivalled ability to disperse and reflect impact force – making it highly effective against blast threats.</p>', 'https://www.graphene-info.com/graphene-composites-unveils-next-gen-graphene-enhanced-ballistic-and-blast', '2025-08-30 14:17:33', '2025-09-08 23:32:23.59', 'COMPANY_NEWS', 1.30, '8f426b4187c4af84858d7cd1d6faf2ea', '{https://www.graphene-info.com/sites/default/files/styles/large/public/2025-08/GC-Shield-image.jpg?itok=mrTkP8Jk}', '{graphene,composite}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.59', '2025-09-09 23:41:41.892', 'Graphene Composites (GC) has announced the launch of its next-generation graphene-enhanced ballistic and blast protection technology, the GC Shield®. This innovation meets STANAG 4569/AEP-55 Level 1 standards, positioning GC as a leader in advanced protective materials.

Strategically, this move enhances GC''s market position in defense and security sectors, catering to increasing demand for lightweight, durable protective solutions. The introduction of GC Shield® could disrupt the competitive landscape, compelling rivals to innovate or enhance their offerings.

This development opens potential partnership opportunities with defense contractors and government agencies seeking advanced protective gear. Additionally, it underscores the relevance of graphene in the supply chain, particularly in high-performance applications, which could lead to increased collaboration with hemp-based', NULL, true, 1, '2025-09-09 23:41:41.892', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wp009dmb9h014rt706', 'First Graphene partnership sees graphene as a way to improve efficiency and reduce cost of PSCs', 'First Graphene has reported the addition of graphene to perovskite solar cells (PSC) can improve efficiency to up to 30.6% and reduce production costs by up to 80%.
The company has partnered with Halocell Energy and Queensland University of Technology to develop graphene-enhanced PSCs through the addition of its PureGRAPH novel functionalized graphene. A three-year AU$2.03 million grant under the federal government’s Co-operative Research Centers Projects (CRC-P) program is funding the research and development agreement, which commenced in 2023.', '<p><a href="https://www.graphene-info.com/first-graphene">First Graphene</a> has reported the addition of graphene to perovskite solar cells (PSC) can improve efficiency to up to 30.6% and reduce production costs by up to 80%.</p><p>The company has <a href="https://www.perovskite-info.com/halocell-and-first-graphene-enter-agreement-supply-graphene-perovskite-solar">partnered</a> with <a href="https://www.perovskite-info.com/halocell-energy">Halocell Energy</a> and Queensland University of Technology <a href="https://www.perovskite-info.com/halocell-and-first-graphene-enter-agreement-supply-graphene-perovskite-solar">to develop graphene-enhanced PSCs through the addition of its PureGRAPH novel functionalized graphene</a>. A three-year AU$2.03 million grant under the federal government’s Co-operative Research Centers Projects (CRC-P) program is funding the research and development agreement, which commenced in 2023.</p>', 'https://www.graphene-info.com/first-graphene-partnership-sees-graphene-way-improve-efficiency-and-reduce-cost', '2025-08-28 06:52:56', '2025-09-08 23:32:23.594', 'RESEARCH_BREAKTHROUGH', 1.20, 'a78fbdc740b600ac6828afbcd421e701', '{}', '{graphene,research}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.594', '2025-09-09 23:41:33.049', 'First Graphene has achieved a significant breakthrough by integrating graphene into perovskite solar cells (PSCs), enhancing their efficiency to 30.6% while simultaneously reducing production costs by up to 80%. This advancement surpasses existing solar technologies, which typically offer lower efficiency and higher manufacturing expenses. The commercialization timeline is projected within the next 2-3 years, as the partnership with Halocell Energy and Queensland University of Technology accelerates development. The global solar energy market is expected to reach $223 billion by 2026, presenting a substantial opportunity for graphene-enhanced PSCs. This innovation is particularly relevant to energy storage and supercapacitors, as improved solar cell efficiency can lead to more effective energy capture and storage solutions, positioning First', NULL, true, 1, '2025-09-09 23:41:33.048', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5wk0097mb9hdswedyyb', 'Graphene-Info publishes a new edition of its Graphene Supercapacitors Market Report', 'Today we published a new edition of our Graphene Supercapacitors Market Report, with all the latest information. The supercapacitor market and industry is facing high demand and graphene is a pivotal material for this application. The report is now updated to September 2025, with all the latest projects, news and research results.

  
  
    
    




  

Reading this report, you''ll learn all about:

The advantages of using graphene in supercapacitors
Various types of graphene materials
Market insights and forecasts
What''s on the market today

The report package also provides:

A list of all graphene companies involved with supercapacitors
Prominent research activity in this field
Free updates for a year

This Graphene Supercapacitors market report provides a great introduction to graphene materials used in the supercapacitor market, and covers everything you need to know about graphene in this niche. This is a great guide for anyone involved with the supercapacitor market, nanomateria', '<p>Today we published a new edition of our&nbsp;<a href="https://www.graphene-info.com/services/market-reports/graphene-supercapacitors-market-report" data-mce-href="https://www.graphene-info.com/services/market-reports/graphene-supercapacitors-market-report"><strong>Graphene Supercapacitors Market Report</strong></a>, with all the latest information. The supercapacitor market and industry is facing high demand and graphene is a pivotal material for this application. The report is now updated to September 2025, with all the latest projects, news and research results.</p><div class="align-center">
  
  <a href="https://www.graphene-info.com/sites/default/files/2024-04/graphene-supercaps-report-cover.jpg" target="_blank">
    
    <img loading="lazy" src="https://www.graphene-info.com/sites/default/files/styles/large/public/2024-04/graphene-supercaps-report-cover.jpg?itok=xBxnblnZ" width="300" height="280" alt="Graphene super capacitors market report cover" typeof="Image" class="image-style-large">




  </a>
</div>
<h2>Reading this report, you''ll learn all about:</h2><ul><li>The advantages of using graphene in supercapacitors</li><li>Various types of graphene materials</li><li>Market insights and forecasts</li><li>What''s on the market today</li></ul><h2>The report package also provides:</h2><ul><li>A list of all graphene companies involved with supercapacitors</li><li>Prominent research activity in this field</li><li>Free updates for a year</li></ul><p>This Graphene Supercapacitors market report provides a great introduction to graphene materials used in the supercapacitor market, and covers everything you need to know about graphene in this niche. This is a great guide for anyone involved with the supercapacitor market, nanomaterials, electric vehicles and mobile devices.</p>', 'https://www.graphene-info.com/graphene-info-publishes-new-edition-its-graphene-supercapacitors-market-3', '2025-09-01 08:27:30', '2025-09-08 23:32:23.589', 'RESEARCH_BREAKTHROUGH', 1.80, '48abce647aafd32e1c8b5efd4386e7e9', '{https://www.graphene-info.com/sites/default/files/styles/large/public/2024-04/graphene-supercaps-report-cover.jpg?itok=xBxnblnZ}', '{graphene,nanomaterial,research}', 'Ron Mertens', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 1, '2025-09-08 23:32:23.589', '2025-09-10 00:57:24.055', 'A significant breakthrough in the graphene supercapacitor market has been achieved, highlighting graphene''s role as a crucial material in enhancing energy storage solutions. This advancement improves upon existing technologies by increasing energy density, reducing charging times, and extending the lifecycle of supercapacitors, making them more efficient and cost-effective. The timeline for commercialization is projected for late 2025, aligning with the growing demand for advanced energy storage systems. The market opportunity is substantial, with estimates suggesting a potential worth of over $10 billion by 2030, driven by applications in electric vehicles, renewable energy, and consumer electronics. This innovation is particularly relevant for businesses focused on energy storage solutions, as it positions them to leverage cutting-edge materials like graphene to meet rising energy demands and sustainability', NULL, true, 1, '2025-09-09 23:41:45.624', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfh148na0093ug5pnxj2xz7w', 'ISO publishes new standards for graphene-related 2D materials', 'The International Organization for Standardization (ISO) recently published two new standards for graphene-related 2D materials, a step forward in supporting the growth of the global graphene industry.
This development is part of an ongoing international effort to bring consistency and comparability to the graphene ecosystem. Over the past several years, multiple organizations, consortia, and research bodies have worked to define reliable frameworks for classification, measurement, and reporting. These new documents from ISO represent another piece of that puzzle, helping ensure that graphene materials can be evaluated and traded on a global scale with transparency and confidence.', '<p>The International Organization for Standardization (ISO) recently published two new standards for graphene-related 2D materials, a step forward in supporting the growth of the global graphene industry.</p><p>This development is part of an ongoing international effort to bring consistency and comparability to the graphene ecosystem. Over the past several years, multiple organizations, consortia, and research bodies have worked to define reliable frameworks for classification, measurement, and reporting. These new documents from ISO represent another piece of that puzzle, helping ensure that graphene materials can be evaluated and traded on a global scale with transparency and confidence.</p>', 'https://www.graphene-info.com/iso-publishes-new-standards-graphene-related-2d-materials', '2025-09-11 04:03:40', '2025-09-12 16:05:47.591', 'RESEARCH_BREAKTHROUGH', 9.42, '288a35614e449a8750edc234c0134e99', '{/news-images/78fcbd33767b614e89d46a6bc965def9.jpg,/news-images/54463d54e1adcd92627be485b61dab26.jpg,/news-images/1683f5de8821a7c85a9dc5344d0a8119.gif,/news-images/054b7e0f6cca045b156894597d42ba33.gif,/news-images/55fde2cf20cf79f25c0d1acb0dcdd6a5.png}', '{graphene,"2d material",research}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 1, '2025-09-12 16:05:47.591', '2025-09-13 23:09:46.624', 'The ISO''s recent publication of new standards for graphene-related 2D materials marks a significant breakthrough in the graphene industry, enhancing consistency and comparability across the sector. This advancement improves upon existing technology by providing a reliable framework for classification, measurement, and reporting, which can accelerate innovation and adoption in various applications, including energy storage and supercapacitors.

The timeline for commercialization is expected to be within 1-3 years as companies align their products with these standards. The global market opportunity for graphene is projected to exceed $10 billion by 2025, driven by demand in electronics, energy storage, and advanced materials.

For businesses, this development is crucial as it paves the way for more reliable and efficient energy storage solutions, potentially transforming the super', NULL, true, 1, '2025-09-12 16:05:51.225', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfh147s8008jug5poah5i9uh', 'Covalent cross-linked graphene oxide aerogels for moisture adsorption', 'Covalent cross-linking is an effective approach to enhance the hydrophilicity and water adsorption properties of graphene oxide (GO). We studied moisture absorption in GO cross-linked with poly(ethylene glycol) diamines. At relative humidity (RH) of 85%, the PEG-cross-linked GO exhibited a significantly enhanced water uptake capacity of 0.59 g of water per gram of GO (gg−1), compared to 0.37 for unmodified GO. This is attributed to the presence of alkoxy groups via cross-linking, resulting in the enhanced interaction between GO and water molecules. These findings highlight the potential of PEG-based covalent functionalisation for efficient moisture capture in GO-based materials.', 'Covalent cross-linking is an effective approach to enhance the hydrophilicity and water adsorption properties of graphene oxide (GO). We studied moisture absorption in GO cross-linked with poly(ethylene glycol) diamines. At relative humidity (RH) of 85%, the PEG-cross-linked GO exhibited a significantly enhanced water uptake capacity of 0.59 g of water per gram of GO (gg−1), compared to 0.37 for unmodified GO. This is attributed to the presence of alkoxy groups via cross-linking, resulting in the enhanced interaction between GO and water molecules. These findings highlight the potential of PEG-based covalent functionalisation for efficient moisture capture in GO-based materials.', 'http://iopscience.iop.org/article/10.1088/2053-1583/ae01ba', '2025-09-10 23:00:00', '2025-09-12 16:05:46.473', 'INDUSTRY_NEWS', 10.00, 'cc39a164c87411338a9986250e2be9e2', '{/news-images/baf8a68891130271c3331a7fa110a321.gif,/news-images/a6ead9acc5af34cb22c78a05ed144ef7.jpg}', '{graphene}', 'Zhijian Cao, Xiaojun Ren, Tongxi Lin, Yuta Nishina, Masamichi Yoshimura and Rakesh Joshi', 1, 'cmfbraghi0004yzw7et1vahzw', false, 0, '2025-09-12 16:05:46.473', '2025-09-12 16:05:50.185', '**Key Development:** Recent research has demonstrated that covalent cross-linking of graphene oxide (GO) with poly(ethylene glycol) diamines significantly enhances its moisture adsorption properties, increasing water uptake from 0.37 g/g to 0.59 g/g at 85% relative humidity.

**Why It Matters for Business:** This advancement in GO technology can lead to improved materials for various applications, including energy storage, filtration, and environmental remediation, potentially reducing costs and increasing efficiency.

**Opportunities or Risks Created:** Companies can leverage this technology to develop superior moisture management solutions, particularly in energy storage systems where humidity control is critical. However, the need for specialized manufacturing processes may pose initial investment risks.

**Industry Implications:** Enhanced moisture adsorption capabilities', NULL, true, 1, '2025-09-12 16:05:50.183', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfh148z40097ug5pjvoe42ra', 'Black Swan Graphene updates on customer trials ', 'Black Swan Graphene has reported performance results from production-scale trials conducted by one of its partners, a global masterbatch manufacturer, including testing at end-customer facilities. 
For one marquee consumer-products program, Black Swan was advised that its graphene-enhanced formulation delivered superior results versus alternative materials evaluated by that specific customer, reinforcing the Company''s view that its approach to Graphene-Enhanced Masterbatch™ ("GEM™") is highly competitive in targeted high-volume applications. Customers and application details have not been disclosed for commercial reasons, according to Black Swan Graphene.', '<p><a href="https://www.graphene-info.com/black-swan-graphene">Black Swan Graphene</a> has reported performance results from production-scale trials conducted by one of its partners, a global masterbatch manufacturer, including testing at end-customer facilities.&nbsp;</p><p>For one marquee consumer-products program, Black Swan was advised that its graphene-enhanced formulation delivered superior results versus alternative materials evaluated by that specific customer, reinforcing the Company''s view that its approach to Graphene-Enhanced Masterbatch™ ("GEM™") is highly competitive in targeted high-volume applications. Customers and application details have not been disclosed for commercial reasons, according to Black Swan Graphene.</p>', 'https://www.graphene-info.com/black-swan-graphene-updates-customer-trials', '2025-09-10 04:02:26', '2025-09-12 16:05:48.016', 'COMPANY_NEWS', 7.45, '6d6b309b414dcd3b153f75cedbbfa6c8', '{/news-images/15b60cd05ff4b6320fe932ec78518f37.jpg,/news-images/ed4f65fcc56451bf13ee5702f92c423f.jpg,/news-images/72451a734e5dee2c020ed55ab174b6f2.png,/news-images/13d1f02927ab82065d9f9d0194801043.jpg,/news-images/1683f5de8821a7c85a9dc5344d0a8119.gif}', '{graphene}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-12 16:05:48.016', '2025-09-12 16:05:52.031', 'Black Swan Graphene has announced positive performance results from production-scale trials of its graphene-enhanced formulations, conducted by a global masterbatch manufacturer. This development is strategically significant as it validates the effectiveness of their Graphene-Enhanced Masterbatch™ (GEM™) technology, positioning Black Swan as a leader in the graphene market.

The successful trials could reshape the competitive landscape by attracting more customers seeking advanced materials, thereby increasing market share. This opens potential partnership opportunities with other manufacturers looking to leverage graphene’s benefits in their products.

Furthermore, the advancements in graphene technology may enhance the supply chain for both graphene and hemp, as the integration of these materials in consumer products could drive demand and innovation. Black Swan should consider strategic alliances or acquisitions to expand its capabilities and', NULL, true, 1, '2025-09-12 16:05:52.027', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb3sv008nmb9hxhdd4f0w', 'Highly efficient lateral spin valve device based on graphene/hBN/Fe3GeTe2', 'In this work we report efficient out-of-plane spin injection and detection in an all-van der Waals based heterostructure using only exfoliated 2D materials. We demonstrate spin injection by measuring spin-valve and Hanle signals in non-local transport in a stack of Fe3GeTe2 (FGT), hexagonal boron nitride (hBN) and graphene layers. FGT flakes form the spin aligning electrodes necessary to inject and detect spins in the graphene channel. The hBN tunnel barrier provides a high-quality interface between the ferromagnetic electrodes and graphene, eliminating the conductivity mismatch problem, thus ensuring efficient spin injection and detection with spin injection efficiencies of up to P = 40%. Our results demonstrate that FGT/hBN/graphene heterostructures form a promising platform for realizing 2D van der Waals spintronic devices.', 'In this work we report efficient out-of-plane spin injection and detection in an all-van der Waals based heterostructure using only exfoliated 2D materials. We demonstrate spin injection by measuring spin-valve and Hanle signals in non-local transport in a stack of Fe3GeTe2 (FGT), hexagonal boron nitride (hBN) and graphene layers. FGT flakes form the spin aligning electrodes necessary to inject and detect spins in the graphene channel. The hBN tunnel barrier provides a high-quality interface between the ferromagnetic electrodes and graphene, eliminating the conductivity mismatch problem, thus ensuring efficient spin injection and detection with spin injection efficiencies of up to P = 40%. Our results demonstrate that FGT/hBN/graphene heterostructures form a promising platform for realizing 2D van der Waals spintronic devices.', 'http://iopscience.iop.org/article/10.1088/2053-1583/adf453', '2025-08-05 23:00:00', '2025-09-08 23:32:20.864', 'INDUSTRY_NEWS', 2.30, '7b93b1c021f59c78c53cfa0df0b22201', '{}', '{graphene,"2d material",conductivity}', 'Jan Bärenfänger, Klaus Zollner, Lukas Cvitkovich, Kenji Watanabe, Takashi Taniguchi, Stefan Hartl, Jaroslav Fabian, Jonathan Eroms, Dieter Weiss and Mariusz Ciorga', 1, 'cmfbraghi0004yzw7et1vahzw', false, 0, '2025-09-08 23:32:20.864', '2025-09-09 23:42:12.804', '**Key Development:** Researchers have achieved efficient out-of-plane spin injection and detection using a heterostructure of graphene, hexagonal boron nitride (hBN), and Fe3GeTe2, enhancing the performance of spintronic devices.

**Why It Matters:** This advancement addresses the conductivity mismatch problem in spintronic applications, potentially leading to faster and more efficient data processing technologies. Businesses in electronics and computing should monitor this closely as it could revolutionize data storage and transfer.

**Opportunities/Risks:** The development opens opportunities for companies to innovate in spintronic devices, enhancing performance in quantum computing and memory storage. However, firms not adapting to this technology may face obsolescence.

**Industry Implications:** The integration of', NULL, true, 1, '2025-09-09 23:42:12.803', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb5w9008vmb9hnkheaj29', 'First Graphene and Hazer Group enter MOU to advance high-value graphite applications', 'First Graphene and Hazer Group have signed a nonbinding Memorandum of Understanding (MOU) under which they will collaborate to identify and assess applications where graphite produced via the proprietary Hazer® Process may offer technical and/or commercial advantages to First Graphene’s product lines.
The collaboration focuses on evaluating the suitability of Hazer graphite in First Graphene’s product development, aiming to support innovation and expand market opportunities for both parties. The parties intend to explore commercial options following assessment and testing in relation to supply and offtake agreements.', '<p><a href="https://www.graphene-info.com/first-graphene">First Graphene</a> and Hazer Group have signed a nonbinding Memorandum of Understanding (MOU) under which they will collaborate to identify and assess applications where graphite produced via the proprietary Hazer® Process may offer technical and/or commercial advantages to First Graphene’s product lines.</p><p>The collaboration focuses on evaluating the suitability of Hazer graphite in First Graphene’s product development, aiming to support innovation and expand market opportunities for both parties. The parties intend to explore commercial options following assessment and testing in relation to supply and offtake agreements.</p>', 'https://www.graphene-info.com/first-graphene-and-hazer-group-enter-mou-advance-high-value-graphite', '2025-09-08 07:12:09', '2025-09-08 23:32:23.578', 'MARKET_ANALYSIS', 1.00, '0585b7090244d938329fe4ed40ac07c4', '{}', '{graphene}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', false, 0, '2025-09-08 23:32:23.578', '2025-09-09 23:42:09.16', 'The collaboration between First Graphene and Hazer Group presents a significant opportunity in the high-value graphite applications market, particularly in energy storage solutions. The global graphite market is projected to reach $22 billion by 2027, growing at a CAGR of 5.5%. Key players include First Graphene and Hazer Group, both poised to leverage their proprietary technologies for competitive advantage.

Investors should consider the strategic implications of this partnership, as it may enhance product offerings and market penetration for both companies, potentially leading to increased revenue streams. The connection to the energy storage market is crucial, as advanced graphite materials are essential for improving battery performance and efficiency. This collaboration could position both firms favorably within the rapidly expanding energy storage sector, aligning with the broader', NULL, true, 1, '2025-09-09 23:42:09.159', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb6s000d9mb9hnfjbqfjy', 'Strongly Entangled Kondo and Kagome Lattices and the Emergent Magnetic Ground State in Heavy-Fermion Kagome Metal YbV$_6$Sn$_6$', 'arXiv:2509.04641v1 Announce Type: cross 
Abstract: Applying angle-resolved photoemission spectroscopy and density functional theory calculations, we present compelling spectroscopic evidence demonstrating the intertwining and mutual interaction between the Kondo and kagome sublattices in heavy-fermion intermetallic compound YbV$_6$Sn$_6$. We reveal the Yb 4$f$-derived states near the Fermi level, along with the presence of bulk kagome bands and topological surface states. We unveil strong interactions between the 4$f$ and itinerant electrons, where the kagome bands hosting the Dirac fermions and van Hove singularities predominate. Such findings are well described using a $c$-$f$ hybridization model. On the other hand, our systematic characterization of magnetic properties demonstrates an unusually enhanced antiferromagnetic ordering, where the kagome-derived van Hove singularities near $E_F$ play a vital role in determining the unconventional nature of the Ruderman-Kittel-Kasuya-Yosida', 'arXiv:2509.04641v1 Announce Type: cross 
Abstract: Applying angle-resolved photoemission spectroscopy and density functional theory calculations, we present compelling spectroscopic evidence demonstrating the intertwining and mutual interaction between the Kondo and kagome sublattices in heavy-fermion intermetallic compound YbV$_6$Sn$_6$. We reveal the Yb 4$f$-derived states near the Fermi level, along with the presence of bulk kagome bands and topological surface states. We unveil strong interactions between the 4$f$ and itinerant electrons, where the kagome bands hosting the Dirac fermions and van Hove singularities predominate. Such findings are well described using a $c$-$f$ hybridization model. On the other hand, our systematic characterization of magnetic properties demonstrates an unusually enhanced antiferromagnetic ordering, where the kagome-derived van Hove singularities near $E_F$ play a vital role in determining the unconventional nature of the Ruderman-Kittel-Kasuya-Yosida interaction and Kondo coupling. These unique kagome-state-mediated exchange interactions have never been reported before and could lead to a novel phase diagram and various quantum critical behaviors in YbV$_6$Sn$_6$ and its siblings. Our results not only expand the family of exotic quantum phases entangled with kagome structure to the strongly correlated regime, but also establish YbV$_6$Sn$_6$ as an unprecedented platform to explore unconventional many-body physics beyond the standard Kondo picture.', 'https://arxiv.org/abs/2509.04641', '2025-09-08 04:00:00', '2025-09-08 23:32:24.72', 'INDUSTRY_NEWS', 0.00, 'da1a6123f1cf3a89ef16beedf5a0076e', '{}', '{}', 'Rui Lou, Max Mende, Riccardo Vocaturo, Hao Zhang, Qingxin Dong, Man Li, Pengfei Ding, Erjian Cheng, Zhiguang Liao, Yu Zhang, Junfa Lin, Reza Firouzmandi, Vilmos Kocsis, Laura T. Corredor, Yurii Prots,', 1, 'cmfbraghj0007yzw7c9vbnmkc', false, 0, '2025-09-08 23:32:24.72', '2025-09-09 23:41:29.991', '**Key Development:** Recent research on the heavy-fermion compound YbV$_6$Sn$_6$ has revealed significant interactions between Kondo and kagome lattices, showcasing emergent magnetic properties through advanced spectroscopic techniques.

**Why It Matters for Business:** This discovery enhances our understanding of complex materials, which could lead to breakthroughs in quantum computing and advanced magnetic materials, sectors poised for substantial growth.

**Opportunities or Risks Created:** Companies in materials science and quantum technology can leverage this research to innovate new products. However, the complexity of these materials may pose risks in scalability and manufacturing.

**Industry Implications:** The findings could accelerate advancements in energy storage technologies, particularly in developing high-capacity batteries and supercapacitors, which are critical', NULL, true, 1, '2025-09-09 23:41:29.99', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfbrb6s800dlmb9hm36op4v7', 'Coexisting Kagome and Heavy Fermion Flat Bands in YbCr$_6$Ge$_6$', 'arXiv:2509.04902v1 Announce Type: cross 
Abstract: Flat bands, emergent in strongly correlated electron systems, stand at the frontier of condensed matter physics, providing fertile ground for unconventional quantum phases. Recent observations of dispersionless bands at the Fermi level in kagome lattice open the possibility of unifying the disjoint paradigms of topology and correlation-driven heavy fermion liquids. Here, we report the unprecedented coexistence of these mechanisms in the layered kagome metal YbCr6Ge6. At high temperatures, an intrinsic kagome flat band-arising from the frustrated hopping on the kagome lattice-dominates the Fermi level. Upon cooling, localized Yb 4f-states hybridize with the topological kagome flat bands, transforming this state into the Kondo resonance states that are nearly dispersionless across the entire Brillouin zone. Crystalline symmetry forbids hybridization along specific high-symmetry lines, which stabilizes Dirac crossings of heavy-fermion cha', 'arXiv:2509.04902v1 Announce Type: cross 
Abstract: Flat bands, emergent in strongly correlated electron systems, stand at the frontier of condensed matter physics, providing fertile ground for unconventional quantum phases. Recent observations of dispersionless bands at the Fermi level in kagome lattice open the possibility of unifying the disjoint paradigms of topology and correlation-driven heavy fermion liquids. Here, we report the unprecedented coexistence of these mechanisms in the layered kagome metal YbCr6Ge6. At high temperatures, an intrinsic kagome flat band-arising from the frustrated hopping on the kagome lattice-dominates the Fermi level. Upon cooling, localized Yb 4f-states hybridize with the topological kagome flat bands, transforming this state into the Kondo resonance states that are nearly dispersionless across the entire Brillouin zone. Crystalline symmetry forbids hybridization along specific high-symmetry lines, which stabilizes Dirac crossings of heavy-fermion character. Topological analysis of the resulting gaps reveals both trivial and nontrivial Z2 invariants, establishing the emergence of a Dirac-Kondo semimetal phase. Taken together, these results identify YbCr6Ge6 as a prototype of a topological heavy-fermion system and a platform where geometric frustration, strong correlations, and topology converge, with broad implications for correlated quantum matter.', 'https://arxiv.org/abs/2509.04902', '2025-09-08 04:00:00', '2025-09-08 23:32:24.728', 'INDUSTRY_NEWS', 0.00, '0104dc28db87fdaa80c32130768dc8e5', '{}', '{}', 'Hanoh Lee, Churlhi Lyi, Taehee Lee, Hyeonhui Na, Jinyoung Kim, Sangjae Lee, Younsik Kim, Anil Rajapitamahuni, Asish K. Kundu, Elio Vescovo, Byeong-Gyu Park, Changyoung Kim, Charles H. Ahn, Frederick J', 1, 'cmfbraghj0007yzw7c9vbnmkc', false, 0, '2025-09-08 23:32:24.728', '2025-09-09 23:41:23.195', '**Key Development:** Recent research has identified the coexistence of kagome and heavy fermion flat bands in the layered metal YbCr$_6$Ge$_6$, revealing new insights into strongly correlated electron systems.

**Why It Matters for Business:** This discovery could lead to breakthroughs in quantum materials, which are essential for advanced technologies such as quantum computing and energy storage solutions.

**Opportunities or Risks Created:** The findings present opportunities for companies in the semiconductor and materials science sectors to innovate new products. However, the complexity of these materials may pose risks in terms of scalability and manufacturing processes.

**Industry Implications:** The integration of topology and correlation in materials could revolutionize the development of next-generation electronic devices, enhancing performance and efficiency.

**Connection to', NULL, true, 1, '2025-09-09 23:41:23.194', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfcqd9hb003x57jllam86ipa', 'Graphene oxide-based nanocomposite tackles antibiotic pollution in wastewater', 'Researchers from National Taiwan University recently investigated the use of graphene oxide (GO) within a multifunctional nanocomposite for removing veterinary antibiotics - including sulfamethoxazole, oxytetracycline, and enrofloxacin - from livestock wastewater. The team created a nanocomposite that removes 95% of these antibiotics from water, providing a sustainable tool against drug pollution and antimicrobial resistance.

  
  
    
    




  

Image credit: Chemical Engineering Journal
The hybrid nanocomposite merges two clean-up strategies - adsorption and photocatalysis - into a single system. By integrating graphene oxide, biochar, and titanium dioxide (TiO₂), the researchers produced a porous, high-surface-area material that first attracts antibiotics and then breaks them down under ultraviolet light.', '<p>Researchers from National Taiwan University recently investigated the use of graphene oxide (GO) within a multifunctional nanocomposite for removing veterinary antibiotics - including sulfamethoxazole, oxytetracycline, and enrofloxacin - from livestock wastewater. The team created a nanocomposite that removes 95% of these antibiotics from water, providing a sustainable tool against drug pollution and antimicrobial resistance.</p><div class="align-center">
  
  <a href="https://www.graphene-info.com/sites/default/files/2025-09/GO-nanocomposite-addresses-antibiotics-pollution-in-wastewater-image.jpg" target="_blank">
    
    <img loading="lazy" src="https://www.graphene-info.com/sites/default/files/styles/large/public/2025-09/GO-nanocomposite-addresses-antibiotics-pollution-in-wastewater-image.jpg?itok=rIgeQVJN" width="400" height="272" alt="GO-based hybrid nanomaterial cleans wastewater of antibiotics image" typeof="Image" class="image-style-large">




  </a>
</div>
<p class="text-align-center"><em>Image credit: Chemical Engineering Journal</em></p><p>The hybrid nanocomposite merges two clean-up strategies - adsorption and photocatalysis - into a single system. By integrating graphene oxide, biochar, and titanium dioxide (TiO₂), the researchers produced a porous, high-surface-area material that first attracts antibiotics and then breaks them down under ultraviolet light.</p>', 'https://www.graphene-info.com/graphene-oxide-based-nanocomposite-tackles-antibiotic-pollution-wastewater', '2025-09-09 04:01:40', '2025-09-09 15:53:48.096', 'RESEARCH_BREAKTHROUGH', 1.50, '23e19f7d8ed324354f24565fc8870c8c', '{/news-images/c06dfd5c0c841a374288b443a2c7e49b.jpg}', '{graphene,composite,research}', 'Roni Peleg', 1, 'cmfbraghi0003yzw7qj5nisrd', true, 2, '2025-09-09 15:53:48.096', '2025-09-13 23:12:22.809', 'Researchers at National Taiwan University have developed a graphene oxide-based nanocomposite that effectively removes 95% of veterinary antibiotics from livestock wastewater. This breakthrough significantly enhances existing wastewater treatment technologies by addressing antibiotic pollution and antimicrobial resistance, which are critical environmental concerns.

The commercialization timeline is estimated at 2-3 years, allowing for necessary regulatory approvals and scaling. The global market opportunity for wastewater treatment technologies is projected to exceed $500 billion by 2025, driven by increasing regulatory pressures and environmental sustainability initiatives.

This innovation is particularly relevant to energy storage and supercapacitors, as graphene materials are known for their high conductivity and surface area, potentially leading to dual-use applications in both environmental and energy sectors. Companies should explore partnerships or investments in this technology to capitalize on', NULL, true, 0, '2025-09-09 23:39:42.529', 'COMPLETED');
INSERT INTO public.news_articles VALUES ('cmfcqemzd006n57jls0847rwn', 'Giant Splitting of Folded Dirac Bands in Kekul\''{e}-ordered Graphene with Eu Intercalation', 'arXiv:2509.05633v1 Announce Type: cross 
Abstract: Kekul\''{e}-ordered graphene on SiC realized by intercalating two-dimensional metal layers offers a versatile platform for exploring intriguing quantum states and phenomena. Here, we achieve the intercalation of $(\mathrm{\sqrt{3}\times\sqrt{3}})\mathit{R}30^\circ$-ordered Eu layer between epitaxial graphene and SiC substrate, realizing a Kekul\''{e} graphene with large local magnetic moments of intercalated Eu atoms. Combining angle-resolved photoemission spectroscopy (ARPES) and density functional theory (DFT) calculations, we revealed that the Kekul{\''{e}} order folds the Dirac cones of graphene from the corners to the Brillouin zone center via intervalley scattering, forming the replica Dirac bands with gap opening. More intriguingly, the Dirac fermions in the replica Dirac bands show a strong exchange coupling with the localized magnetic moments of Eu $4f$ orbitals, resulting in a giant splitting of the folded Dirac bands. The obser', 'arXiv:2509.05633v1 Announce Type: cross 
Abstract: Kekul\''{e}-ordered graphene on SiC realized by intercalating two-dimensional metal layers offers a versatile platform for exploring intriguing quantum states and phenomena. Here, we achieve the intercalation of $(\mathrm{\sqrt{3}\times\sqrt{3}})\mathit{R}30^\circ$-ordered Eu layer between epitaxial graphene and SiC substrate, realizing a Kekul\''{e} graphene with large local magnetic moments of intercalated Eu atoms. Combining angle-resolved photoemission spectroscopy (ARPES) and density functional theory (DFT) calculations, we revealed that the Kekul{\''{e}} order folds the Dirac cones of graphene from the corners to the Brillouin zone center via intervalley scattering, forming the replica Dirac bands with gap opening. More intriguingly, the Dirac fermions in the replica Dirac bands show a strong exchange coupling with the localized magnetic moments of Eu $4f$ orbitals, resulting in a giant splitting of the folded Dirac bands. The observation of strong coupling between Dirac fermions and local magnetic moments of Eu $4f$ electrons via Kekul\''{e} order pave a new way for generating Dirac band splitting in graphene, advancing the potential applications of Kekul\''{e}-ordered graphene in spintronics, as well as exploring intriguing physical properties and correlation states for quantum technology.', 'https://arxiv.org/abs/2509.05633', '2025-09-09 04:00:00', '2025-09-09 15:54:52.25', 'APPLICATIONS', 1.00, '900f6a9725df8d8c619d502d2de666ae', '{/news-images/1fed0de190485cbbb37a86fdf656d71b.png,/news-images/e88f1bb7d30f8467aafffb36857b1e5a.png,/news-images/aef095e7b92159db3d08461eb9636c08.png,/news-images/beeafe67a38fcaeb5dd2ebdbd21eeb1b.png,/news-images/81596774e6fbaf50c3fb294d1f5232cc.png}', '{graphene}', 'Xiaodong Qiu, Tongshuai Zhu, Zhenjie Fan, Kaili Wang, Yuyang Mu, Bin Yang, Di Wu, Haijun Zhang, Can Wang, Huaiqiang Wang, Yi Zhang', 1, 'cmfbraghj0007yzw7c9vbnmkc', false, 0, '2025-09-09 15:54:52.25', '2025-09-09 23:41:18.909', '**New Application**: The study introduces a novel application of Kekulé-ordered graphene intercalated with europium (Eu) layers, enhancing its quantum properties and magnetic characteristics.

**Target Market and Customer Base**: This technology targets advanced materials manufacturers, semiconductor industries, and research institutions focused on quantum computing and energy storage solutions.

**Performance Advantages**: The intercalated graphene exhibits enhanced magnetic moments and unique quantum states, potentially leading to improved performance in electronic devices, sensors, and energy storage systems.

**Cost-Benefit Analysis**: While initial R&D costs may be high due to advanced materials and processes, the long-term benefits include superior device performance, lower energy consumption, and potential for high-margin applications in emerging tech sectors, offering a', NULL, true, 1, '2025-09-09 23:41:18.907', 'COMPLETED');


--
-- Data for Name: news_preferences; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: news_sources; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.news_sources VALUES ('cmfbraghf0000yzw7acbz9g2b', 'Nature Materials', 'https://www.nature.com/nmat/rss/current', 'RSS', 12, '2025-09-13 19:47:02.564', true, 9.50, true, NULL, '2025-09-08 23:31:50.643', '2025-09-13 19:47:02.564');
INSERT INTO public.news_sources VALUES ('cmfbraghg0001yzw73zatkg3f', 'ACS Nano', 'https://pubs.acs.org/action/showFeed?type=etoc&feed=rss&jc=ancac3', 'RSS', 12, '2025-09-13 19:47:02.854', true, 9.30, true, NULL, '2025-09-08 23:31:50.645', '2025-09-13 19:47:02.854');
INSERT INTO public.news_sources VALUES ('cmfbraghi0005yzw721gp6jgu', 'Advanced Materials', 'https://onlinelibrary.wiley.com/action/showFeed?jc=15214095&type=etoc&feed=rss', 'RSS', 12, '2025-09-13 19:47:03.177', true, 9.20, true, NULL, '2025-09-08 23:31:50.647', '2025-09-13 19:47:03.178');
INSERT INTO public.news_sources VALUES ('cmfbraghl000ayzw7qm2jdddo', 'Nano Letters', 'https://pubs.acs.org/action/showFeed?type=etoc&feed=rss&jc=nalefd', 'RSS', 12, '2025-09-13 19:47:03.316', true, 9.10, true, NULL, '2025-09-08 23:31:50.649', '2025-09-13 19:47:03.316');
INSERT INTO public.news_sources VALUES ('cmfbraghi0004yzw7et1vahzw', '2D Materials Journal', 'https://iopscience.iop.org/journal/rss/2053-1583', 'RSS', 12, '2025-09-13 19:47:04.033', true, 9.00, true, NULL, '2025-09-08 23:31:50.646', '2025-09-13 19:47:04.034');
INSERT INTO public.news_sources VALUES ('cmfbraghj0006yzw7e1q51aft', 'Physical Review Materials', 'https://journals.aps.org/prmaterials/rss', 'RSS', 24, '2025-09-13 19:47:04.204', true, 8.90, true, NULL, '2025-09-08 23:31:50.647', '2025-09-13 19:47:04.205');
INSERT INTO public.news_sources VALUES ('cmfbraghh0002yzw7abs4sb28', 'Science Direct - Graphene', 'https://rss.sciencedirect.com/publication/science/carbon', 'RSS', 24, '2025-09-13 19:47:04.603', true, 8.80, true, NULL, '2025-09-08 23:31:50.645', '2025-09-13 19:47:04.604');
INSERT INTO public.news_sources VALUES ('cmfbraghi0003yzw7qj5nisrd', 'Graphene-Info', 'https://www.graphene-info.com/rss.xml', 'RSS', 6, '2025-09-13 19:47:05.034', true, 8.50, true, NULL, '2025-09-08 23:31:50.646', '2025-09-13 19:47:05.035');
INSERT INTO public.news_sources VALUES ('cmfbraghl000byzw7jtritiou', 'Small Methods', 'https://onlinelibrary.wiley.com/action/showFeed?jc=23669608&type=etoc&feed=rss', 'RSS', 12, '2025-09-13 19:47:05.31', true, 8.40, true, NULL, '2025-09-08 23:31:50.65', '2025-09-13 19:47:05.311');
INSERT INTO public.news_sources VALUES ('cmfbraghk0008yzw7r0fksnr3', 'Materials Today', 'https://www.materialstoday.com/rss/', 'RSS', 12, '2025-09-13 19:47:05.511', true, 8.30, true, NULL, '2025-09-08 23:31:50.648', '2025-09-13 19:47:05.513');
INSERT INTO public.news_sources VALUES ('cmfbraghk0009yzw710dwodd3', 'Chemical & Engineering News', 'https://cen.acs.org/rss/all.xml', 'RSS', 24, '2025-09-13 19:47:06.201', true, 8.10, true, NULL, '2025-09-08 23:31:50.649', '2025-09-13 19:47:06.202');
INSERT INTO public.news_sources VALUES ('cmfbraghj0007yzw7c9vbnmkc', 'ArXiv - Materials Science', 'http://export.arxiv.org/rss/cond-mat.mtrl-sci', 'RSS', 6, '2025-09-13 19:47:06.466', true, 7.50, true, NULL, '2025-09-08 23:31:50.648', '2025-09-13 19:47:06.467');


--
-- Data for Name: raman_tests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.raman_tests VALUES ('cmf5ypbpn000154hpju2j7wew', '2024-06-07 00:00:00', 'TB1133', 'Curia - Germany', 'Clariant', 'raman-reports/24-047052_Raman_Report_June_11_2024_1757023964541.pdf', '', '2025-09-04 22:12:44.555', '2025-09-04 22:12:44.555', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf5zxhl4000354hp6lxs64hc', NULL, 'MB2947D', 'Curia - Germany', 'Clariant', 'raman-reports/24-047290-1_MB2947D_Raman__1757026024997.pdf', '', '2025-09-04 22:47:05.006', '2025-09-04 22:47:05.006', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf5zzdye000754hp6rib6n97', NULL, 'TB1135-2', 'Curia - Germany', 'Clariant', 'raman-reports/24-047344-1_TB1135-2_Raman__1757026113630.pdf', '', '2025-09-04 22:48:33.636', '2025-09-04 22:48:33.636', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf5zypjq000554hpvz350by0', NULL, 'TB1135-1', 'Curia - Germany', 'Clariant', 'raman-reports/24-047317-Raman_TB1135-1_1757026082003.pdf', '', '2025-09-04 22:48:02.005', '2025-09-04 22:48:40.872', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf600a7h000954hpqwoganor', NULL, 'MB2952B', 'Curia - Germany', 'Clariant', 'raman-reports/24-047344-2_MB2952B_Raman__1757026155425.pdf', '', '2025-09-04 22:49:15.434', '2025-09-04 22:49:15.434', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf600zp1000b54hpt2a5rsoh', NULL, 'MB2952C', 'Curia - Germany', 'Clariant', 'raman-reports/24-047368-1_MB2952C_Raman_1757026188462.pdf', '', '2025-09-04 22:49:48.468', '2025-09-04 22:49:48.468', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf601lk7000d54hp2lw3zrvu', NULL, 'MB2952C2', 'Curia - Germany', 'Clariant', 'raman-reports/24-047368-2_MB2952C2_Raman_1757026216800.pdf', '', '2025-09-04 22:50:16.806', '2025-09-04 22:50:16.806', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf602ado000f54hpv6gfyzfj', NULL, 'TB1137-1', 'Curia - Germany', 'Clariant', 'raman-reports/24-047592-TB1137-1_Raman_1757026248967.pdf', '', '2025-09-04 22:50:48.972', '2025-09-04 22:50:48.972', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf6097js000k54hpucxkeo3p', '2024-12-12 00:00:00', NULL, 'Curia - Germany', 'Clariant', 'raman-reports/24-048758_MB3001A-MB3004A_RAMAN_Report_1757026571887.pdf', '', '2025-09-04 22:56:11.895', '2025-09-04 22:56:11.895', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'MB300A1/3004A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf60bsyr000m54hpoz6nt8hz', '2025-03-19 00:00:00', 'MRa389A', 'Curia - Germany', 'Clariant', 'raman-reports/25-049538-4_MRa389A_Raman_1757026692945.pdf', '', '2025-09-04 22:58:12.956', '2025-09-04 22:58:12.956', NULL, NULL, 236.000, 7.000, 1.0000, 94.0000, 216.000, 4.000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf60g5ou000o54hpgfrfud4p', '2025-03-27 00:00:00', 'MRa408', 'Curia - Germany', 'Clariant', 'raman-reports/25-049538-9_MRa408_RAMAN_1757036558212.pdf', '', '2025-09-04 23:01:36.075', '2025-09-05 01:42:38.224', 12.000, 0.000, 285.000, 0.000, 1.0000, 278.0000, 223.000, 0.000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 331.000, 7.000, 1.0000, 352.0000, 245.000, 4.000);
INSERT INTO public.raman_tests VALUES ('cmf66afpb0001kwob8vl38949', '2025-05-20 00:00:00', NULL, 'Curia - Germany', 'Clariant', 'raman-reports/25-050027-1_TB1175B_RAMAN_1757036706801.pdf', '', '2025-09-05 01:45:06.813', '2025-09-05 01:45:06.813', 2.000, 3.000, 290.000, 3.000, 1.0000, 337.0000, 217.000, 1.000, 2537.00, 2967.00, 954.00, 1468.00, NULL, NULL, 1468.00, 1743.00, 0.0000, 21.0000, 1.0000, 637.0000, NULL, NULL, 1.0000, 948.0000, 'HG101S1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf66dhi90003kwobxflf4l3m', '2025-07-16 00:00:00', NULL, 'Curia - Germany', 'Clariant', 'raman-reports/25-050404-1_TB1180A_RAMAN_1757036849105.pdf', '', '2025-09-05 01:47:29.113', '2025-09-05 01:47:29.113', 2.000, 581.000, 330.000, 8.000, 1.0000, 451.0000, 228.000, 0.000, 2557.00, 2791.00, 959.00, 1474.00, NULL, NULL, 1474.00, 1753.00, 0.0000, 24.0000, 1.0000, 784.0000, 0.0000, 905.0000, 1.0000, 972.0000, 'HG103S1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.raman_tests VALUES ('cmf66ei3s0005kwobgh9tobbm', '2025-07-16 00:00:00', NULL, 'Curia - Germany', 'Clariant', 'raman-reports/25-050404-2_TB1180B_RAMAN_1757036969143.pdf', '', '2025-09-05 01:48:16.55', '2025-09-05 20:52:17.729', 9.000, 690.000, 322.000, 3.000, 1.0000, 422.0000, 226.000, 6.000, 2557.00, 2791.00, 959.00, 1474.00, NULL, NULL, 1474.00, 1753.00, NULL, 123.0000, 1.0000, 708.0000, NULL, NULL, 1.0000, 895.0000, 'HG102S2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: sem_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sem_reports VALUES ('cmeoqp24e000a2er8hvgo7lrc', '24-048326-3_MB2997A 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM_1755982590185.pdf', '24-048326-3_MB2997A 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814843/graphene-uploads/sem-reports/24-048326-3_MB2997A%202-3%205m%20800C%203C-m%201h%20A%202x1_6P_SEM_1755982590185.pdf.pdf', NULL, '2024-10-21 00:00:00', '2025-08-23 20:56:30.207', '2025-08-23 20:56:30.207');
INSERT INTO public.sem_reports VALUES ('cmeoqrh83000f2er84t3920wt', '24-048326-4_MB2997B 2-3 5m 800C 3C-m 1h B 2x1_3P_SEM_1755982703066.pdf', '24-048326-4_MB2997B 2-3 5m 800C 3C-m 1h B 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814844/graphene-uploads/sem-reports/24-048326-4_MB2997B%202-3%205m%20800C%203C-m%201h%20B%202x1_3P_SEM_1755982703066.pdf.pdf', NULL, '2024-10-21 00:00:00', '2025-08-23 20:58:23.092', '2025-08-23 20:58:23.092');
INSERT INTO public.sem_reports VALUES ('cmeoqu3rk000k2er86a4uoecy', '24-048359-1_MB2999A 2-3 25Hz80sec 800C 3C-m 1h B 2x1_6P_SEM_1755982825568.pdf', '24-048359-1_MB2999A 2-3 25Hz80sec 800C 3C-m 1h B 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814845/graphene-uploads/sem-reports/24-048359-1_MB2999A%202-3%2025Hz80sec%20800C%203C-m%201h%20B%202x1_6P_SEM_1755982825568.pdf.pdf', NULL, '2024-10-24 00:00:00', '2025-08-23 21:00:25.616', '2025-08-23 21:00:25.616');
INSERT INTO public.sem_reports VALUES ('cmeor28bf000u2er81fob6gfo', '24-048359-3_TB1146 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM_1755983204730.pdf', '24-048359-3_TB1146 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814848/graphene-uploads/sem-reports/24-048359-3_TB1146%202-3%205m%20800C%203C-m%201h%20A%202x1_6P_SEM_1755983204730.pdf.pdf', NULL, '2024-10-24 00:00:00', '2025-08-23 21:06:44.763', '2025-08-23 21:06:44.763');
INSERT INTO public.sem_reports VALUES ('cmeor5clu000z2er844wf1tsv', '24-048359-4_TB1147 2-3 4m 800C 3C-m 1h B 1_4-1_3P_SEM_1755983350268.pdf', '24-048359-4_TB1147 2-3 4m 800C 3C-m 1h B 1_4-1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814850/graphene-uploads/sem-reports/24-048359-4_TB1147%202-3%204m%20800C%203C-m%201h%20B%201_4-1_3P_SEM_1755983350268.pdf.pdf', NULL, '2024-10-24 00:00:00', '2025-08-23 21:09:10.291', '2025-08-23 21:09:10.291');
INSERT INTO public.sem_reports VALUES ('cmeor8ps900142er8i29nhoit', '24-048390-1_MB3001A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM_1755983507312.pdf', '24-048390-1_MB3001A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814850/graphene-uploads/sem-reports/24-048390-1_MB3001A%202-3%2035Hz80sec%20800C%203C-m%201h%20A%202x1_6P_SEM_1755983507312.pdf.pdf', NULL, '2024-10-28 00:00:00', '2025-08-23 21:11:47.338', '2025-08-23 21:11:47.338');
INSERT INTO public.sem_reports VALUES ('cmeosk9z5001e2er8u7l3xiug', '24-048390-3_MB3003A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM_1755985726317.pdf', '24-048390-3_MB3003A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814852/graphene-uploads/sem-reports/24-048390-3_MB3003A%202-3%2035Hz80sec%20800C%203C-m%201h%20A%202x1_6P_SEM_1755985726317.pdf.pdf', NULL, '2024-10-28 00:00:00', '2025-08-23 21:48:46.337', '2025-08-23 21:48:46.337');
INSERT INTO public.sem_reports VALUES ('cmeosmeit001j2er8k6i7mr1q', '24-048390-4_MB3003B 2-3 35Hz80sec 800C 3C-m 1h B 2_6g np_SEM_1755985825525.pdf', '24-048390-4_MB3003B 2-3 35Hz80sec 800C 3C-m 1h B 2_6g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814853/graphene-uploads/sem-reports/24-048390-4_MB3003B%202-3%2035Hz80sec%20800C%203C-m%201h%20B%202_6g%20np_SEM_1755985825525.pdf.pdf', NULL, '2024-10-28 00:00:00', '2025-08-23 21:50:25.542', '2025-08-23 21:50:25.542');
INSERT INTO public.sem_reports VALUES ('cmeosoeir001o2er8vli36pgk', '24-048390-5_MB3004A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM_1755985918822.pdf', '24-048390-5_MB3004A 2-3 35Hz80sec 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814854/graphene-uploads/sem-reports/24-048390-5_MB3004A%202-3%2035Hz80sec%20800C%203C-m%201h%20A%202x1_6P_SEM_1755985918822.pdf.pdf', NULL, '2024-10-29 00:00:00', '2025-08-23 21:51:58.852', '2025-08-23 21:51:58.852');
INSERT INTO public.sem_reports VALUES ('cmeosvtfj001y2er878feg3b1', '24-048427-1_TB1151A 2-3 15Hz10min 800C 3C-m 1h A 1_7-1_8P_SEM_1755986264727.pdf', '24-048427-1_TB1151A 2-3 15Hz10min 800C 3C-m 1h A 1_7-1_8P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814856/graphene-uploads/sem-reports/24-048427-1_TB1151A%202-3%2015Hz10min%20800C%203C-m%201h%20A%201_7-1_8P_SEM_1755986264727.pdf.pdf', NULL, '2024-10-31 00:00:00', '2025-08-23 21:57:44.767', '2025-08-23 21:57:44.767');
INSERT INTO public.sem_reports VALUES ('cmeosxhi500232er8cer8i45p', '24-048427-2_TB1151B 2-3 15Hz10min 800C 3C-m 1h B 2_7g np_SEM_1755986342587.pdf', '24-048427-2_TB1151B 2-3 15Hz10min 800C 3C-m 1h B 2_7g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814857/graphene-uploads/sem-reports/24-048427-2_TB1151B%202-3%2015Hz10min%20800C%203C-m%201h%20B%202_7g%20np_SEM_1755986342587.pdf.pdf', NULL, '2024-10-31 00:00:00', '2025-08-23 21:59:02.621', '2025-08-23 21:59:02.621');
INSERT INTO public.sem_reports VALUES ('cmeoszhlq00282er8hsejdc8u', '24-048427-3_MB3007A 2-3 15Hz30min 800C 3C-m 1h A 2x1_6P_SEM_1755986436036.pdf', '24-048427-3_MB3007A 2-3 15Hz30min 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814857/graphene-uploads/sem-reports/24-048427-3_MB3007A%202-3%2015Hz30min%20800C%203C-m%201h%20A%202x1_6P_SEM_1755986436036.pdf.pdf', NULL, '2024-10-31 00:00:00', '2025-08-23 22:00:36.063', '2025-08-23 22:00:36.063');
INSERT INTO public.sem_reports VALUES ('cmeot4l7y002i2er8cvc2mrrq', '24-048458-1_MB3009A_2-3_1m_800C_3C-m_1h_A_2x1_6P_SEM_1755986674000.pdf', '24-048458-1_MB3009A_2-3_1m_800C_3C-m_1h_A_2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814859/graphene-uploads/sem-reports/24-048458-1_MB3009A_2-3_1m_800C_3C-m_1h_A_2x1_6P_SEM_1755986674000.pdf.pdf', NULL, '2024-11-05 00:00:00', '2025-08-23 22:04:34.03', '2025-08-23 22:04:34.03');
INSERT INTO public.sem_reports VALUES ('cmeotplvm003j2er838rr89jg', '24-048505-10_MRa340B 2-3 15Hz120min 800C 3Cm 1h B 2,6np_SEM_1755987654638.pdf', '24-048505-10_MRa340B 2-3 15Hz120min 800C 3Cm 1h B 2,6np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814861/graphene-uploads/sem-reports/24-048505-10_MRa340B%202-3%2015Hz120min%20800C%203Cm%201h%20B%202%2C6np_SEM_1755987654638.pdf.pdf', NULL, '2024-11-12 00:00:00', '2025-08-23 22:20:54.658', '2025-08-23 22:20:54.658');
INSERT INTO public.sem_reports VALUES ('cmeot6nll002n2er82oz6umjx', '24-048505-2_MB3012B 2-3 15Hz10+1min 800C 3C-m 1h B 2_6g np_SEM_1755986770415.pdf', '24-048505-2_MB3012B 2-3 15Hz10+1min 800C 3C-m 1h B 2_6g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814862/graphene-uploads/sem-reports/24-048505-2_MB3012B%202-3%2015Hz10%2B1min%20800C%203C-m%201h%20B%202_6g%20np_SEM_1755986770415.pdf.pdf', NULL, '2024-11-07 00:00:00', '2025-08-23 22:06:10.426', '2025-08-23 22:06:10.426');
INSERT INTO public.sem_reports VALUES ('cmeothm2d002z2er8eeu54zfr', '24-048505-6_MB3013B 2-3 15Hz10+1min 800C 3Cm 1h B 2x1,3P_SEM_1755987281627.pdf', '24-048505-6_MB3013B 2-3 15Hz10+1min 800C 3Cm 1h B 2x1,3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814864/graphene-uploads/sem-reports/24-048505-6_MB3013B%202-3%2015Hz10%2B1min%20800C%203Cm%201h%20B%202x1%2C3P_SEM_1755987281627.pdf.pdf', NULL, '2024-11-11 00:00:00', '2025-08-23 22:14:41.654', '2025-08-23 22:14:41.654');
INSERT INTO public.sem_reports VALUES ('cmeotjavk00342er8ycs3a6al', '24-048505-7_MB3015A 2-3 15Hz30+1min 800C 3Cm 1hA 2x1,5P_SEM_1755987360452.pdf', '24-048505-7_MB3015A 2-3 15Hz30+1min 800C 3Cm 1hA 2x1,5P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814865/graphene-uploads/sem-reports/24-048505-7_MB3015A%202-3%2015Hz30%2B1min%20800C%203Cm%201hA%202x1%2C5P_SEM_1755987360452.pdf.pdf', NULL, '2024-11-12 00:00:00', '2025-08-23 22:16:00.465', '2025-08-23 22:16:00.465');
INSERT INTO public.sem_reports VALUES ('cmeotmew800392er8e8g94gi9', '24-048505-8_MB3015B 2-3 15Hz30+1min 800C 3Cm 1h B 2,5np_SEM_1755987505611.pdf', '24-048505-8_MB3015B 2-3 15Hz30+1min 800C 3Cm 1h B 2,5np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814866/graphene-uploads/sem-reports/24-048505-8_MB3015B%202-3%2015Hz30%2B1min%20800C%203Cm%201h%20B%202%2C5np_SEM_1755987505611.pdf.pdf', NULL, '2024-11-11 00:00:00', '2025-08-23 22:18:25.641', '2025-08-23 22:18:25.641');
INSERT INTO public.sem_reports VALUES ('cmepy2wcy000mgqvg6l5qtis5', '24-048719-4_MRa353B  2-3 10%NaOH 35Hz 10min 800C 3C-m 1h B 2x1.3P_SEM_1756055459390.pdf', '24-048719-4_MRa353B  2-3 10%NaOH 35Hz 10min 800C 3C-m 1h B 2x1.3P_SEM.pdf', 'sem-reports/24-048719-4_MRa353B  2-3 10%NaOH 35Hz 10min 800C 3C-m 1h B 2x1.3P_SEM_1756055459390.pdf', NULL, '2024-12-03 07:00:00', '2025-08-24 17:10:59.41', '2025-08-24 17:10:59.41');
INSERT INTO public.sem_reports VALUES ('cmepzjfrl000rgqvg90io9e0j', '24-048757-2 TB1158A 2-3 20%NaOH 35Hz10min 800C 3C-m 1h  A 2x1.3P_SEM_1756057910645.pdf', '24-048757-2 TB1158A 2-3 20%NaOH 35Hz10min 800C 3C-m 1h  A 2x1.3P_SEM.pdf', 'sem-reports/24-048757-2 TB1158A 2-3 20%NaOH 35Hz10min 800C 3C-m 1h  A 2x1.3P_SEM_1756057910645.pdf', NULL, '2024-12-05 07:00:00', '2025-08-24 17:51:50.673', '2025-08-24 17:51:50.673');
INSERT INTO public.sem_reports VALUES ('cmepzkr2g000wgqvgik4c7fet', '24-048757-3 TB1158B 2-3 5%NaOH 35Hz10min 800C 3C-m 1h  B 2x1.2P_SEM_1756057971960.pdf', '24-048757-3 TB1158B 2-3 5%NaOH 35Hz10min 800C 3C-m 1h  B 2x1.2P_SEM.pdf', 'sem-reports/24-048757-3 TB1158B 2-3 5%NaOH 35Hz10min 800C 3C-m 1h  B 2x1.2P_SEM_1756057971960.pdf', NULL, '2024-12-05 07:00:00', '2025-08-24 17:52:51.976', '2025-08-24 17:52:51.976');
INSERT INTO public.sem_reports VALUES ('cmepzqh0l001ggqvgrtemjnas', '24-048821-4_TB1162B 2-3 20% NaOH 3min 800C 3C-m 1h B 2x1.3P_SEM_1756058238854.pdf', '24-048821-4_TB1162B 2-3 20% NaOH 3min 800C 3C-m 1h B 2x1.3P_SEM.pdf', 'sem-reports/24-048821-4_TB1162B 2-3 20% NaOH 3min 800C 3C-m 1h B 2x1.3P_SEM_1756058238854.pdf', NULL, '2024-12-16 07:00:00', '2025-08-24 17:57:18.886', '2025-08-24 17:57:18.886');
INSERT INTO public.sem_reports VALUES ('cmepzwabl001qgqvgo3ws2abn', '25-048930-2 MB3027_2-3_20%NaOH_3min_800C_3C-m_1h_B 2x1.3P_SEM_1756058510122.pdf', '25-048930-2 MB3027_2-3_20%NaOH_3min_800C_3C-m_1h_B 2x1.3P_SEM.pdf', 'sem-reports/25-048930-2 MB3027_2-3_20%NaOH_3min_800C_3C-m_1h_B 2x1.3P_SEM_1756058510122.pdf', NULL, '2025-01-15 07:00:00', '2025-08-24 18:01:50.146', '2025-08-24 18:01:50.146');
INSERT INTO public.sem_reports VALUES ('cmeq00gea0020gqvgkacbxek8', '25-048930-5  MB3030_2-3_20%NaOH_10min_800C_3C-m_1h_A 2x1.3P_SEM_1756058704624.pdf', '25-048930-5  MB3030_2-3_20%NaOH_10min_800C_3C-m_1h_A 2x1.3P_SEM.pdf', 'sem-reports/25-048930-5  MB3030_2-3_20%NaOH_10min_800C_3C-m_1h_A 2x1.3P_SEM_1756058704624.pdf', NULL, '2025-01-15 07:00:00', '2025-08-24 18:05:04.642', '2025-08-24 18:05:04.642');
INSERT INTO public.sem_reports VALUES ('cmeq0xw1i0007e12ugx6uc4ut', '25-049050-1_MB3036 2-3 7% 3min 800C 3C-m 1h B 2x1.3P_SEM_1756060264525.pdf', '25-049050-1_MB3036 2-3 7% 3min 800C 3C-m 1h B 2x1.3P_SEM.pdf', 'sem-reports/25-049050-1_MB3036 2-3 7% 3min 800C 3C-m 1h B 2x1.3P_SEM_1756060264525.pdf', NULL, '2025-01-26 07:00:00', '2025-08-24 18:31:04.566', '2025-08-24 18:31:04.566');
INSERT INTO public.sem_reports VALUES ('cmeotzsfr003x2er8mujz308f', '24-048601-2_MB3017B 2-3 20pNaOH 35Hz10min 800C 3C-m 1h B 2_6np_SEM_1755988129701.pdf', '24-048601-2_MB3017B 2-3 20pNaOH 35Hz10min 800C 3C-m 1h B 2_6np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814869/graphene-uploads/sem-reports/24-048601-2_MB3017B%202-3%2020pNaOH%2035Hz10min%20800C%203C-m%201h%20B%202_6np_SEM_1755988129701.pdf.pdf', NULL, '2024-11-19 00:00:00', '2025-08-23 22:28:49.719', '2025-08-23 22:28:49.719');
INSERT INTO public.sem_reports VALUES ('cmeou1js600422er8oxoqaz5m', '24-048601-3_MB3019A 2-3 15Hz10_1min 800C 3C-m 1h A 2x1_6P_SEM_1755988211788.pdf', '24-048601-3_MB3019A 2-3 15Hz10_1min 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814870/graphene-uploads/sem-reports/24-048601-3_MB3019A%202-3%2015Hz10_1min%20800C%203C-m%201h%20A%202x1_6P_SEM_1755988211788.pdf.pdf', NULL, '2024-11-19 00:00:00', '2025-08-23 22:30:11.814', '2025-08-23 22:30:11.814');
INSERT INTO public.sem_reports VALUES ('cmeou5j8n004c2er89ial1vsd', '24-048661-1_MB3021A 2-3 2min 800C 3C-m 1h A 2x1_6P_SEM_1755988397706.pdf', '24-048661-1_MB3021A 2-3 2min 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814872/graphene-uploads/sem-reports/24-048661-1_MB3021A%202-3%202min%20800C%203C-m%201h%20A%202x1_6P_SEM_1755988397706.pdf.pdf', NULL, '2024-11-22 00:00:00', '2025-08-23 22:33:17.736', '2025-08-23 22:33:17.736');
INSERT INTO public.sem_reports VALUES ('cmeou75to004h2er88xqmplu8', '24-048661-2_MB3021B 2-3 2min 800C 3C-m 1h B 2_6np_SEM_1755988473636.pdf', '24-048661-2_MB3021B 2-3 2min 800C 3C-m 1h B 2_6np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814873/graphene-uploads/sem-reports/24-048661-2_MB3021B%202-3%202min%20800C%203C-m%201h%20B%202_6np_SEM_1755988473636.pdf.pdf', NULL, '2024-11-22 00:00:00', '2025-08-23 22:34:33.66', '2025-08-23 22:34:33.66');
INSERT INTO public.sem_reports VALUES ('cmepth8el0002rbczh2zd6bhi', '24-048669-1_MB3023A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1.35P_SEM_1756047730092.pdf', '24-048669-1_MB3023A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1.35P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814874/graphene-uploads/sem-reports/24-048669-1_MB3023A%202-3%2020pNaOH%2035Hz10min%20800C%203C-m%201h%20A%202x1.35P_SEM_1756047730092.pdf.pdf', NULL, '2024-11-26 07:00:00', '2025-08-24 15:02:10.126', '2025-08-24 15:02:10.126');
INSERT INTO public.sem_reports VALUES ('cmepxxhdj0007gqvggqdksl83', '24-048719-1_MRa352A  2-3 2min 800C 3C-m 1h A 2x1.6P_SEM_1756055206672.pdf', '24-048719-1_MRa352A  2-3 2min 800C 3C-m 1h A 2x1.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814877/graphene-uploads/sem-reports/24-048719-1_MRa352A%20%202-3%202min%20800C%203C-m%201h%20A%202x1.6P_SEM_1756055206672.pdf.pdf', NULL, '2024-12-02 07:00:00', '2025-08-24 17:06:46.711', '2025-08-24 17:06:46.711');
INSERT INTO public.sem_reports VALUES ('cmepxys7n000cgqvgu5i9o2fx', '24-048719-2_MRa352B  2-3 2min 800C 3C-m 1h B 2.6np_SEM_1756055267386.pdf', '24-048719-2_MRa352B  2-3 2min 800C 3C-m 1h B 2.6np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814878/graphene-uploads/sem-reports/24-048719-2_MRa352B%20%202-3%202min%20800C%203C-m%201h%20B%202.6np_SEM_1756055267386.pdf.pdf', NULL, '2024-12-02 07:00:00', '2025-08-24 17:07:47.412', '2025-08-24 17:07:47.412');
INSERT INTO public.sem_reports VALUES ('cmepy1cqg000hgqvg8tzk7i6v', '24-048719-3_MRa353A  2-3  35Hz 10min 800C 3C-m 1h A 2x1.6P_SEM_1756055387286.pdf', '24-048719-3_MRa353A  2-3  35Hz 10min 800C 3C-m 1h A 2x1.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814879/graphene-uploads/sem-reports/24-048719-3_MRa353A%20%202-3%20%2035Hz%2010min%20800C%203C-m%201h%20A%202x1.6P_SEM_1756055387286.pdf.pdf', NULL, '2024-12-03 07:00:00', '2025-08-24 17:09:47.32', '2025-08-24 17:09:47.32');
INSERT INTO public.sem_reports VALUES ('cmepznrqx0016gqvgm6utzp2u', '24-048821-2_TB1160B 2-3 35Hz10min 800C 3C-m 1h B 2x1.3P_SEM_1756058112804.pdf', '24-048821-2_TB1160B 2-3 35Hz10min 800C 3C-m 1h B 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814882/graphene-uploads/sem-reports/24-048821-2_TB1160B%202-3%2035Hz10min%20800C%203C-m%201h%20B%202x1.3P_SEM_1756058112804.pdf.pdf', NULL, '2024-12-12 07:00:00', '2025-08-24 17:55:12.826', '2025-08-24 17:55:12.826');
INSERT INTO public.sem_reports VALUES ('cmepzp96i001bgqvg1wukddrc', '24-048821-3_TB1162A 2-3 3min 800C 3C-m 1h A 2x1.3P_SEM_1756058182056.pdf', '24-048821-3_TB1162A 2-3 3min 800C 3C-m 1h A 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814883/graphene-uploads/sem-reports/24-048821-3_TB1162A%202-3%203min%20800C%203C-m%201h%20A%202x1.3P_SEM_1756058182056.pdf.pdf', NULL, '2024-12-16 07:00:00', '2025-08-24 17:56:22.074', '2025-08-24 17:56:22.074');
INSERT INTO public.sem_reports VALUES ('cmepzuxwj001lgqvg9pmqfquj', '25-048930-1 MB3026_2-3_3min800C_3C-m_1h_B 2x1.3P_SEM_1756058447371.pdf', '25-048930-1 MB3026_2-3_3min800C_3C-m_1h_B 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814884/graphene-uploads/sem-reports/25-048930-1%20MB3026_2-3_3min800C_3C-m_1h_B%202x1.3P_SEM_1756058447371.pdf.pdf', NULL, '2025-01-15 07:00:00', '2025-08-24 18:00:47.395', '2025-08-24 18:00:47.395');
INSERT INTO public.sem_reports VALUES ('cmepzxsye001vgqvg1pfidir2', '25-048930-3 MB3028_2-3_10min_800C_3C-m_1h_B 2x1.3P_SEM_1756058580918.pdf', '25-048930-3 MB3028_2-3_10min_800C_3C-m_1h_B 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814886/graphene-uploads/sem-reports/25-048930-3%20MB3028_2-3_10min_800C_3C-m_1h_B%202x1.3P_SEM_1756058580918.pdf.pdf', NULL, '2025-01-15 07:00:00', '2025-08-24 18:03:00.95', '2025-08-24 18:03:00.95');
INSERT INTO public.sem_reports VALUES ('cmeq0li8q0002e12umsczq3fo', '25-048994-1 TB1166_2-3_4x3min_800C_3C-m_1h_Rot_SEM_1756059686774.pdf', '25-048994-1 TB1166_2-3_4x3min_800C_3C-m_1h_Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814888/graphene-uploads/sem-reports/25-048994-1%20TB1166_2-3_4x3min_800C_3C-m_1h_Rot_SEM_1756059686774.pdf.pdf', NULL, '2025-01-16 07:00:00', '2025-08-24 18:21:26.811', '2025-08-24 18:21:26.811');
INSERT INTO public.sem_reports VALUES ('cmeq12exo000ee12u8qqiwwoh', '25-049067-2_MB3038 2-3 5P 1_5min 800C 3C-m 1h B 2x1_3P_SEM_1756060475649.pdf', '25-049067-2_MB3038 2-3 5P 1_5min 800C 3C-m 1h B 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814890/graphene-uploads/sem-reports/25-049067-2_MB3038%202-3%205P%201_5min%20800C%203C-m%201h%20B%202x1_3P_SEM_1756060475649.pdf.pdf', NULL, '2025-01-28 07:00:00', '2025-08-24 18:34:35.677', '2025-08-24 18:34:35.677');
INSERT INTO public.sem_reports VALUES ('cmeq1e1op000ye12u8c1c0y94', '25-049093-3_MB3041 1-1 3min 800C 3C-m 1h B 2x1_3_SEM_1756061018355.pdf', '25-049093-3_MB3041 1-1 3min 800C 3C-m 1h B 2x1_3_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814892/graphene-uploads/sem-reports/25-049093-3_MB3041%201-1%203min%20800C%203C-m%201h%20B%202x1_3_SEM_1756061018355.pdf.pdf', NULL, '2025-02-03 07:00:00', '2025-08-24 18:43:38.377', '2025-08-24 18:43:38.377');
INSERT INTO public.sem_reports VALUES ('cmeq1c0y0000te12u74prvi5i', '25-049093-4_MRa376 2-3 7-8P 1_5min 800C 3C-m 1h Rot_SEM_1756060924084.pdf', '25-049093-4_MRa376 2-3 7-8P 1_5min 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814893/graphene-uploads/sem-reports/25-049093-4_MRa376%202-3%207-8P%201_5min%20800C%203C-m%201h%20Rot_SEM_1756060924084.pdf.pdf', NULL, '2025-02-03 07:00:00', '2025-08-24 18:42:04.105', '2025-08-24 18:42:04.105');
INSERT INTO public.sem_reports VALUES ('cmeq1ffrw0013e12ux29zsx6o', '25-049093-5_MB3043 2-3 1_5min 800C 3C-m 1h Rot_SEM_1756061083253.pdf', '25-049093-5_MB3043 2-3 1_5min 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814894/graphene-uploads/sem-reports/25-049093-5_MB3043%202-3%201_5min%20800C%203C-m%201h%20Rot_SEM_1756061083253.pdf.pdf', NULL, '2025-02-03 07:00:00', '2025-08-24 18:44:43.292', '2025-08-24 18:44:43.292');
INSERT INTO public.sem_reports VALUES ('cmeq1mnw3001ie12uc9zlftzt', '25-049197-2_MRa385 2-3 6x15sec 800C 3C-m 1h A Rot_SEM_1756061420371.pdf', '25-049197-2_MRa385 2-3 6x15sec 800C 3C-m 1h A Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814896/graphene-uploads/sem-reports/25-049197-2_MRa385%202-3%206x15sec%20800C%203C-m%201h%20A%20Rot_SEM_1756061420371.pdf.pdf', NULL, '2025-02-11 07:00:00', '2025-08-24 18:50:20.403', '2025-08-24 18:50:20.403');
INSERT INTO public.sem_reports VALUES ('cmeq1nz6k001ne12u8ovfyaua', '25-049197-3_MRa386 1-1 3min 800C 3C-m 1h A 2x2_0P_SEM_1756061481667.pdf', '25-049197-3_MRa386 1-1 3min 800C 3C-m 1h A 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814897/graphene-uploads/sem-reports/25-049197-3_MRa386%201-1%203min%20800C%203C-m%201h%20A%202x2_0P_SEM_1756061481667.pdf.pdf', NULL, '2025-02-11 07:00:00', '2025-08-24 18:51:21.692', '2025-08-24 18:51:21.692');
INSERT INTO public.sem_reports VALUES ('cmeq1k8or001de12un81haa0w', '25-049197-4_MB3046 2-3 1_5min_no-KOH_800C 3C-m 1h Rot_SEM_1756061307362.pdf', '25-049197-4_MB3046 2-3 1_5min_no-KOH_800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814898/graphene-uploads/sem-reports/25-049197-4_MB3046%202-3%201_5min_no-KOH_800C%203C-m%201h%20Rot_SEM_1756061307362.pdf.pdf', NULL, '2025-02-06 07:00:00', '2025-08-24 18:48:27.388', '2025-08-24 18:48:27.388');
INSERT INTO public.sem_reports VALUES ('cmeq3tekj0021e12uxowjijkm', '25-049270-2_MRa389B 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756065094118.pdf', '25-049270-2_MRa389B 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814900/graphene-uploads/sem-reports/25-049270-2_MRa389B%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756065094118.pdf.pdf', NULL, '2025-02-17 07:00:00', '2025-08-24 19:51:34.147', '2025-08-24 19:51:34.147');
INSERT INTO public.sem_reports VALUES ('cmeq3umh00026e12utd26ubfv', '25-049288-1_MRa389C 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756065151025.pdf', '25-049288-1_MRa389C 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814901/graphene-uploads/sem-reports/25-049288-1_MRa389C%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756065151025.pdf.pdf', NULL, '2025-02-18 07:00:00', '2025-08-24 19:52:31.044', '2025-08-24 19:52:31.044');
INSERT INTO public.sem_reports VALUES ('cmeq4088e002be12u8kfpkz4d', '25-049288-2_MB3050 1-1 90sec 800C 3C-m 1h Rot_SEM_1756065412497.pdf', '25-049288-2_MB3050 1-1 90sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814902/graphene-uploads/sem-reports/25-049288-2_MB3050%201-1%2090sec%20800C%203C-m%201h%20Rot_SEM_1756065412497.pdf.pdf', NULL, '2025-02-18 07:00:00', '2025-08-24 19:56:52.526', '2025-08-24 19:56:52.526');
INSERT INTO public.sem_reports VALUES ('cmeq46dhq002ve12uq2jwpcv8', '25-049341-2_MRa395 1-1 2P 90sec 800C 3C-m 1h A 2x1-3P_SEM_1756065699259.pdf', '25-049341-2_MRa395 1-1 2P 90sec 800C 3C-m 1h A 2x1-3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814905/graphene-uploads/sem-reports/25-049341-2_MRa395%201-1%202P%2090sec%20800C%203C-m%201h%20A%202x1-3P_SEM_1756065699259.pdf.pdf', NULL, '2025-02-24 07:00:00', '2025-08-24 20:01:39.278', '2025-08-24 20:01:39.278');
INSERT INTO public.sem_reports VALUES ('cmeq4512i002qe12u25rkhk0s', '25-049341-3_MB3054 1-1 2P 90sec 800C 3C-m 1h Rot_SEM_1756065636499.pdf', '25-049341-3_MB3054 1-1 2P 90sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814906/graphene-uploads/sem-reports/25-049341-3_MB3054%201-1%202P%2090sec%20800C%203C-m%201h%20Rot_SEM_1756065636499.pdf.pdf', NULL, '2025-02-24 07:00:00', '2025-08-24 20:00:36.523', '2025-08-24 20:00:36.523');
INSERT INTO public.sem_reports VALUES ('cmeq6qt5a0030e12u9q84fe00', '25-049419-1_MRa398A 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756070011888.pdf', '25-049419-1_MRa398A 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814909/graphene-uploads/sem-reports/25-049419-1_MRa398A%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756070011888.pdf.pdf', NULL, '2025-02-28 07:00:00', '2025-08-24 21:13:31.918', '2025-08-24 21:13:31.918');
INSERT INTO public.sem_reports VALUES ('cmeq6rvhd0035e12u3ovhc5h9', '25-049419-2_MRa398B 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756070061581.pdf', '25-049419-2_MRa398B 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814910/graphene-uploads/sem-reports/25-049419-2_MRa398B%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756070061581.pdf.pdf', NULL, '2025-02-28 07:00:00', '2025-08-24 21:14:21.601', '2025-08-24 21:14:21.601');
INSERT INTO public.sem_reports VALUES ('cmeq6uihg003ae12uep3w2jla', '25-049429-1_MB3055 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756070184709.pdf', '25-049429-1_MB3055 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814911/graphene-uploads/sem-reports/25-049429-1_MB3055%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756070184709.pdf.pdf', NULL, '2025-03-04 07:00:00', '2025-08-24 21:16:24.724', '2025-08-24 21:16:24.724');
INSERT INTO public.sem_reports VALUES ('cmeq6xsiv003je12ug2t915g5', '25-049474-2_MRa401  2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756070337670.pdf', '25-049474-2_MRa401  2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814914/graphene-uploads/sem-reports/25-049474-2_MRa401%20%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756070337670.pdf.pdf', NULL, '2025-03-11 06:00:00', '2025-08-24 21:18:57.704', '2025-08-24 21:18:57.704');
INSERT INTO public.sem_reports VALUES ('cmeq76iew003pe12u536c0nnt', '25-049474-3_MRa402  2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756070744483.pdf', '25-049474-3_MRa402  2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814915/graphene-uploads/sem-reports/25-049474-3_MRa402%20%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756070744483.pdf.pdf', NULL, '2025-03-11 06:00:00', '2025-08-24 21:25:44.504', '2025-08-24 21:25:44.504');
INSERT INTO public.sem_reports VALUES ('cmeq79gye003ue12uirygcqcu', '25-049474-4_MRa403  2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756070882562.pdf', '25-049474-4_MRa403  2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814916/graphene-uploads/sem-reports/25-049474-4_MRa403%20%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756070882562.pdf.pdf', NULL, '2025-03-11 06:00:00', '2025-08-24 21:28:02.582', '2025-08-24 21:28:02.582');
INSERT INTO public.sem_reports VALUES ('cmeq7dcav0044e12ut8al3hvi', '25-049508-2_MRa405 2-3 20P NaOH 3min 800C 3C-m 1h A 2x1_3P_SEM_1756071063157.pdf', '25-049508-2_MRa405 2-3 20P NaOH 3min 800C 3C-m 1h A 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814918/graphene-uploads/sem-reports/25-049508-2_MRa405%202-3%2020P%20NaOH%203min%20800C%203C-m%201h%20A%202x1_3P_SEM_1756071063157.pdf.pdf', NULL, '2025-03-13 06:00:00', '2025-08-24 21:31:03.176', '2025-08-24 21:31:03.176');
INSERT INTO public.sem_reports VALUES ('cmeq8q9p1006ke12uieu08lxc', '25-049667-5_MB3062 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756073345914.pdf', '25-049667-5_MB3062 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-049667-5_MB3062 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756073345914.pdf', NULL, '2025-04-02 06:00:00', '2025-08-24 22:09:05.941', '2025-08-24 22:09:05.941');
INSERT INTO public.sem_reports VALUES ('cmeq8vzev006pe12urdaj5zqk', '25-049667-4_MRa415 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756073612524.pdf', '25-049667-4_MRa415 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-049667-4_MRa415 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756073612524.pdf', NULL, '2025-04-03 06:00:00', '2025-08-24 22:13:32.552', '2025-08-24 22:13:32.552');
INSERT INTO public.sem_reports VALUES ('cmeq7o5gd004ye12u87dehbxb', '25-049538-12_MB3058 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756071567498.pdf', '25-049538-12_MB3058 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814920/graphene-uploads/sem-reports/25-049538-12_MB3058%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756071567498.pdf.pdf', NULL, '2025-03-24 06:00:00', '2025-08-24 21:39:27.517', '2025-08-24 21:39:27.517');
INSERT INTO public.sem_reports VALUES ('cmeq7u7530057e12uqmgenvos', '25-049538-13_MRa410 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756071849619.pdf', '25-049538-13_MRa410 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814921/graphene-uploads/sem-reports/25-049538-13_MRa410%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756071849619.pdf.pdf', NULL, '2025-03-25 06:00:00', '2025-08-24 21:44:09.639', '2025-08-24 21:44:09.639');
INSERT INTO public.sem_reports VALUES ('cmeq8100a005se12u7bo3erx3', '25-049538-15_MRa413A 2-3 3min 800C 3C-m 1h A 2x1.2P_SEM_1756072166965.pdf', '25-049538-15_MRa413A 2-3 3min 800C 3C-m 1h A 2x1.2P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814923/graphene-uploads/sem-reports/25-049538-15_MRa413A%202-3%203min%20800C%203C-m%201h%20A%202x1.2P_SEM_1756072166965.pdf.pdf', NULL, '2025-03-26 06:00:00', '2025-08-24 21:49:26.986', '2025-08-24 21:49:26.986');
INSERT INTO public.sem_reports VALUES ('cmeq881ju0060e12uhs4ntmrn', '25-049538-15_MRa413A 2-3 3min 800C 3C-m 1h A 2x1.2P_SEM_1756072495558.pdf', '25-049538-15_MRa413A 2-3 3min 800C 3C-m 1h A 2x1.2P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814924/graphene-uploads/sem-reports/25-049538-15_MRa413A%202-3%203min%20800C%203C-m%201h%20A%202x1.2P_SEM_1756072495558.pdf.pdf', NULL, '2025-03-25 06:00:00', '2025-08-24 21:54:55.579', '2025-08-24 21:54:55.579');
INSERT INTO public.sem_reports VALUES ('cmeq89dgh0065e12u43wm2981', '25-049538-16_MRa413B 2-3 3min 800C 3C-m 1h B 2x1.2P_SEM_1756072557642.pdf', '25-049538-16_MRa413B 2-3 3min 800C 3C-m 1h B 2x1.2P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814925/graphene-uploads/sem-reports/25-049538-16_MRa413B%202-3%203min%20800C%203C-m%201h%20B%202x1.2P_SEM_1756072557642.pdf.pdf', NULL, '2025-03-26 06:00:00', '2025-08-24 21:55:57.666', '2025-08-24 21:55:57.666');
INSERT INTO public.sem_reports VALUES ('cmeq7jndc004oe12uu19bzf56', '25-049538-2_MRa407 2-3 +H2O 3min 800C 3C-m 1h B 2x1.3P_SEM_1756071357434.pdf', '25-049538-2_MRa407 2-3 +H2O 3min 800C 3C-m 1h B 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814927/graphene-uploads/sem-reports/25-049538-2_MRa407%202-3%20%2BH2O%203min%20800C%203C-m%201h%20B%202x1.3P_SEM_1756071357434.pdf.pdf', NULL, '2025-03-18 06:00:00', '2025-08-24 21:35:57.456', '2025-08-24 21:35:57.456');
INSERT INTO public.sem_reports VALUES ('cmeq7ftn90049e12ui0c0hlft', '25-049538-3_MB3056 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756071178950.pdf', '25-049538-3_MB3056 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814928/graphene-uploads/sem-reports/25-049538-3_MB3056%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756071178950.pdf.pdf', NULL, '2025-03-18 06:00:00', '2025-08-24 21:32:58.966', '2025-08-24 21:32:58.966');
INSERT INTO public.sem_reports VALUES ('cmeq7gxdf004ee12uxv4aw4fw', '25-049538-5_MB3057 2-3 3x30sec 800C 3-Cm 1h Rot_SEM_1756071230436.pdf', '25-049538-5_MB3057 2-3 3x30sec 800C 3-Cm 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814929/graphene-uploads/sem-reports/25-049538-5_MB3057%202-3%203x30sec%20800C%203-Cm%201h%20Rot_SEM_1756071230436.pdf.pdf', NULL, '2025-03-18 06:00:00', '2025-08-24 21:33:50.451', '2025-08-24 21:33:50.451');
INSERT INTO public.sem_reports VALUES ('cmeq8cwh2006ae12u6boib8pp', '25-049667-1_MRa414A 2-3 3min 800C 3C-m 1h A 1.2+1.3P_SEM_1756072722250.pdf', '25-049667-1_MRa414A 2-3 3min 800C 3C-m 1h A 1.2+1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814931/graphene-uploads/sem-reports/25-049667-1_MRa414A%202-3%203min%20800C%203C-m%201h%20A%201.2%2B1.3P_SEM_1756072722250.pdf.pdf', NULL, '2025-04-01 06:00:00', '2025-08-24 21:58:42.278', '2025-08-24 21:58:42.278');
INSERT INTO public.sem_reports VALUES ('cmeq8e71q006fe12ulefvp44l', '25-049667-2_MRa414B 2-3 3min 800C 3C-m 1h B 1.3P_SEM_1756072782615.pdf', '25-049667-2_MRa414B 2-3 3min 800C 3C-m 1h B 1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814932/graphene-uploads/sem-reports/25-049667-2_MRa414B%202-3%203min%20800C%203C-m%201h%20B%201.3P_SEM_1756072782615.pdf.pdf', NULL, '2025-04-01 06:00:00', '2025-08-24 21:59:42.638', '2025-08-24 21:59:42.638');
INSERT INTO public.sem_reports VALUES ('cmeq8392l005ve12uob4to6gj', '25-049667-3_MB3060 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756072272025.pdf', '25-049667-3_MB3060 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814934/graphene-uploads/sem-reports/25-049667-3_MB3060%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756072272025.pdf.pdf', NULL, '2025-04-01 06:00:00', '2025-08-24 21:51:12.045', '2025-08-24 21:51:12.045');
INSERT INTO public.sem_reports VALUES ('cmeqa3hoi006ze12u8xpzdjo1', '25-049667-7_MRa416B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM_1756075642372.pdf', '25-049667-7_MRa416B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814937/graphene-uploads/sem-reports/25-049667-7_MRa416B%202-3%203min%20800C%203C-m%201h%20B%202x0.6P_SEM_1756075642372.pdf.pdf', NULL, '2025-04-03 06:00:00', '2025-08-24 22:47:22.434', '2025-08-24 22:47:22.434');
INSERT INTO public.sem_reports VALUES ('cmeqa61z90074e12uonspb98c', '25-049736-10_MB3063_MB3064_MB3066_MRa420 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756075762019.pdf', '25-049736-10_MB3063_MB3064_MB3066_MRa420 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814938/graphene-uploads/sem-reports/25-049736-10_MB3063_MB3064_MB3066_MRa420%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756075762019.pdf.pdf', NULL, '2025-04-10 06:00:00', '2025-08-24 22:49:22.054', '2025-08-24 22:49:22.054');
INSERT INTO public.sem_reports VALUES ('cmeqa7aah0079e12u5v6nm0er', '25-049736-1_MRa417A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM_1756075819465.pdf', '25-049736-1_MRa417A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814939/graphene-uploads/sem-reports/25-049736-1_MRa417A%202-3%203min%20800C%203C-m%201h%20A%202x0.6P_SEM_1756075819465.pdf.pdf', NULL, '2025-04-07 06:00:00', '2025-08-24 22:50:19.482', '2025-08-24 22:50:19.482');
INSERT INTO public.sem_reports VALUES ('cmeqaf4p1007qe12unuwcnmlf', '25-049736-3_MRa418A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM_1756076185453.pdf', '25-049736-3_MRa418A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814941/graphene-uploads/sem-reports/25-049736-3_MRa418A%202-3%203min%20800C%203C-m%201h%20A%202x0.6P_SEM_1756076185453.pdf.pdf', NULL, '2025-04-07 06:00:00', '2025-08-24 22:56:25.478', '2025-08-24 22:56:25.478');
INSERT INTO public.sem_reports VALUES ('cmeqaghyn007ve12uo93fbb3y', '25-049736-4_MRa418B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM_1756076249310.pdf', '25-049736-4_MRa418B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814943/graphene-uploads/sem-reports/25-049736-4_MRa418B%202-3%203min%20800C%203C-m%201h%20B%202x0.6P_SEM_1756076249310.pdf.pdf', NULL, '2025-08-07 06:00:00', '2025-08-24 22:57:29.328', '2025-08-24 22:57:29.328');
INSERT INTO public.sem_reports VALUES ('cmeqad5bs007le12uinvahfvw', '25-049736-7_MB3065 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756076092964.pdf', '25-049736-7_MB3065 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814947/graphene-uploads/sem-reports/25-049736-7_MB3065%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756076092964.pdf.pdf', NULL, '2025-04-09 06:00:00', '2025-08-24 22:54:52.985', '2025-08-24 22:54:52.985');
INSERT INTO public.sem_reports VALUES ('cmeqbyi0c00a2e12uduv8aes6', '25-050027-2_MB3078 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078768791.pdf', '25-050027-2_MB3078 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-050027-2_MB3078 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078768791.pdf', NULL, '2025-05-19 06:00:00', '2025-08-24 23:39:28.812', '2025-08-24 23:39:28.812');
INSERT INTO public.sem_reports VALUES ('cmeqbzmem00a7e12ue8iihhv9', '25-050027-3_MB3079 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078821142.pdf', '25-050027-3_MB3079 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-050027-3_MB3079 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078821142.pdf', NULL, '2025-05-19 06:00:00', '2025-08-24 23:40:21.166', '2025-08-24 23:40:21.166');
INSERT INTO public.sem_reports VALUES ('cmeqc1ci600ace12u8ghqwsnu', '25-050027-4_MRa429 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078901605.pdf', '25-050027-4_MRa429 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-050027-4_MRa429 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756078901605.pdf', NULL, '2025-05-19 06:00:00', '2025-08-24 23:41:41.646', '2025-08-24 23:41:41.646');
INSERT INTO public.sem_reports VALUES ('cmeqccqrg00ase12uhj0rmnkn', '25-050154-1-MRa435 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM_1756079433321.pdf', '25-050154-1-MRa435 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM.pdf', 'sem-reports/25-050154-1-MRa435 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM_1756079433321.pdf', NULL, '2025-06-02 06:00:00', '2025-08-24 23:50:33.341', '2025-08-24 23:50:33.341');
INSERT INTO public.sem_reports VALUES ('cmeqcfy0500axe12ugjfc4zn5', '25-050154-2-MRa436 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM_1756079582665.pdf', '25-050154-2-MRa436 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM.pdf', 'sem-reports/25-050154-2-MRa436 2_3 20% NaOH 3x30sec 800C 3C_m 1h Rot_SEM_1756079582665.pdf', NULL, '2025-06-02 06:00:00', '2025-08-24 23:53:02.694', '2025-08-24 23:53:02.694');
INSERT INTO public.sem_reports VALUES ('cmeqcjytu00b2e12ubhqj1771', '25-050195-1@MRa437 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM_1756079770342.pdf', '25-050195-1@MRa437 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM.pdf', 'sem-reports/25-050195-1@MRa437 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM_1756079770342.pdf', NULL, '2025-06-10 06:00:00', '2025-08-24 23:56:10.387', '2025-08-24 23:56:10.387');
INSERT INTO public.sem_reports VALUES ('cmeqcmdcn00b7e12ugu2j7xlv', '25-050195-2@MB3080 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM_1756079882495.pdf', '25-050195-2@MB3080 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM.pdf', 'sem-reports/25-050195-2@MB3080 2_3 20% 3x30sec 800C 3C_m 1h Rot_SEM_1756079882495.pdf', NULL, '2025-06-10 06:00:00', '2025-08-24 23:58:02.519', '2025-08-24 23:58:02.519');
INSERT INTO public.sem_reports VALUES ('cmeqcq9sg00bce12ud17rgb38', '25-050227-1_MB3081 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756080064493.pdf', '25-050227-1_MB3081 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'sem-reports/25-050227-1_MB3081 2-3 20% NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756080064493.pdf', NULL, '2025-06-17 06:00:00', '2025-08-25 00:01:04.528', '2025-08-25 00:01:04.528');
INSERT INTO public.sem_reports VALUES ('cmeqdcfd900c7e12uwse5hin8', '24-047052-4_MB2946A_SEM_1756081098173.pdf', '24-047052-4_MB2946A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814773/graphene-uploads/sem-reports/24-047052-4_MB2946A_SEM_1756081098173.pdf.pdf', NULL, '2024-06-07 00:00:00', '2025-08-25 00:18:18.189', '2025-08-25 00:18:18.189');
INSERT INTO public.sem_reports VALUES ('cmeqdekmv00c9e12u43y5lyph', '24-047290-1_MB2947D_SEM_1756081198308.pdf', '24-047290-1_MB2947D_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814774/graphene-uploads/sem-reports/24-047290-1_MB2947D_SEM_1756081198308.pdf.pdf', NULL, '2024-06-14 06:00:00', '2025-08-25 00:19:58.327', '2025-08-25 00:19:58.327');
INSERT INTO public.sem_reports VALUES ('cmeqan33i0087e12uz36u523s', '25-049736-6_MRa419B 2-3 1+3min 800C 3C-m 1h B 2x0.6P_SEM_1756076556623.pdf', '25-049736-6_MRa419B 2-3 1+3min 800C 3C-m 1h B 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814946/graphene-uploads/sem-reports/25-049736-6_MRa419B%202-3%201%2B3min%20800C%203C-m%201h%20B%202x0.6P_SEM_1756076556623.pdf.pdf', NULL, '2025-04-09 06:00:00', '2025-08-24 23:02:36.655', '2025-08-24 23:02:36.655');
INSERT INTO public.sem_reports VALUES ('cmeqarnw2008je12uay0ou4ld', '25-049736-9_MRa421B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM_1756076770196.pdf', '25-049736-9_MRa421B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814949/graphene-uploads/sem-reports/25-049736-9_MRa421B%202-3%203min%20800C%203C-m%201h%20B%202x0.6P_SEM_1756076770196.pdf.pdf', NULL, '2025-04-10 06:00:00', '2025-08-24 23:06:10.226', '2025-08-24 23:06:10.226');
INSERT INTO public.sem_reports VALUES ('cmeqatzfj008oe12ugvw6bdx5', '25-049815-1_MB3067_MB3068_MRa423 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756076878477.pdf', '25-049815-1_MB3067_MB3068_MRa423 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814950/graphene-uploads/sem-reports/25-049815-1_MB3067_MB3068_MRa423%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756076878477.pdf.pdf', NULL, '2025-04-17 06:00:00', '2025-08-24 23:07:58.496', '2025-08-24 23:07:58.496');
INSERT INTO public.sem_reports VALUES ('cmeqb675e008xe12uf6ox8sal', '25-049861-1_MB3069_MB3070_MB3071 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756077448348.pdf', '25-049861-1_MB3069_MB3070_MB3071 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814951/graphene-uploads/sem-reports/25-049861-1_MB3069_MB3070_MB3071%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756077448348.pdf.pdf', NULL, '2025-04-24 06:00:00', '2025-08-24 23:17:28.37', '2025-08-24 23:17:28.37');
INSERT INTO public.sem_reports VALUES ('cmeqbac2v0096e12u36nt8qrv', '25-049919-2_MB3072_MRa425 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756077641356.pdf', '25-049919-2_MB3072_MRa425 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814953/graphene-uploads/sem-reports/25-049919-2_MB3072_MRa425%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756077641356.pdf.pdf', NULL, '2025-05-02 06:00:00', '2025-08-24 23:20:41.384', '2025-08-24 23:20:41.384');
INSERT INTO public.sem_reports VALUES ('cmeqbh542009je12ufcbe8mqy', '25-049919-3_MRa426 2-3 18x5sec 800C 3C-m 1h Rot_SEM_1756077958908.pdf', '25-049919-3_MRa426 2-3 18x5sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814954/graphene-uploads/sem-reports/25-049919-3_MRa426%202-3%2018x5sec%20800C%203C-m%201h%20Rot_SEM_1756077958908.pdf.pdf', NULL, '2025-05-05 06:00:00', '2025-08-24 23:25:58.946', '2025-08-24 23:25:58.946');
INSERT INTO public.sem_reports VALUES ('cmeqbocyt009oe12u8x5nxvi4', '25-049970-1_MB3074_MB3076 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756078295683.pdf', '25-049970-1_MB3074_MB3076 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814955/graphene-uploads/sem-reports/25-049970-1_MB3074_MB3076%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756078295683.pdf.pdf', NULL, '2025-05-12 06:00:00', '2025-08-24 23:31:35.718', '2025-08-24 23:31:35.718');
INSERT INTO public.sem_reports VALUES ('cmeqc37jx00ahe12unw26ezib', '25-050103-1_MRa430_MRa431_MRa432_MRa433 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756078988509.pdf', '25-050103-1_MRa430_MRa431_MRa432_MRa433 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814959/graphene-uploads/sem-reports/25-050103-1_MRa430_MRa431_MRa432_MRa433%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756078988509.pdf.pdf', NULL, '2025-05-27 06:00:00', '2025-08-24 23:43:08.542', '2025-08-24 23:43:08.542');
INSERT INTO public.sem_reports VALUES ('cmeqcswyh00bhe12uwt26zi9b', '25-050227-2_MB3082 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756080187823.pdf', '25-050227-2_MB3082 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814962/graphene-uploads/sem-reports/25-050227-2_MB3082%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756080187823.pdf.pdf', NULL, '2025-06-16 06:00:00', '2025-08-25 00:03:07.866', '2025-08-25 00:03:07.866');
INSERT INTO public.sem_reports VALUES ('cmeqcvcin00bme12ugcjfr6kf', '25-050227-3_MRa439 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756080301318.pdf', '25-050227-3_MRa439 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814964/graphene-uploads/sem-reports/25-050227-3_MRa439%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756080301318.pdf.pdf', NULL, '2025-06-17 06:00:00', '2025-08-25 00:05:01.343', '2025-08-25 00:05:01.343');
INSERT INTO public.sem_reports VALUES ('cmeqd31sk00bye12unxplrt5c', '25-050384-1_MRa445 2-3 3x30sec 800C 3C-m 1h Rot_SEM (1)_1756080660666.pdf', '25-050384-1_MRa445 2-3 3x30sec 800C 3C-m 1h Rot_SEM (1).pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814966/graphene-uploads/sem-reports/25-050384-1_MRa445%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM%20%281%29_1756080660666.pdf.pdf', NULL, '2025-07-08 06:00:00', '2025-08-25 00:11:00.692', '2025-08-25 00:11:00.692');
INSERT INTO public.sem_reports VALUES ('cmeswjj9w000m25yfc325z84k', '24-047658-13_MB2973A_SEM_1756234274845.pdf', '24-047658-13_MB2973A_SEM.pdf', 'sem-reports/24-047658-13_MB2973A_SEM_1756234274845.pdf', NULL, '2024-08-12 06:00:00', '2025-08-26 18:51:14.901', '2025-08-26 18:51:14.901');
INSERT INTO public.sem_reports VALUES ('cmeswqlzx001a25yfkicwi4hy', '24-047868-2_MB2979B  2-3 2_5m 800C 1h A_SEM_1756234604974.pdf', '24-047868-2_MB2979B  2-3 2_5m 800C 1h A_SEM.pdf', 'sem-reports/24-047868-2_MB2979B  2-3 2_5m 800C 1h A_SEM_1756234604974.pdf', NULL, '2024-08-23 06:00:00', '2025-08-26 18:56:45.021', '2025-08-26 18:56:45.021');
INSERT INTO public.sem_reports VALUES ('cmeswrwi0001g25yf3ruusbdj', '24-047658-23_MB2980A 2-3 20m 800C 1h B 0_6P_SEM_1756234665258.pdf', '24-047658-23_MB2980A 2-3 20m 800C 1h B 0_6P_SEM.pdf', 'sem-reports/24-047658-23_MB2980A 2-3 20m 800C 1h B 0_6P_SEM_1756234665258.pdf', NULL, '2024-08-29 06:00:00', '2025-08-26 18:57:45.288', '2025-08-26 18:57:45.288');
INSERT INTO public.sem_reports VALUES ('cmeqdjw5600cle12udssv3f00', '24-047368-1_MB2952C_SEM_1756081446495.pdf', '24-047368-1_MB2952C_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814778/graphene-uploads/sem-reports/24-047368-1_MB2952C_SEM_1756081446495.pdf.pdf', NULL, '2024-06-19 06:00:00', '2025-08-25 00:24:06.522', '2025-08-25 00:24:06.522');
INSERT INTO public.sem_reports VALUES ('cmeqdkark00coe12uxore1fjy', '24-047368-2_MB2952C2_SEM_1756081465450.pdf', '24-047368-2_MB2952C2_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814779/graphene-uploads/sem-reports/24-047368-2_MB2952C2_SEM_1756081465450.pdf.pdf', NULL, '2024-06-19 06:00:00', '2025-08-25 00:24:25.472', '2025-08-25 00:24:25.472');
INSERT INTO public.sem_reports VALUES ('cmeqdlnh400cue12u5536uagc', '24-047491-1_MB2955A2_SEM_1756081528581.pdf', '24-047491-1_MB2955A2_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814781/graphene-uploads/sem-reports/24-047491-1_MB2955A2_SEM_1756081528581.pdf.pdf', NULL, '2024-06-28 06:00:00', '2025-08-25 00:25:28.6', '2025-08-25 00:25:28.6');
INSERT INTO public.sem_reports VALUES ('cmeqdmev900cxe12u9oqvqiil', '24-047511-1_TB1136_SEM_1756081564074.pdf', '24-047511-1_TB1136_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814782/graphene-uploads/sem-reports/24-047511-1_TB1136_SEM_1756081564074.pdf.pdf', NULL, '2024-07-08 06:00:00', '2025-08-25 00:26:04.102', '2025-08-25 00:26:04.102');
INSERT INTO public.sem_reports VALUES ('cmeqdnsr600d3e12uihsc7fv1', '24-047558-1_MB2962B_SEM_1756081628733.pdf', '24-047558-1_MB2962B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814784/graphene-uploads/sem-reports/24-047558-1_MB2962B_SEM_1756081628733.pdf.pdf', NULL, '2024-07-10 06:00:00', '2025-08-25 00:27:08.754', '2025-08-25 00:27:08.754');
INSERT INTO public.sem_reports VALUES ('cmeqdotr300d6e12u9glyueh6', '24-047558-2_MB2963A_SEM_1756081676679.pdf', '24-047558-2_MB2963A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814785/graphene-uploads/sem-reports/24-047558-2_MB2963A_SEM_1756081676679.pdf.pdf', NULL, '2025-07-12 06:00:00', '2025-08-25 00:27:56.703', '2025-08-25 00:27:56.703');
INSERT INTO public.sem_reports VALUES ('cmeqdq24500dce12uuedepk0e', '24-047592-1_TB1137-1_SEM_1756081734161.pdf', '24-047592-1_TB1137-1_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814788/graphene-uploads/sem-reports/24-047592-1_TB1137-1_SEM_1756081734161.pdf.pdf', NULL, '2024-07-17 06:00:00', '2025-08-25 00:28:54.198', '2025-08-25 00:28:54.198');
INSERT INTO public.sem_reports VALUES ('cmeqdqeeu00dfe12ux27y5vh9', '24-047623-1_TB1137-2_SEM_1756081750114.pdf', '24-047623-1_TB1137-2_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814790/graphene-uploads/sem-reports/24-047623-1_TB1137-2_SEM_1756081750114.pdf.pdf', NULL, '2024-07-17 06:00:00', '2025-08-25 00:29:10.134', '2025-08-25 00:29:10.134');
INSERT INTO public.sem_reports VALUES ('cmeqdroyx00dle12u5c1xyy6f', '24-047652-1_MB2965A_SEM_1756081810438.pdf', '24-047652-1_MB2965A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814792/graphene-uploads/sem-reports/24-047652-1_MB2965A_SEM_1756081810438.pdf.pdf', NULL, '2024-07-25 06:00:00', '2025-08-25 00:30:10.473', '2025-08-25 00:30:10.473');
INSERT INTO public.sem_reports VALUES ('cmeswckob000d25yfjveecifh', '24-047658-10_MB2971B_SEM_1756233950100.pdf', '24-047658-10_MB2971B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814793/graphene-uploads/sem-reports/24-047658-10_MB2971B_SEM_1756233950100.pdf.pdf', NULL, '2024-08-06 06:00:00', '2025-08-26 18:45:50.123', '2025-08-26 18:45:50.123');
INSERT INTO public.sem_reports VALUES ('cmeswioe5000g25yfuotq1max', '24-047658-11_MB2972A_SEM_1756234234840.pdf', '24-047658-11_MB2972A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814794/graphene-uploads/sem-reports/24-047658-11_MB2972A_SEM_1756234234840.pdf.pdf', NULL, '2024-08-07 06:00:00', '2025-08-26 18:50:34.878', '2025-08-26 18:50:34.878');
INSERT INTO public.sem_reports VALUES ('cmeswjxjs000p25yfzfmvgc6h', '24-047658-14_MB2973B_SEM_1756234293376.pdf', '24-047658-14_MB2973B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814797/graphene-uploads/sem-reports/24-047658-14_MB2973B_SEM_1756234293376.pdf.pdf', NULL, '2024-08-12 06:00:00', '2025-08-26 18:51:33.401', '2025-08-26 18:51:33.401');
INSERT INTO public.sem_reports VALUES ('cmeswkdp1000s25yf9vxw4p0v', '24-047658-15_MB2974A_SEM_1756234314291.pdf', '24-047658-15_MB2974A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814798/graphene-uploads/sem-reports/24-047658-15_MB2974A_SEM_1756234314291.pdf.pdf', NULL, '2024-08-15 06:00:00', '2025-08-26 18:51:54.325', '2025-08-26 18:51:54.325');
INSERT INTO public.sem_reports VALUES ('cmeswlsgk000y25yfq7y3zb1x', '24-047658-17_MB2975A_SEM_1756234380085.pdf', '24-047658-17_MB2975A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814800/graphene-uploads/sem-reports/24-047658-17_MB2975A_SEM_1756234380085.pdf.pdf', NULL, '2024-08-19 06:00:00', '2025-08-26 18:53:00.116', '2025-08-26 18:53:00.116');
INSERT INTO public.sem_reports VALUES ('cmeswm4ei001125yf9cy7p7me', '24-047658-18_MB2975B_SEM_1756234395559.pdf', '24-047658-18_MB2975B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814801/graphene-uploads/sem-reports/24-047658-18_MB2975B_SEM_1756234395559.pdf.pdf', NULL, '2024-08-19 06:00:00', '2025-08-26 18:53:15.594', '2025-08-26 18:53:15.594');
INSERT INTO public.sem_reports VALUES ('cmeqdsfoz00dre12u20k5m5yn', '24-047658-1_MB2965B2_SEM_1756081845081.pdf', '24-047658-1_MB2965B2_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814804/graphene-uploads/sem-reports/24-047658-1_MB2965B2_SEM_1756081845081.pdf.pdf', NULL, '2024-07-25 06:00:00', '2025-08-25 00:30:45.108', '2025-08-25 00:30:45.108');
INSERT INTO public.sem_reports VALUES ('cmeqds20800doe12un5n0wqsw', '24-047658-1_MB2965B_SEM_1756081827349.pdf', '24-047658-1_MB2965B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814805/graphene-uploads/sem-reports/24-047658-1_MB2965B_SEM_1756081827349.pdf.pdf', NULL, '2024-07-25 06:00:00', '2025-08-25 00:30:27.369', '2025-08-25 00:30:27.369');
INSERT INTO public.sem_reports VALUES ('cmeswscvz001j25yf98ph1b6o', '24-047658-24_MB2980B 2-3 10m 800C 1h A 0_6P_SEM_1756234686494.pdf', '24-047658-24_MB2980B 2-3 10m 800C 1h A 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814808/graphene-uploads/sem-reports/24-047658-24_MB2980B%202-3%2010m%20800C%201h%20A%200_6P_SEM_1756234686494.pdf.pdf', NULL, '2024-08-29 06:00:00', '2025-08-26 18:58:06.528', '2025-08-26 18:58:06.528');
INSERT INTO public.sem_reports VALUES ('cmeqdtbq300due12u2k1u3wtr', '24-047658-3_MB2966A_SEM_1756081886587.pdf', '24-047658-3_MB2966A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814809/graphene-uploads/sem-reports/24-047658-3_MB2966A_SEM_1756081886587.pdf.pdf', NULL, '2024-07-30 06:00:00', '2025-08-25 00:31:26.619', '2025-08-25 00:31:26.619');
INSERT INTO public.sem_reports VALUES ('cmeqduhiz00dxe12u5ajhiuwu', '24-047658-5_MB2967A_SEM_1756081940764.pdf', '24-047658-5_MB2967A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814810/graphene-uploads/sem-reports/24-047658-5_MB2967A_SEM_1756081940764.pdf.pdf', NULL, '2025-07-30 06:00:00', '2025-08-25 00:32:20.795', '2025-08-25 00:32:20.795');
INSERT INTO public.sem_reports VALUES ('cmeswb64k000425yfzandce5a', '24-047658-7_MB2970A_SEM_1756233884553.pdf', '24-047658-7_MB2970A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814812/graphene-uploads/sem-reports/24-047658-7_MB2970A_SEM_1756233884553.pdf.pdf', NULL, '2024-07-31 06:00:00', '2025-08-26 18:44:44.612', '2025-08-26 18:44:44.612');
INSERT INTO public.sem_reports VALUES ('cmeswblfm000725yfbrq2lkl3', '24-047658-8_MB2970B_SEM_1756233904425.pdf', '24-047658-8_MB2970B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814813/graphene-uploads/sem-reports/24-047658-8_MB2970B_SEM_1756233904425.pdf.pdf', NULL, '2024-07-31 06:00:00', '2025-08-26 18:45:04.451', '2025-08-26 18:45:04.451');
INSERT INTO public.sem_reports VALUES ('cmeswr1qg001d25yfwmkvrako', '24-047868-1_MB2979A  2-3 2_5m 800C 1h B_SEM_1756234625381.pdf', '24-047868-1_MB2979A  2-3 2_5m 800C 1h B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814815/graphene-uploads/sem-reports/24-047868-1_MB2979A%20%202-3%202_5m%20800C%201h%20B_SEM_1756234625381.pdf.pdf', NULL, '2024-08-23 06:00:00', '2025-08-26 18:57:05.416', '2025-08-26 18:57:05.416');
INSERT INTO public.sem_reports VALUES ('cmesx389p002m25yfr6igzchz', '24-047983-2_KJo-0171B  2-3 5m 800C 3C_m 1h A 0_6P_SEM_1756235193716.pdf', '24-047983-2_KJo-0171B  2-3 5m 800C 3C_m 1h A 0_6P_SEM.pdf', 'sem-reports/24-047983-2_KJo-0171B  2-3 5m 800C 3C_m 1h A 0_6P_SEM_1756235193716.pdf', NULL, '2024-09-09 06:00:00', '2025-08-26 19:06:33.757', '2025-08-26 19:06:33.757');
INSERT INTO public.sem_reports VALUES ('cmeqd8ukf00c1e12uzan6q2yg', '24-047052-1_TB1133_SEM_mit-Pt_1756080931235.pdf', '24-047052-1_TB1133_SEM_mit-Pt.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814769/graphene-uploads/sem-reports/24-047052-1_TB1133_SEM_mit-Pt_1756080931235.pdf.pdf', NULL, '2024-05-27 06:00:00', '2025-08-25 00:15:31.263', '2025-08-25 00:15:31.263');
INSERT INTO public.sem_reports VALUES ('cmeswufog001p25yftvblarmh', '24-047909-3_KJo-0165A  2-3 10m 800C 1h A_SEM_1756234783431.pdf', '24-047909-3_KJo-0165A  2-3 10m 800C 1h A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814819/graphene-uploads/sem-reports/24-047909-3_KJo-0165A%20%202-3%2010m%20800C%201h%20A_SEM_1756234783431.pdf.pdf', NULL, '2024-08-29 06:00:00', '2025-08-26 18:59:43.456', '2025-08-26 18:59:43.456');
INSERT INTO public.sem_reports VALUES ('cmeswwekk001v25yfhffv4a0q', '24-047917-1_KJo-0166A  2-3 10m 800C 10C_m 1h A_SEM_1756234875307.pdf', '24-047917-1_KJo-0166A  2-3 10m 800C 10C_m 1h A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814820/graphene-uploads/sem-reports/24-047917-1_KJo-0166A%20%202-3%2010m%20800C%2010C_m%201h%20A_SEM_1756234875307.pdf.pdf', NULL, '2024-09-03 06:00:00', '2025-08-26 19:01:15.333', '2025-08-26 19:01:15.333');
INSERT INTO public.sem_reports VALUES ('cmeswwqxm001y25yfaarnc83j', '24-047917-2_KJo-0166B  2-3 20m 800C 10C_m 1h B_SEM_1756234891304.pdf', '24-047917-2_KJo-0166B  2-3 20m 800C 10C_m 1h B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814821/graphene-uploads/sem-reports/24-047917-2_KJo-0166B%20%202-3%2020m%20800C%2010C_m%201h%20B_SEM_1756234891304.pdf.pdf', NULL, '2024-09-03 06:00:00', '2025-08-26 19:01:31.355', '2025-08-26 19:01:31.355');
INSERT INTO public.sem_reports VALUES ('cmeswyw82002425yfq98arku3', '24-047917-4_KJo-0167B  2-3 20m 800C 3C_m 4h B 0_6P_SEM_1756234991491.pdf', '24-047917-4_KJo-0167B  2-3 20m 800C 3C_m 4h B 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814823/graphene-uploads/sem-reports/24-047917-4_KJo-0167B%20%202-3%2020m%20800C%203C_m%204h%20B%200_6P_SEM_1756234991491.pdf.pdf', NULL, '2024-09-03 06:00:00', '2025-08-26 19:03:11.522', '2025-08-26 19:03:11.522');
INSERT INTO public.sem_reports VALUES ('cmeswzjaf002725yfl290jd9v', '24-047917-5_KJo-0168A  2-3 10m 900C 3C_m 2h A 0_6P_SEM_1756235021388.pdf', '24-047917-5_KJo-0168A  2-3 10m 900C 3C_m 2h A 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814824/graphene-uploads/sem-reports/24-047917-5_KJo-0168A%20%202-3%2010m%20900C%203C_m%202h%20A%200_6P_SEM_1756235021388.pdf.pdf', NULL, '2024-09-08 06:00:00', '2025-08-26 19:03:41.415', '2025-08-26 19:03:41.415');
INSERT INTO public.sem_reports VALUES ('cmeswzx75002a25yf6lkvjsba', '24-047917-6_KJo-0168B  2-3 20m 900C 3C_m 1h B 0_6P_SEM_1756235039405.pdf', '24-047917-6_KJo-0168B  2-3 20m 900C 3C_m 1h B 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814825/graphene-uploads/sem-reports/24-047917-6_KJo-0168B%20%202-3%2020m%20900C%203C_m%201h%20B%200_6P_SEM_1756235039405.pdf.pdf', NULL, '2024-09-08 06:00:00', '2025-08-26 19:03:59.441', '2025-08-26 19:03:59.441');
INSERT INTO public.sem_reports VALUES ('cmesx2blr002g25yff5i8c410', '24-047917-8_KJo-0170  2-3 20m 800C 3C_m 1h B 2_7P_SEM_1756235151392.pdf', '24-047917-8_KJo-0170  2-3 20m 800C 3C_m 1h B 2_7P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814827/graphene-uploads/sem-reports/24-047917-8_KJo-0170%20%202-3%2020m%20800C%203C_m%201h%20B%202_7P_SEM_1756235151392.pdf.pdf', NULL, '2024-09-05 06:00:00', '2025-08-26 19:05:51.423', '2025-08-26 19:05:51.423');
INSERT INTO public.sem_reports VALUES ('cmesx2w8s002j25yfg69b8cd8', '24-047983-1_KJo-0171A  2-3 5m 800C 3C_m 1h B 2x2_0P_SEM_1756235178141.pdf', '24-047983-1_KJo-0171A  2-3 5m 800C 3C_m 1h B 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814828/graphene-uploads/sem-reports/24-047983-1_KJo-0171A%20%202-3%205m%20800C%203C_m%201h%20B%202x2_0P_SEM_1756235178141.pdf.pdf', NULL, '2024-09-09 06:00:00', '2025-08-26 19:06:18.173', '2025-08-26 19:06:18.173');
INSERT INTO public.sem_reports VALUES ('cmesx43hr002s25yfta1a4l9z', '24-047983-4_KJo-0172B  1-1 2_5m 800C 3C_m 2h A 1_0P_SEM_1756235234197.pdf', '24-047983-4_KJo-0172B  1-1 2_5m 800C 3C_m 2h A 1_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814831/graphene-uploads/sem-reports/24-047983-4_KJo-0172B%20%201-1%202_5m%20800C%203C_m%202h%20A%201_0P_SEM_1756235234197.pdf.pdf', NULL, '2024-09-09 06:00:00', '2025-08-26 19:07:14.223', '2025-08-26 19:07:14.223');
INSERT INTO public.sem_reports VALUES ('cmex7oxou0001vjz5viwswhfa', '24-048023-1_KJo-0175  2-3 5m 800C 3C_m 1h A 2x2_0P_SEM_1756494867309.pdf', '24-048023-1_KJo-0175  2-3 5m 800C 3C_m 1h A 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814832/graphene-uploads/sem-reports/24-048023-1_KJo-0175%20%202-3%205m%20800C%203C_m%201h%20A%202x2_0P_SEM_1756494867309.pdf.pdf', NULL, '2024-09-16 06:00:00', '2025-08-29 19:14:27.342', '2025-08-29 19:14:27.342');
INSERT INTO public.sem_reports VALUES ('cmex7pk070004vjz5aakzrqum', '24-048023-2_KJo-0176  2-3 5m 800C 1_5C_m 1h B 0_6P_SEM_1756494896232.pdf', '24-048023-2_KJo-0176  2-3 5m 800C 1_5C_m 1h B 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814833/graphene-uploads/sem-reports/24-048023-2_KJo-0176%20%202-3%205m%20800C%201_5C_m%201h%20B%200_6P_SEM_1756494896232.pdf.pdf', NULL, '2024-09-16 06:00:00', '2025-08-29 19:14:56.263', '2025-08-29 19:14:56.263');
INSERT INTO public.sem_reports VALUES ('cmex7rd6l000avjz5z4y8r0ct', '24-048023-4_KJo-0177  2-3 5m 800C 3C_m 1h A 2x2_0P_SEM_1756494980704.pdf', '24-048023-4_KJo-0177  2-3 5m 800C 3C_m 1h A 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814834/graphene-uploads/sem-reports/24-048023-4_KJo-0177%20%202-3%205m%20800C%203C_m%201h%20A%202x2_0P_SEM_1756494980704.pdf.pdf', NULL, '2024-09-16 06:00:00', '2025-08-29 19:16:20.733', '2025-08-29 19:16:20.733');
INSERT INTO public.sem_reports VALUES ('cmex7sa1k000dvjz5yhgcvtki', '24-048023-5_KJo-0178  2-3 1-5m 800C 3C_m 1h A 2x2_0P_SEM_1756495023297.pdf', '24-048023-5_KJo-0178  2-3 1-5m 800C 3C_m 1h A 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814835/graphene-uploads/sem-reports/24-048023-5_KJo-0178%20%202-3%201-5m%20800C%203C_m%201h%20A%202x2_0P_SEM_1756495023297.pdf.pdf', NULL, '2024-09-16 06:00:00', '2025-08-29 19:17:03.32', '2025-08-29 19:17:03.32');
INSERT INTO public.sem_reports VALUES ('cmex7t0ga000gvjz5gw3t9f3f', '24-048023-6_MB2981A 2-3 1-5m 800C 3C-m 1h B 6x0_6P_SEM_1756495057525.pdf', '24-048023-6_MB2981A 2-3 1-5m 800C 3C-m 1h B 6x0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814836/graphene-uploads/sem-reports/24-048023-6_MB2981A%202-3%201-5m%20800C%203C-m%201h%20B%206x0_6P_SEM_1756495057525.pdf.pdf', NULL, '2024-09-18 06:00:00', '2025-08-29 19:17:37.546', '2025-08-29 19:17:37.546');
INSERT INTO public.sem_reports VALUES ('cmex7w32w000mvjz5v9omfcic', '24-048142-1_TB1139 2-3 5m 800C 3C-m 1h A 2x1_7P_SEM_1756495200898.pdf', '24-048142-1_TB1139 2-3 5m 800C 3C-m 1h A 2x1_7P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814838/graphene-uploads/sem-reports/24-048142-1_TB1139%202-3%205m%20800C%203C-m%201h%20A%202x1_7P_SEM_1756495200898.pdf.pdf', NULL, '2024-09-26 06:00:00', '2025-08-29 19:20:00.92', '2025-08-29 19:20:00.92');
INSERT INTO public.sem_reports VALUES ('cmex7wssi000pvjz5ubz2vw6y', '24-048142-2_TB1140A 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM_1756495234168.pdf', '24-048142-2_TB1140A 2-3 5m 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814839/graphene-uploads/sem-reports/24-048142-2_TB1140A%202-3%205m%20800C%203C-m%201h%20A%202x1_6P_SEM_1756495234168.pdf.pdf', NULL, '2024-09-26 06:00:00', '2025-08-29 19:20:34.243', '2025-08-29 19:20:34.243');
INSERT INTO public.sem_reports VALUES ('cmex7x8lc000svjz5oux50ueu', '24-048142-3_TB1140B 2-3 5m 800C 3C-m 1h B 2x1_6P_SEM_1756495254699.pdf', '24-048142-3_TB1140B 2-3 5m 800C 3C-m 1h B 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814840/graphene-uploads/sem-reports/24-048142-3_TB1140B%202-3%205m%20800C%203C-m%201h%20B%202x1_6P_SEM_1756495254699.pdf.pdf', NULL, '2024-09-26 06:00:00', '2025-08-29 19:20:54.721', '2025-08-29 19:20:54.721');
INSERT INTO public.sem_reports VALUES ('cmf7cvswl00003oklfw91wa8y', '25-050404-1_TB1180A_SEM_1757108247536.pdf', '25-050404-1_TB1180A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814967/graphene-uploads/sem-reports/25-050404-1_TB1180A_SEM_1757108247536.pdf.pdf', NULL, '2025-07-10 00:00:00', '2025-09-05 21:37:27.573', '2025-09-05 21:37:27.573');
INSERT INTO public.sem_reports VALUES ('cmeqdaii000c4e12ui24mvhry', '24-047052-3_MB2946X_gem_SEM_1756081008912.pdf', '24-047052-3_MB2946X_gem_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814772/graphene-uploads/sem-reports/24-047052-3_MB2946X_gem_SEM_1756081008912.pdf.pdf', NULL, '2024-06-07 06:00:00', '2025-08-25 00:16:48.937', '2025-08-25 00:16:48.937');
INSERT INTO public.sem_reports VALUES ('cmeqdi1x900cce12usywfvdr3', '24-047317-1_TB1135-1_SEM_1756081360677.pdf', '24-047317-1_TB1135-1_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814775/graphene-uploads/sem-reports/24-047317-1_TB1135-1_SEM_1756081360677.pdf.pdf', NULL, '2024-06-17 06:00:00', '2025-08-25 00:22:40.701', '2025-08-25 00:22:40.701');
INSERT INTO public.sem_reports VALUES ('cmeqdidl700cfe12u75bjbueq', '24-047344-1_TB1135-2_SEM_1756081375790.pdf', '24-047344-1_TB1135-2_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814776/graphene-uploads/sem-reports/24-047344-1_TB1135-2_SEM_1756081375790.pdf.pdf', NULL, '2024-06-17 06:00:00', '2025-08-25 00:22:55.819', '2025-08-25 00:22:55.819');
INSERT INTO public.sem_reports VALUES ('cmeqdjixh00cie12u5yxr0xa3', '24-047344-2_MB2952B_SEM_1756081429361.pdf', '24-047344-2_MB2952B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814777/graphene-uploads/sem-reports/24-047344-2_MB2952B_SEM_1756081429361.pdf.pdf', NULL, '2024-06-19 06:00:00', '2025-08-25 00:23:49.398', '2025-08-25 00:23:49.398');
INSERT INTO public.sem_reports VALUES ('cmeqdl8h400cre12uur9160n0', '24-047441-1_MB2955A_SEM_1756081509134.pdf', '24-047441-1_MB2955A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814780/graphene-uploads/sem-reports/24-047441-1_MB2955A_SEM_1756081509134.pdf.pdf', NULL, '2024-06-28 06:00:00', '2025-08-25 00:25:09.16', '2025-08-25 00:25:09.16');
INSERT INTO public.sem_reports VALUES ('cmeqdnhno00d0e12uth3okzb9', '24-047529-1_MB2962A_SEM_1756081614348.pdf', '24-047529-1_MB2962A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814783/graphene-uploads/sem-reports/24-047529-1_MB2962A_SEM_1756081614348.pdf.pdf', NULL, '2025-07-10 06:00:00', '2025-08-25 00:26:54.373', '2025-08-25 00:26:54.373');
INSERT INTO public.sem_reports VALUES ('cmeqdp6ky00d9e12ulfl9mg22', '24-047558-3_MB2963B_SEM_1756081693296.pdf', '24-047558-3_MB2963B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814787/graphene-uploads/sem-reports/24-047558-3_MB2963B_SEM_1756081693296.pdf.pdf', NULL, '2024-07-12 06:00:00', '2025-08-25 00:28:13.331', '2025-08-25 00:28:13.331');
INSERT INTO public.sem_reports VALUES ('cmeqdqrm300die12u6c4aru2n', '24-047628-1_TB1137-3_SEM_1756081767212.pdf', '24-047628-1_TB1137-3_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814791/graphene-uploads/sem-reports/24-047628-1_TB1137-3_SEM_1756081767212.pdf.pdf', NULL, '2024-07-17 06:00:00', '2025-08-25 00:29:27.243', '2025-08-25 00:29:27.243');
INSERT INTO public.sem_reports VALUES ('cmeswj0jq000j25yftnovb8eh', '24-047658-12_MB2972B_SEM_1756234250603.pdf', '24-047658-12_MB2972B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814795/graphene-uploads/sem-reports/24-047658-12_MB2972B_SEM_1756234250603.pdf.pdf', NULL, '2024-08-07 06:00:00', '2025-08-26 18:50:50.631', '2025-08-26 18:50:50.631');
INSERT INTO public.sem_reports VALUES ('cmeswkrls000v25yfmg5va5xg', '24-047658-16_MB2974B_SEM_1756234332320.pdf', '24-047658-16_MB2974B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814799/graphene-uploads/sem-reports/24-047658-16_MB2974B_SEM_1756234332320.pdf.pdf', NULL, '2024-08-15 06:00:00', '2025-08-26 18:52:12.352', '2025-08-26 18:52:12.352');
INSERT INTO public.sem_reports VALUES ('cmeswmk04001425yf1nxngql8', '24-047658-19_MB2976A_SEM_1756234415762.pdf', '24-047658-19_MB2976A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814803/graphene-uploads/sem-reports/24-047658-19_MB2976A_SEM_1756234415762.pdf.pdf', NULL, '2024-08-19 06:00:00', '2025-08-26 18:53:35.812', '2025-08-26 18:53:35.812');
INSERT INTO public.sem_reports VALUES ('cmeswmwjz001725yf7shc2pv3', '24-047658-20_MB2976B_SEM_1756234432037.pdf', '24-047658-20_MB2976B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814806/graphene-uploads/sem-reports/24-047658-20_MB2976B_SEM_1756234432037.pdf.pdf', NULL, '2024-08-19 06:00:00', '2025-08-26 18:53:52.08', '2025-08-26 18:53:52.08');
INSERT INTO public.sem_reports VALUES ('cmeqdutvy00e0e12ugac0lv60', '24-047658-6_MB2967B_SEM_1756081956777.pdf', '24-047658-6_MB2967B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814811/graphene-uploads/sem-reports/24-047658-6_MB2967B_SEM_1756081956777.pdf.pdf', NULL, '2024-07-30 06:00:00', '2025-08-25 00:32:36.815', '2025-08-25 00:32:36.815');
INSERT INTO public.sem_reports VALUES ('cmeswc3dj000a25yfbqxztin8', '24-047658-9_MB2971A_SEM_1756233927675.pdf', '24-047658-9_MB2971A_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814814/graphene-uploads/sem-reports/24-047658-9_MB2971A_SEM_1756233927675.pdf.pdf', NULL, '2024-08-08 06:00:00', '2025-08-26 18:45:27.704', '2025-08-26 18:45:27.704');
INSERT INTO public.sem_reports VALUES ('cmeswt30e001m25yff8tsrbci', '24-047909-1_MB2980C  2-3 20m 800C 1h B 1_3P_SEM_1756234720353.pdf', '24-047909-1_MB2980C  2-3 20m 800C 1h B 1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814818/graphene-uploads/sem-reports/24-047909-1_MB2980C%20%202-3%2020m%20800C%201h%20B%201_3P_SEM_1756234720353.pdf.pdf', NULL, '2024-08-29 06:00:00', '2025-08-26 18:58:40.383', '2025-08-26 18:58:40.383');
INSERT INTO public.sem_reports VALUES ('cmeswuq4r001s25yf9gm0fpsf', '24-047909-4_KJo-0165B  2-3 20m 800C 1h B_SEM_1756234796969.pdf', '24-047909-4_KJo-0165B  2-3 20m 800C 1h B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814820/graphene-uploads/sem-reports/24-047909-4_KJo-0165B%20%202-3%2020m%20800C%201h%20B_SEM_1756234796969.pdf.pdf', NULL, '2024-08-29 06:00:00', '2025-08-26 18:59:57.003', '2025-08-26 18:59:57.003');
INSERT INTO public.sem_reports VALUES ('cmeswykpc002125yfeg8qr9yr', '24-047917-3_KJo-0167A  2-3 10m 800C 3C_m 4h A 0_6P_SEM_1756234976562.pdf', '24-047917-3_KJo-0167A  2-3 10m 800C 3C_m 4h A 0_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814822/graphene-uploads/sem-reports/24-047917-3_KJo-0167A%20%202-3%2010m%20800C%203C_m%204h%20A%200_6P_SEM_1756234976562.pdf.pdf', NULL, '2024-09-03 06:00:00', '2025-08-26 19:02:56.592', '2025-08-26 19:02:56.592');
INSERT INTO public.sem_reports VALUES ('cmesx1ou7002d25yfz6f4r7jd', '24-047917-7_KJo-0169  2-3 10m 800C 3C_m 1h B 2_0P_SEM_1756235121887.pdf', '24-047917-7_KJo-0169  2-3 10m 800C 3C_m 1h B 2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814826/graphene-uploads/sem-reports/24-047917-7_KJo-0169%20%202-3%2010m%20800C%203C_m%201h%20B%202_0P_SEM_1756235121887.pdf.pdf', NULL, '2024-09-05 06:00:00', '2025-08-26 19:05:21.92', '2025-08-26 19:05:21.92');
INSERT INTO public.sem_reports VALUES ('cmesx3sd0002p25yfidknufnf', '24-047983-3_KJo-0172A  1-1 2_5m 800C 3C_m 1h B 1_0P_SEM_1756235219767.pdf', '24-047983-3_KJo-0172A  1-1 2_5m 800C 3C_m 1h B 1_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814830/graphene-uploads/sem-reports/24-047983-3_KJo-0172A%20%201-1%202_5m%20800C%203C_m%201h%20B%201_0P_SEM_1756235219767.pdf.pdf', NULL, '2024-09-09 06:00:00', '2025-08-26 19:06:59.797', '2025-08-26 19:06:59.797');
INSERT INTO public.sem_reports VALUES ('cmex7qv7x0007vjz5lx7m2rnd', '24-048023-3_KJo-0171A  2-3 5m 800C 3C_m 1h B 2x2_0P GR_SEM_1756494957432.pdf', '24-048023-3_KJo-0171A  2-3 5m 800C 3C_m 1h B 2x2_0P GR_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814833/graphene-uploads/sem-reports/24-048023-3_KJo-0171A%20%202-3%205m%20800C%203C_m%201h%20B%202x2_0P%20GR_SEM_1756494957432.pdf.pdf', NULL, '2024-09-16 06:00:00', '2025-08-29 19:15:57.453', '2025-08-29 19:15:57.453');
INSERT INTO public.sem_reports VALUES ('cmex7ue2o000jvjz5sy8ak617', '24-048066-1_TB1138 2-3 5m 800C 3C-m 1h A 2x2_0P_SEM_1756495121821.pdf', '24-048066-1_TB1138 2-3 5m 800C 3C-m 1h A 2x2_0P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814837/graphene-uploads/sem-reports/24-048066-1_TB1138%202-3%205m%20800C%203C-m%201h%20A%202x2_0P_SEM_1756495121821.pdf.pdf', NULL, '2024-09-18 06:00:00', '2025-08-29 19:18:41.856', '2025-08-29 19:18:41.856');
INSERT INTO public.sem_reports VALUES ('cmeoqegpq00002er8t9hdkk97', '24-048326-1_TB1144A 2-3 15Hz80sec 800C 3C-m 1h A 2_6g nP_SEM_1755982095866.pdf', '24-048326-1_TB1144A 2-3 15Hz80sec 800C 3C-m 1h A 2_6g nP_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814841/graphene-uploads/sem-reports/24-048326-1_TB1144A%202-3%2015Hz80sec%20800C%203C-m%201h%20A%202_6g%20nP_SEM_1755982095866.pdf.pdf', NULL, '2024-10-21 00:00:00', '2025-08-23 20:48:15.902', '2025-08-23 20:48:15.902');
INSERT INTO public.sem_reports VALUES ('cmeoql35200052er8vh9em3hb', '24-048326-2_TB1144B 2-3 15Hz80sec 800C 3C-m 1h B 2x1_6P_SEM_1755982404865.pdf', '24-048326-2_TB1144B 2-3 15Hz80sec 800C 3C-m 1h B 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814842/graphene-uploads/sem-reports/24-048326-2_TB1144B%202-3%2015Hz80sec%20800C%203C-m%201h%20B%202x1_6P_SEM_1755982404865.pdf.pdf', NULL, '2024-10-21 00:00:00', '2025-08-23 20:53:24.902', '2025-08-23 20:53:24.902');
INSERT INTO public.sem_reports VALUES ('cmeoqvquv000p2er8ehsszlb9', '24-048359-2_MB2999B 2-3 25Hz80sec 800C 3C-m 1h A 2_6g np_SEM_1755982902178.pdf', '24-048359-2_MB2999B 2-3 25Hz80sec 800C 3C-m 1h A 2_6g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814847/graphene-uploads/sem-reports/24-048359-2_MB2999B%202-3%2025Hz80sec%20800C%203C-m%201h%20A%202_6g%20np_SEM_1755982902178.pdf.pdf', NULL, '2024-10-24 00:00:00', '2025-08-23 21:01:42.2', '2025-08-23 21:01:42.2');
INSERT INTO public.sem_reports VALUES ('cmeoshnz600192er8j8l1hftj', '24-048390-2_MB3001B 2-3 35Hz80sec 800C 3C-m 1h B 2_6g np_SEM_1755985604488.pdf', '24-048390-2_MB3001B 2-3 35Hz80sec 800C 3C-m 1h B 2_6g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814851/graphene-uploads/sem-reports/24-048390-2_MB3001B%202-3%2035Hz80sec%20800C%203C-m%201h%20B%202_6g%20np_SEM_1755985604488.pdf.pdf', NULL, '2025-10-28 00:00:00', '2025-08-23 21:46:44.514', '2025-08-23 21:46:44.514');
INSERT INTO public.sem_reports VALUES ('cmeoss2w2001t2er8v6gt5ona', '24-048390-6_MB3004B 2-3 35Hz80sec 800C 3C-m 1h B 2x1_3P_SEM_1755986090381.pdf', '24-048390-6_MB3004B 2-3 35Hz80sec 800C 3C-m 1h B 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814855/graphene-uploads/sem-reports/24-048390-6_MB3004B%202-3%2035Hz80sec%20800C%203C-m%201h%20B%202x1_3P_SEM_1755986090381.pdf.pdf', NULL, '2024-10-29 00:00:00', '2025-08-23 21:54:50.402', '2025-08-23 21:54:50.402');
INSERT INTO public.sem_reports VALUES ('cmeot0wuy002d2er85x0cdp5i', '24-048427-4_MB3007B 2-3 15Hz30min 800C 3C-m 1h B 2_6g np_SEM_1755986502462.pdf', '24-048427-4_MB3007B 2-3 15Hz30min 800C 3C-m 1h B 2_6g np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814859/graphene-uploads/sem-reports/24-048427-4_MB3007B%202-3%2015Hz30min%20800C%203C-m%201h%20B%202_6g%20np_SEM_1755986502462.pdf.pdf', NULL, '2024-10-31 00:00:00', '2025-08-23 22:01:42.49', '2025-08-23 22:01:42.49');
INSERT INTO public.sem_reports VALUES ('cmeotg259002u2er8a6qtnyv8', '24-048505-5_MB3013A 2-3 35Hz10+1min 800C 3C-m 1h A 2x1,6P_SEM_1755987209165.pdf', '24-048505-5_MB3013A 2-3 35Hz10+1min 800C 3C-m 1h A 2x1,6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814863/graphene-uploads/sem-reports/24-048505-5_MB3013A%202-3%2035Hz10%2B1min%20800C%203C-m%201h%20A%202x1%2C6P_SEM_1755987209165.pdf.pdf', NULL, '2024-11-11 00:00:00', '2025-08-23 22:13:29.181', '2025-08-23 22:13:29.181');
INSERT INTO public.sem_reports VALUES ('cmeoto0iz003e2er8by6qu9u2', '24-048505-9_MRa340A 2-3 15Hz120min 800C 3Cm 1h A 2x1,6P_SEM_1755987580303.pdf', '24-048505-9_MRa340A 2-3 15Hz120min 800C 3Cm 1h A 2x1,6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814868/graphene-uploads/sem-reports/24-048505-9_MRa340A%202-3%2015Hz120min%20800C%203Cm%201h%20A%202x1%2C6P_SEM_1755987580303.pdf.pdf', NULL, '2024-11-12 00:00:00', '2025-08-23 22:19:40.332', '2025-08-23 22:19:40.332');
INSERT INTO public.sem_reports VALUES ('cmeoty1dl003s2er8rdhjtgt3', '24-048601-1_MB3017A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1_6P_SEM_1755988047972.pdf', '24-048601-1_MB3017A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814868/graphene-uploads/sem-reports/24-048601-1_MB3017A%202-3%2020pNaOH%2035Hz10min%20800C%203C-m%201h%20A%202x1_6P_SEM_1755988047972.pdf.pdf', NULL, '2024-11-19 00:00:00', '2025-08-23 22:27:27.993', '2025-08-23 22:27:27.993');
INSERT INTO public.sem_reports VALUES ('cmeou32yr00472er8f6t608ql', '24-048601-4_MB3019B 2-3 15Hz10_1min 800C 3C-m 1h B 2_6np_SEM_1755988283312.pdf', '24-048601-4_MB3019B 2-3 15Hz10_1min 800C 3C-m 1h B 2_6np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814871/graphene-uploads/sem-reports/24-048601-4_MB3019B%202-3%2015Hz10_1min%20800C%203C-m%201h%20B%202_6np_SEM_1755988283312.pdf.pdf', NULL, '2024-11-19 00:00:00', '2025-08-23 22:31:23.332', '2025-08-23 22:31:23.332');
INSERT INTO public.sem_reports VALUES ('cmepxue7o0002gqvg364lwvtz', '24-048669-2_MB3023B 2-3 20pNaOH 35Hz10min 800C 3C-m 1h B 2.0np_SEM_1756055062609.pdf', '24-048669-2_MB3023B 2-3 20pNaOH 35Hz10min 800C 3C-m 1h B 2.0np_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814875/graphene-uploads/sem-reports/24-048669-2_MB3023B%202-3%2020pNaOH%2035Hz10min%20800C%203C-m%201h%20B%202.0np_SEM_1756055062609.pdf.pdf', NULL, '2024-11-26 07:00:00', '2025-08-24 17:04:22.644', '2025-08-24 17:04:22.644');
INSERT INTO public.sem_reports VALUES ('cmepzmdrx0011gqvgpxko324f', '24-048821-1_TB1160A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1.3P_SEM_1756058048046.pdf', '24-048821-1_TB1160A 2-3 20pNaOH 35Hz10min 800C 3C-m 1h A 2x1.3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814881/graphene-uploads/sem-reports/24-048821-1_TB1160A%202-3%2020pNaOH%2035Hz10min%20800C%203C-m%201h%20A%202x1.3P_SEM_1756058048046.pdf.pdf', NULL, '2024-12-12 07:00:00', '2025-08-24 17:54:08.061', '2025-08-24 17:54:08.061');
INSERT INTO public.sem_reports VALUES ('cmeq02xjo0025gqvgfhj4nc1x', '25-048930-4  TB1165_2-3_5x3min_800C_3C-m_1h Rot_SEM_1756058820162.pdf', '25-048930-4  TB1165_2-3_5x3min_800C_3C-m_1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814887/graphene-uploads/sem-reports/25-048930-4%20%20TB1165_2-3_5x3min_800C_3C-m_1h%20Rot_SEM_1756058820162.pdf.pdf', NULL, '2025-01-15 07:00:00', '2025-08-24 18:07:00.181', '2025-08-24 18:07:00.181');
INSERT INTO public.sem_reports VALUES ('cmeq17o83000je12u85ovz4nl', '25-049067-1_MRa373 2-3 8P 3min 800C 3C-m 1h A 2x1_3P_SEM_1756060720955.pdf', '25-049067-1_MRa373 2-3 8P 3min 800C 3C-m 1h A 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814889/graphene-uploads/sem-reports/25-049067-1_MRa373%202-3%208P%203min%20800C%203C-m%201h%20A%202x1_3P_SEM_1756060720955.pdf.pdf', NULL, '2025-01-28 07:00:00', '2025-08-24 18:38:40.995', '2025-08-24 18:38:40.995');
INSERT INTO public.sem_reports VALUES ('cmeq1a7k2000oe12ubmrwinij', '25-049093-2_MRa375 2-3 9P 1+3min 800C 3C-m 1h A 2x1_3P_SEM_1756060839338.pdf', '25-049093-2_MRa375 2-3 9P 1+3min 800C 3C-m 1h A 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814891/graphene-uploads/sem-reports/25-049093-2_MRa375%202-3%209P%201%2B3min%20800C%203C-m%201h%20A%202x1_3P_SEM_1756060839338.pdf.pdf', NULL, '2025-02-03 07:00:00', '2025-08-24 18:40:39.362', '2025-08-24 18:40:39.362');
INSERT INTO public.sem_reports VALUES ('cmeq1hl820018e12u2rnegg72', '25-049197-1_MRa380 2-3 12P 3min 800C 3C-m 1h A 2x1_3P_SEM_1756061183647.pdf', '25-049197-1_MRa380 2-3 12P 3min 800C 3C-m 1h A 2x1_3P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814895/graphene-uploads/sem-reports/25-049197-1_MRa380%202-3%2012P%203min%20800C%203C-m%201h%20A%202x1_3P_SEM_1756061183647.pdf.pdf', NULL, '2025-02-05 07:00:00', '2025-08-24 18:46:23.666', '2025-08-24 18:46:23.666');
INSERT INTO public.sem_reports VALUES ('cmeq3s9ny001we12ufsflcsze', '25-049270-1_MRa389A 2-3 2x45sec 800C 3C-m 1h Rot_SEM_1756065041108.pdf', '25-049270-1_MRa389A 2-3 2x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814899/graphene-uploads/sem-reports/25-049270-1_MRa389A%202-3%202x45sec%20800C%203C-m%201h%20Rot_SEM_1756065041108.pdf.pdf', NULL, '2025-02-17 07:00:00', '2025-08-24 19:50:41.135', '2025-08-24 19:50:41.135');
INSERT INTO public.sem_reports VALUES ('cmeq4340h002le12ubiloju28', '25-049341-1_MRa394 1-1 90sec 800C 3C-m 1h Rot_SEM_1756065547002.pdf', '25-049341-1_MRa394 1-1 90sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814903/graphene-uploads/sem-reports/25-049341-1_MRa394%201-1%2090sec%20800C%203C-m%201h%20Rot_SEM_1756065547002.pdf.pdf', NULL, '2025-02-24 07:00:00', '2025-08-24 19:59:07.026', '2025-08-24 19:59:07.026');
INSERT INTO public.sem_reports VALUES ('cmeq41oy8002ge12uw8891f0j', '25-049341-4_MB3051 2-3 4x45sec 800C 3C-m 1h Rot_SEM_1756065480827.pdf', '25-049341-4_MB3051 2-3 4x45sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814908/graphene-uploads/sem-reports/25-049341-4_MB3051%202-3%204x45sec%20800C%203C-m%201h%20Rot_SEM_1756065480827.pdf.pdf', NULL, '2025-02-24 07:00:00', '2025-08-24 19:58:00.848', '2025-08-24 19:58:00.848');
INSERT INTO public.sem_reports VALUES ('cmeq6vzuw003fe12uiu518o73', '25-049474-1_MRa399 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756070253875.pdf', '25-049474-1_MRa399 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814912/graphene-uploads/sem-reports/25-049474-1_MRa399%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756070253875.pdf.pdf', NULL, '2025-03-11 06:00:00', '2025-08-24 21:17:33.897', '2025-08-24 21:17:33.897');
INSERT INTO public.sem_reports VALUES ('cmeq7bdng003ze12upkf7o7yd', '25-049508-1_MRa404 2-3 3min 800C 3C-m 1h B 2x1_6P_SEM_1756070971592.pdf', '25-049508-1_MRa404 2-3 3min 800C 3C-m 1h B 2x1_6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814917/graphene-uploads/sem-reports/25-049508-1_MRa404%202-3%203min%20800C%203C-m%201h%20B%202x1_6P_SEM_1756070971592.pdf.pdf', NULL, '2025-03-13 06:00:00', '2025-08-24 21:29:31.612', '2025-08-24 21:29:31.612');
INSERT INTO public.sem_reports VALUES ('cmeq7vtl9005ce12ujh4srrq1', '25-049538-10_MRa411A 2-3 3min 800C 3C-m 1h A 2x1.4P_SEM_1756071925376.pdf', '25-049538-10_MRa411A 2-3 3min 800C 3C-m 1h A 2x1.4P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814919/graphene-uploads/sem-reports/25-049538-10_MRa411A%202-3%203min%20800C%203C-m%201h%20A%202x1.4P_SEM_1756071925376.pdf.pdf', NULL, '2025-03-24 06:00:00', '2025-08-24 21:45:25.389', '2025-08-24 21:45:25.389');
INSERT INTO public.sem_reports VALUES ('cmeq7xfoi005ie12unheb2zlj', '25-049538-11_MRa411B 2-3 3min 800C 3C-m 1h B 2x1.1P_SEM_1756072000640.pdf', '25-049538-11_MRa411B 2-3 3min 800C 3C-m 1h B 2x1.1P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814919/graphene-uploads/sem-reports/25-049538-11_MRa411B%202-3%203min%20800C%203C-m%201h%20B%202x1.1P_SEM_1756072000640.pdf.pdf', NULL, '2025-03-24 06:00:00', '2025-08-24 21:46:40.674', '2025-08-24 21:46:40.674');
INSERT INTO public.sem_reports VALUES ('cmeq7zsh9005ne12ufw6hgkol', '25-049538-14_MRa412 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756072110548.pdf', '25-049538-14_MRa412 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814922/graphene-uploads/sem-reports/25-049538-14_MRa412%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756072110548.pdf.pdf', NULL, '2025-03-25 06:00:00', '2025-08-24 21:48:30.574', '2025-08-24 21:48:30.574');
INSERT INTO public.sem_reports VALUES ('cmeq7id4a004je12usjewqvnm', '25-049538-1_ MRa406 2-3 3min 800C 3C-m 1h A 2x1.6P_SEM_1756071297494.pdf', '25-049538-1_ MRa406 2-3 3min 800C 3C-m 1h A 2x1.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814926/graphene-uploads/sem-reports/25-049538-1_%20MRa406%202-3%203min%20800C%203C-m%201h%20A%202x1.6P_SEM_1756071297494.pdf.pdf', NULL, '2025-03-18 06:00:00', '2025-08-24 21:34:57.515', '2025-08-24 21:34:57.515');
INSERT INTO public.sem_reports VALUES ('cmeq7mhwg004te12uvd6iz8zu', '25-049538-6_MRa408 2-3 20P NaOH 3x30sec 800C 3C-m 1h Rot_SEM_1756071490321.pdf', '25-049538-6_MRa408 2-3 20P NaOH 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814930/graphene-uploads/sem-reports/25-049538-6_MRa408%202-3%2020P%20NaOH%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756071490321.pdf.pdf', NULL, '2025-03-18 06:00:00', '2025-08-24 21:38:10.336', '2025-08-24 21:38:10.336');
INSERT INTO public.sem_reports VALUES ('cmeq8y093006ue12ufj22dw3t', '25-049667-6_MRa416A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM_1756073706826.pdf', '25-049667-6_MRa416A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814936/graphene-uploads/sem-reports/25-049667-6_MRa416A%202-3%203min%20800C%203C-m%201h%20A%202x0.6P_SEM_1756073706826.pdf.pdf', NULL, '2025-04-03 06:00:00', '2025-08-24 22:15:06.952', '2025-08-24 22:15:06.952');
INSERT INTO public.sem_reports VALUES ('cmeqa8s43007ee12u2gai2k9l', '25-049736-2_MRa417B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM_1756075889214.pdf', '25-049736-2_MRa417B 2-3 3min 800C 3C-m 1h B 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814940/graphene-uploads/sem-reports/25-049736-2_MRa417B%202-3%203min%20800C%203C-m%201h%20B%202x0.6P_SEM_1756075889214.pdf.pdf', NULL, '2025-04-07 06:00:00', '2025-08-24 22:51:29.236', '2025-08-24 22:51:29.236');
INSERT INTO public.sem_reports VALUES ('cmeqam5ga0082e12um301key8', '25-049736-5_MRa419A 2-3 1+3min 800C 3C-m 1h A 2x0.6P_SEM_1756076513032.pdf', '25-049736-5_MRa419A 2-3 1+3min 800C 3C-m 1h A 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814944/graphene-uploads/sem-reports/25-049736-5_MRa419A%202-3%201%2B3min%20800C%203C-m%201h%20A%202x0.6P_SEM_1756076513032.pdf.pdf', NULL, '2025-04-09 06:00:00', '2025-08-24 23:01:53.05', '2025-08-24 23:01:53.05');
INSERT INTO public.sem_reports VALUES ('cmeqaqlqv008ee12ulavzsc2i', '25-049736-8_MRa421A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM_1756076720776.pdf', '25-049736-8_MRa421A 2-3 3min 800C 3C-m 1h A 2x0.6P_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814948/graphene-uploads/sem-reports/25-049736-8_MRa421A%202-3%203min%20800C%203C-m%201h%20A%202x0.6P_SEM_1756076720776.pdf.pdf', NULL, '2025-04-10 06:00:00', '2025-08-24 23:05:20.791', '2025-08-24 23:05:20.791');
INSERT INTO public.sem_reports VALUES ('cmeqbdtk1009de12uq3zk2guj', '25-049919-1_MB3073 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756077803974.pdf', '25-049919-1_MB3073 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814952/graphene-uploads/sem-reports/25-049919-1_MB3073%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756077803974.pdf.pdf', NULL, '2025-05-02 06:00:00', '2025-08-24 23:23:24.001', '2025-08-24 23:23:24.001');
INSERT INTO public.sem_reports VALUES ('cmeqbutju009ve12uxpfmrqyf', '25-049970-2_MRa427_MRa428 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756078597106.pdf', '25-049970-2_MRa427_MRa428 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814956/graphene-uploads/sem-reports/25-049970-2_MRa427_MRa428%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756078597106.pdf.pdf', NULL, '2025-05-13 06:00:00', '2025-08-24 23:36:37.146', '2025-08-24 23:36:37.146');
INSERT INTO public.sem_reports VALUES ('cmeqcy1jt00bte12ujm82i768', '25-050227-4_MRa440 2-3 3x30sec 800C 3C-m 1h Rot_SEM_1756080427077.pdf', '25-050227-4_MRa440 2-3 3x30sec 800C 3C-m 1h Rot_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814965/graphene-uploads/sem-reports/25-050227-4_MRa440%202-3%203x30sec%20800C%203C-m%201h%20Rot_SEM_1756080427077.pdf.pdf', NULL, '2025-06-17 06:00:00', '2025-08-25 00:07:07.098', '2025-08-25 00:07:07.098');
INSERT INTO public.sem_reports VALUES ('cmf7cwb8100013oklxn1uyqhi', '25-050404-2_TB1180B_SEM_1757108271287.pdf', '25-050404-2_TB1180B_SEM.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757814969/graphene-uploads/sem-reports/25-050404-2_TB1180B_SEM_1757108271287.pdf.pdf', NULL, '2025-07-10 00:00:00', '2025-09-05 21:37:51.301', '2025-09-05 21:37:51.301');
INSERT INTO public.sem_reports VALUES ('cmfj4nqik00068ucp2ln0qgk1', 'HeisenbergGraphene_MNDA_1757820027406.pdf', 'HeisenbergGraphene_MNDA.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757820028/graphene-uploads-dev/sem-reports/HeisenbergGraphene_MNDA_1757820027406.pdf', NULL, '2025-09-14 03:20:28.41', '2025-09-14 03:20:28.412', '2025-09-14 03:20:28.412');
INSERT INTO public.sem_reports VALUES ('cmfj56q2v0000ogyuxkz3pn2b', 'CDA_Curia_NH_Heisenberg_1757820912636.pdf', 'CDA_Curia_NH_Heisenberg.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757820913/graphene-uploads-dev/sem-reports/CDA_Curia_NH_Heisenberg_1757820912636.pdf', NULL, '2025-09-14 03:35:14.31', '2025-09-14 03:35:14.311', '2025-09-14 03:35:14.311');
INSERT INTO public.sem_reports VALUES ('cmfj56qtd0003ogyuc1v22epy', 'CDA_Curia_NH_Heisenberg_1757820913787.pdf', 'CDA_Curia_NH_Heisenberg.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757820914/graphene-uploads-dev/sem-reports/CDA_Curia_NH_Heisenberg_1757820913787.pdf', NULL, '2025-09-14 03:35:15.264', '2025-09-14 03:35:15.266', '2025-09-14 03:35:15.266');
INSERT INTO public.sem_reports VALUES ('cmfj5mtb70000ygpfam979ccq', 'LGV - Mutual Non-disclosure Agreement_Signed_1757821663753.pdf', 'LGV - Mutual Non-disclosure Agreement_Signed.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757821664/graphene-uploads-dev/sem-reports/LGV%20-%20Mutual%20Non-disclosure%20Agreement_Signed_1757821663753.pdf', NULL, '2025-09-14 03:47:44.994', '2025-09-14 03:47:44.995', '2025-09-14 03:47:44.995');
INSERT INTO public.sem_reports VALUES ('cmfj6s8vc0000rko3bpfj0yi7', 'CDA_Curia_NH_Heisenberg_1757823596436.pdf', 'CDA_Curia_NH_Heisenberg.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757823597/graphene-uploads-dev/sem-reports/CDA_Curia_NH_Heisenberg_1757823596436.pdf', NULL, '2025-09-14 04:19:58.054', '2025-09-14 04:19:58.056', '2025-09-14 04:19:58.056');
INSERT INTO public.sem_reports VALUES ('cmfj6xq25000012sihffr2g73', 'LGV - Mutual Non-disclosure Agreement_Signed_1757823852393.pdf', 'LGV - Mutual Non-disclosure Agreement_Signed.pdf', 'https://res.cloudinary.com/dlbztbaaa/image/upload/v1757823853/graphene-uploads-dev/sem-reports/LGV%20-%20Mutual%20Non-disclosure%20Agreement_Signed_1757823852393.pdf', NULL, '2025-09-14 04:24:13.611', '2025-09-14 04:24:13.613', '2025-09-14 04:24:13.613');


--
-- Data for Name: tem_tests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tem_tests VALUES ('cmet2y1780001pdoutv7rrw8r', '2024-07-26 06:00:00', 'MB2995A', 'Curia - Germany', NULL, 'tem-reports/MB2955A2 TEM 2024-08-06 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 AM2024-0074 Short Summary 1_1756245028990.pdf', NULL, '2025-08-26 21:50:29.011', '2025-08-26 21:50:29.011', NULL);
INSERT INTO public.tem_tests VALUES ('cmf66ql7900011296n9fsoqbu', '2024-12-14 07:00:00', 'MB2976A', 'Curia - Germany', NULL, 'tem-reports/MB2976A TEM 2024-10-14 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 4 Rev. 1_1757037460424.pdf', NULL, '2025-09-05 01:57:40.437', '2025-09-05 01:57:40.437', NULL);
INSERT INTO public.tem_tests VALUES ('cmf66ruo400031296ff2c79qq', '2024-12-23 07:00:00', 'TB1137-1', 'Curia - Germany', NULL, 'tem-reports/TB1137-1 MB2976A 2024-10-22 45-02801 Curia Germany GmbH Offer 2210-2024-51000-45-02801-00010 and -00019 AM2024-0074 Short Summary 5_1757037519349.pdf', NULL, '2025-09-05 01:58:39.364', '2025-09-05 01:58:39.364', NULL);


--
-- Data for Name: update_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.update_reports VALUES ('cmf72e8py000014bcwozde15r', 'update_Heisenberg_01-Apr-2025_1757090632085.pdf', 'update_Heisenberg_01-Apr-2025.pdf', '/uploads/update-reports/update_Heisenberg_01-Apr-2025_1757090632085.pdf', NULL, '2025-04-01 00:00:00', '2025-09-05 16:43:52.102', '2025-09-05 16:44:55.286');
INSERT INTO public.update_reports VALUES ('cmf737paj000g14bcbk1bwisu', 'update_Heisenberg_04-Feb-2025_1757092922078.pdf', 'update_Heisenberg_04-Feb-2025.pdf', '/uploads/update-reports/update_Heisenberg_04-Feb-2025_1757092922078.pdf', NULL, '2025-02-04 00:00:00', '2025-09-05 17:06:46.596', '2025-09-05 17:22:02.12');
INSERT INTO public.update_reports VALUES ('cmf73vjxk001pkj2bpxzqkq82', 'update_Heisenberg_04-Jun-2025_1757093119383.pdf', 'update_Heisenberg_04-Jun-2025.pdf', '/uploads/update-reports/update_Heisenberg_04-Jun-2025_1757093119383.pdf', NULL, '2025-06-04 00:00:00', '2025-09-05 17:25:19.4', '2025-09-05 17:25:57.102');
INSERT INTO public.update_reports VALUES ('cmf7400gn001xkj2bxejj7ilp', 'update_Heisenberg_04-Mar-2025_1757093327395.pdf', 'update_Heisenberg_04-Mar-2025.pdf', '/uploads/update-reports/update_Heisenberg_04-Mar-2025_1757093327395.pdf', NULL, '2025-03-04 00:00:00', '2025-09-05 17:28:47.447', '2025-09-05 17:29:34.275');
INSERT INTO public.update_reports VALUES ('cmf7428vh0025kj2bzakb2xwm', 'update_Heisenberg_06-May-2025_1757093431643.pdf', 'update_Heisenberg_06-May-2025.pdf', '/uploads/update-reports/update_Heisenberg_06-May-2025_1757093431643.pdf', NULL, '2025-05-06 00:00:00', '2025-09-05 17:30:31.661', '2025-09-05 17:30:31.661');
INSERT INTO public.update_reports VALUES ('cmf7b1rq3002dkj2b2n855lsk', 'update_Heisenberg_08-Apr-2025_1757105166714.pdf', 'update_Heisenberg_08-Apr-2025.pdf', '/uploads/update-reports/update_Heisenberg_08-Apr-2025_1757105166714.pdf', NULL, '2025-04-08 00:00:00', '2025-09-05 20:46:06.742', '2025-09-05 20:46:06.742');
INSERT INTO public.update_reports VALUES ('cmf7b3zjo002gkj2bysxew89b', 'update_Heisenberg_01-Oct-2024_1757105270191.pdf', 'update_Heisenberg_01-Oct-2024.pdf', '/uploads/update-reports/update_Heisenberg_01-Oct-2024_1757105270191.pdf', NULL, '2024-10-01 00:00:00', '2025-09-05 20:47:50.195', '2025-09-05 20:47:50.195');
INSERT INTO public.update_reports VALUES ('cmf7b4ksl002hkj2bxqxa8xvc', 'update_Heisenberg_02-July-2024_1757105297731.pdf', 'update_Heisenberg_02-July-2024.pdf', '/uploads/update-reports/update_Heisenberg_02-July-2024_1757105297731.pdf', NULL, '2024-07-02 00:00:00', '2025-09-05 20:48:17.733', '2025-09-05 20:48:17.733');
INSERT INTO public.update_reports VALUES ('cmf7b55pt002ikj2b1juyxfsv', 'update_Heisenberg_03-Dec-2024_1757105324822.pdf', 'update_Heisenberg_03-Dec-2024.pdf', '/uploads/update-reports/update_Heisenberg_03-Dec-2024_1757105324822.pdf', NULL, '2024-12-03 00:00:00', '2025-09-05 20:48:44.849', '2025-09-05 20:48:44.849');
INSERT INTO public.update_reports VALUES ('cmf7b5l4a002jkj2b9z0ylgh1', 'update_Heisenberg_03-Sep-2024_1757105344804.pdf', 'update_Heisenberg_03-Sep-2024.pdf', '/uploads/update-reports/update_Heisenberg_03-Sep-2024_1757105344804.pdf', NULL, '2024-09-03 00:00:00', '2025-09-05 20:49:04.81', '2025-09-05 20:49:04.81');
INSERT INTO public.update_reports VALUES ('cmf7bx6jt0000pzycqso9oihk', 'update_Heisenberg_05-Nov-2024_1757106632284.pdf', 'update_Heisenberg_05-Nov-2024.pdf', '/uploads/update-reports/update_Heisenberg_05-Nov-2024_1757106632284.pdf', NULL, '2024-11-05 00:00:00', '2025-09-05 21:10:32.296', '2025-09-05 21:10:32.296');
INSERT INTO public.update_reports VALUES ('cmf7bxlmd0001pzyc70xjjhws', 'update_Heisenberg_07-May-2024_1757106651823.pdf', 'update_Heisenberg_07-May-2024.pdf', '/uploads/update-reports/update_Heisenberg_07-May-2024_1757106651823.pdf', NULL, '2024-05-07 00:00:00', '2025-09-05 21:10:51.824', '2025-09-05 21:10:51.824');
INSERT INTO public.update_reports VALUES ('cmf7byq9a0003pzyc44ji1f2u', 'update_Heisenberg_08-Jul-2025 (1)_1757106704472.pdf', 'update_Heisenberg_08-Jul-2025 (1).pdf', '/uploads/update-reports/update_Heisenberg_08-Jul-2025 (1)_1757106704472.pdf', NULL, '2025-07-08 00:00:00', '2025-09-05 21:11:44.482', '2025-09-05 21:11:44.482');
INSERT INTO public.update_reports VALUES ('cmf7bz4on0004pzycop89cji9', 'update_Heisenberg_08-Oct-2024_1757106723189.pdf', 'update_Heisenberg_08-Oct-2024.pdf', '/uploads/update-reports/update_Heisenberg_08-Oct-2024_1757106723189.pdf', NULL, '2024-10-08 00:00:00', '2025-09-05 21:12:03.191', '2025-09-05 21:12:03.191');
INSERT INTO public.update_reports VALUES ('cmf7bzk7k0005pzyclzrqpaz4', 'update_Heisenberg_09-July-2024_1757106743311.pdf', 'update_Heisenberg_09-July-2024.pdf', '/uploads/update-reports/update_Heisenberg_09-July-2024_1757106743311.pdf', NULL, '2024-07-09 00:00:00', '2025-09-05 21:12:23.312', '2025-09-05 21:12:23.312');
INSERT INTO public.update_reports VALUES ('cmf7c0cbo0007pzycuh92og6z', 'update_Heisenberg_10-Sep-2024_1757106779745.pdf', 'update_Heisenberg_10-Sep-2024.pdf', '/uploads/update-reports/update_Heisenberg_10-Sep-2024_1757106779745.pdf', NULL, '2024-09-10 00:00:00', '2025-09-05 21:12:59.749', '2025-09-05 21:12:59.749');
INSERT INTO public.update_reports VALUES ('cmf7c0pgp0008pzyc0vieexjp', 'update_Heisenberg_11-Feb-2025_1757106796750.pdf', 'update_Heisenberg_11-Feb-2025.pdf', '/uploads/update-reports/update_Heisenberg_11-Feb-2025_1757106796750.pdf', NULL, '2025-02-11 00:00:00', '2025-09-05 21:13:16.777', '2025-09-05 21:13:16.777');
INSERT INTO public.update_reports VALUES ('cmf7c147k0009pzyc324pgtl4', 'update_Heisenberg_11-Jun-2025_1757106815883.pdf', 'update_Heisenberg_11-Jun-2025.pdf', '/uploads/update-reports/update_Heisenberg_11-Jun-2025_1757106815883.pdf', NULL, '2025-06-11 00:00:00', '2025-09-05 21:13:35.888', '2025-09-05 21:13:35.888');
INSERT INTO public.update_reports VALUES ('cmf7c1hv1000apzyc9l0ebx6d', 'update_Heisenberg_11-June-2024_1757106833579.pdf', 'update_Heisenberg_11-June-2024.pdf', '/uploads/update-reports/update_Heisenberg_11-June-2024_1757106833579.pdf', NULL, '2024-06-11 00:00:00', '2025-09-05 21:13:53.581', '2025-09-05 21:13:53.581');
INSERT INTO public.update_reports VALUES ('cmf7c1vvx000bpzyc2zawj2oh', 'update_Heisenberg_11-Mar-2025_1757106851743.pdf', 'update_Heisenberg_11-Mar-2025.pdf', '/uploads/update-reports/update_Heisenberg_11-Mar-2025_1757106851743.pdf', NULL, '2025-03-11 00:00:00', '2025-09-05 21:14:11.757', '2025-09-05 21:14:11.757');
INSERT INTO public.update_reports VALUES ('cmf7c40nm00002z9njg725qh2', 'update_Heisenberg_12-Nov-2024_1757106951239.pdf', 'update_Heisenberg_12-Nov-2024.pdf', '/uploads/update-reports/update_Heisenberg_12-Nov-2024_1757106951239.pdf', NULL, '2024-11-12 00:00:00', '2025-09-05 21:15:51.25', '2025-09-05 21:15:51.25');
INSERT INTO public.update_reports VALUES ('cmf7c4ett00012z9n2c0n4fs5', 'update_Heisenberg_13-Aug-2024_1757106969616.pdf', 'update_Heisenberg_13-Aug-2024.pdf', '/uploads/update-reports/update_Heisenberg_13-Aug-2024_1757106969616.pdf', NULL, '2024-08-13 00:00:00', '2025-09-05 21:16:09.617', '2025-09-05 21:16:09.617');
INSERT INTO public.update_reports VALUES ('cmf7c4sjf00022z9nkph5yg27', 'update_Heisenberg_13-May-2025_1757106987366.pdf', 'update_Heisenberg_13-May-2025.pdf', '/uploads/update-reports/update_Heisenberg_13-May-2025_1757106987366.pdf', NULL, '2025-05-13 00:00:00', '2025-09-05 21:16:27.375', '2025-09-05 21:16:27.375');
INSERT INTO public.update_reports VALUES ('cmf7c5ma200032z9nsqj5e9wg', 'update_Heisenberg_14-Jan-2025_1757107025907.pdf', 'update_Heisenberg_14-Jan-2025.pdf', '/uploads/update-reports/update_Heisenberg_14-Jan-2025_1757107025907.pdf', NULL, '2025-01-14 00:00:00', '2025-09-05 21:17:05.929', '2025-09-05 21:17:05.929');
INSERT INTO public.update_reports VALUES ('cmf7c7o9y00042z9n0f9l0x4m', 'update_Heisenberg_14-May-2024_1757107121816.pdf', 'update_Heisenberg_14-May-2024.pdf', '/uploads/update-reports/update_Heisenberg_14-May-2024_1757107121816.pdf', NULL, '2024-05-14 00:00:00', '2025-09-05 21:18:41.818', '2025-09-05 21:18:41.818');
INSERT INTO public.update_reports VALUES ('cmf7c82j400052z9n7r46st5r', 'update_Heisenberg_15-Apr-2025_1757107140297.pdf', 'update_Heisenberg_15-Apr-2025.pdf', '/uploads/update-reports/update_Heisenberg_15-Apr-2025_1757107140297.pdf', NULL, '2025-04-15 00:00:00', '2025-09-05 21:19:00.304', '2025-09-05 21:19:00.304');
INSERT INTO public.update_reports VALUES ('cmf7c8hny00062z9nj0wj0er3', 'update_Heisenberg_15-Oct-2024_1757107159916.pdf', 'update_Heisenberg_15-Oct-2024.pdf', '/uploads/update-reports/update_Heisenberg_15-Oct-2024_1757107159916.pdf', NULL, '2024-10-15 00:00:00', '2025-09-05 21:19:19.918', '2025-09-05 21:19:19.918');
INSERT INTO public.update_reports VALUES ('cmf7c8yap00072z9ny5bb7272', 'update_Heisenberg_16-July-2024_1757107181466.pdf', 'update_Heisenberg_16-July-2024.pdf', '/uploads/update-reports/update_Heisenberg_16-July-2024_1757107181466.pdf', NULL, '2024-07-16 00:00:00', '2025-09-05 21:19:41.468', '2025-09-05 21:19:41.468');
INSERT INTO public.update_reports VALUES ('cmf7c9ea000082z9nvc5rd223', 'update_Heisenberg_17-Dec-2024_1757107202162.pdf', 'update_Heisenberg_17-Dec-2024.pdf', '/uploads/update-reports/update_Heisenberg_17-Dec-2024_1757107202162.pdf', NULL, '2024-12-17 00:00:00', '2025-09-05 21:20:02.173', '2025-09-05 21:20:02.173');
INSERT INTO public.update_reports VALUES ('cmf7c9qm700092z9nwglt807u', 'update_Heisenberg_17-Jun-2025_1757107218155.pdf', 'update_Heisenberg_17-Jun-2025.pdf', '/uploads/update-reports/update_Heisenberg_17-Jun-2025_1757107218155.pdf', NULL, '2025-06-17 00:00:00', '2025-09-05 21:20:18.164', '2025-09-05 21:20:18.164');
INSERT INTO public.update_reports VALUES ('cmf7ca338000a2z9nch7170xb', 'update_Heisenberg_17-Sep-2024_1757107234338.pdf', 'update_Heisenberg_17-Sep-2024.pdf', '/uploads/update-reports/update_Heisenberg_17-Sep-2024_1757107234338.pdf', NULL, '2024-09-17 00:00:00', '2025-09-05 21:20:34.34', '2025-09-05 21:20:34.34');
INSERT INTO public.update_reports VALUES ('cmf7cafhv000b2z9n7ytxyhof', 'update_Heisenberg_18-Feb-2025_1757107250383.pdf', 'update_Heisenberg_18-Feb-2025.pdf', '/uploads/update-reports/update_Heisenberg_18-Feb-2025_1757107250383.pdf', NULL, '2025-02-18 00:00:00', '2025-09-05 21:20:50.395', '2025-09-05 21:20:50.395');
INSERT INTO public.update_reports VALUES ('cmf7cawn2000c2z9nc11f0wh7', 'update_Heisenberg_18-June-2024_1757107272637.pdf', 'update_Heisenberg_18-June-2024.pdf', '/uploads/update-reports/update_Heisenberg_18-June-2024_1757107272637.pdf', NULL, '2024-06-18 00:00:00', '2025-09-05 21:21:12.638', '2025-09-05 21:21:12.638');
INSERT INTO public.update_reports VALUES ('cmf7ccdf9000d2z9nou0r6c7u', 'update_Heisenberg_18-Mar-2025_compressed_1757107341037.pdf', 'update_Heisenberg_18-Mar-2025_compressed.pdf', '/uploads/update-reports/update_Heisenberg_18-Mar-2025_compressed_1757107341037.pdf', NULL, '2025-03-18 00:00:00', '2025-09-05 21:22:21.045', '2025-09-05 21:22:21.045');
INSERT INTO public.update_reports VALUES ('cmf7cd28a000e2z9npevbuwgn', 'update_Heisenberg_19-Nov-2024_1757107373185.pdf', 'update_Heisenberg_19-Nov-2024.pdf', '/uploads/update-reports/update_Heisenberg_19-Nov-2024_1757107373185.pdf', NULL, '2024-11-19 00:00:00', '2025-09-05 21:22:53.193', '2025-09-05 21:22:53.193');
INSERT INTO public.update_reports VALUES ('cmf7cdhhp000f2z9n5n3e4jtq', 'update_Heisenberg_20-Aug-2024_1757107392967.pdf', 'update_Heisenberg_20-Aug-2024.pdf', '/uploads/update-reports/update_Heisenberg_20-Aug-2024_1757107392967.pdf', NULL, '2024-08-20 00:00:00', '2025-09-05 21:23:12.973', '2025-09-05 21:23:12.973');
INSERT INTO public.update_reports VALUES ('cmf7cdtbx000g2z9nw39va35k', 'update_Heisenberg_20-May-2025_1757107408300.pdf', 'update_Heisenberg_20-May-2025.pdf', '/uploads/update-reports/update_Heisenberg_20-May-2025_1757107408300.pdf', NULL, '2025-05-20 00:00:00', '2025-09-05 21:23:28.317', '2025-09-05 21:23:28.317');
INSERT INTO public.update_reports VALUES ('cmf7ce4f2000h2z9nki1f0h7g', 'update_Heisenberg_21-Jan-2025_1757107422652.pdf', 'update_Heisenberg_21-Jan-2025.pdf', '/uploads/update-reports/update_Heisenberg_21-Jan-2025_1757107422652.pdf', NULL, '2025-01-21 00:00:00', '2025-09-05 21:23:42.687', '2025-09-05 21:23:42.687');
INSERT INTO public.update_reports VALUES ('cmf7cejgj000i2z9nqb328wko', 'update_Heisenberg_21-May-2024 - corrected_1757107442174.pdf', 'update_Heisenberg_21-May-2024 - corrected.pdf', '/uploads/update-reports/update_Heisenberg_21-May-2024 - corrected_1757107442174.pdf', NULL, '2024-05-21 00:00:00', '2025-09-05 21:24:02.178', '2025-09-05 21:24:02.178');
INSERT INTO public.update_reports VALUES ('cmf7ceuwn000j2z9nj7hz9g2s', 'update_Heisenberg_22-Oct-2024_1757107457010.pdf', 'update_Heisenberg_22-Oct-2024.pdf', '/uploads/update-reports/update_Heisenberg_22-Oct-2024_1757107457010.pdf', NULL, '2024-10-22 00:00:00', '2025-09-05 21:24:17.015', '2025-09-05 21:24:17.015');
INSERT INTO public.update_reports VALUES ('cmf7cf7x9000k2z9nyyrqgg03', 'update_Heisenberg_23-Apr-2025_1757107473868.pdf', 'update_Heisenberg_23-Apr-2025.pdf', '/uploads/update-reports/update_Heisenberg_23-Apr-2025_1757107473868.pdf', NULL, '2025-04-23 00:00:00', '2025-09-05 21:24:33.885', '2025-09-05 21:24:33.885');
INSERT INTO public.update_reports VALUES ('cmf7cfzuh000l2z9njivkztf3', 'update_Heisenberg_23-July-2024_1757107510060.pdf', 'update_Heisenberg_23-July-2024.pdf', '/uploads/update-reports/update_Heisenberg_23-July-2024_1757107510060.pdf', NULL, '2024-07-23 00:00:00', '2025-09-05 21:25:10.067', '2025-09-05 21:25:10.067');
INSERT INTO public.update_reports VALUES ('cmf7cht9k000m2z9n6bb0i5ak', 'update_Heisenberg_24-Sep-2024_1757107594850.pdf', 'update_Heisenberg_24-Sep-2024.pdf', '/uploads/update-reports/update_Heisenberg_24-Sep-2024_1757107594850.pdf', NULL, '2024-09-24 00:00:00', '2025-09-05 21:26:34.856', '2025-09-05 21:26:34.856');
INSERT INTO public.update_reports VALUES ('cmf7ci518000n2z9n3bqv18l5', 'update_Heisenberg_25-Feb-2025_1757107610087.pdf', 'update_Heisenberg_25-Feb-2025.pdf', '/uploads/update-reports/update_Heisenberg_25-Feb-2025_1757107610087.pdf', NULL, '2025-02-25 00:00:00', '2025-09-05 21:26:50.107', '2025-09-05 21:26:50.107');
INSERT INTO public.update_reports VALUES ('cmf7cij6z000o2z9nnhi5u7k1', 'update_Heisenberg_25-June-2024_1757107628454.pdf', 'update_Heisenberg_25-June-2024.pdf', '/uploads/update-reports/update_Heisenberg_25-June-2024_1757107628454.pdf', NULL, '2024-06-25 00:00:00', '2025-09-05 21:27:08.458', '2025-09-05 21:27:08.458');
INSERT INTO public.update_reports VALUES ('cmf7cjcgm000p2z9nyueikrij', 'update_Heisenberg_26-Nov-2024_1757107666370.pdf', 'update_Heisenberg_26-Nov-2024.pdf', '/uploads/update-reports/update_Heisenberg_26-Nov-2024_1757107666370.pdf', NULL, '2024-11-26 00:00:00', '2025-09-05 21:27:46.39', '2025-09-05 21:27:46.39');
INSERT INTO public.update_reports VALUES ('cmf7ckg7k000q2z9nss4qo8xa', 'update_Heisenberg_25-Mar-2025_compressed (1)_1757107717896.pdf', 'update_Heisenberg_25-Mar-2025_compressed (1).pdf', '/uploads/update-reports/update_Heisenberg_25-Mar-2025_compressed (1)_1757107717896.pdf', NULL, '2024-03-25 00:00:00', '2025-09-05 21:28:37.904', '2025-09-05 21:28:37.904');
INSERT INTO public.update_reports VALUES ('cmf7cl25q000r2z9nuas7nnw2', 'update_Heisenberg_27-Aug-2024_1757107746345.pdf', 'update_Heisenberg_27-Aug-2024.pdf', '/uploads/update-reports/update_Heisenberg_27-Aug-2024_1757107746345.pdf', NULL, '2024-08-27 00:00:00', '2025-09-05 21:29:06.35', '2025-09-05 21:29:06.35');
INSERT INTO public.update_reports VALUES ('cmf7clemq000s2z9nz9tkphmw', 'update_Heisenberg_27-May-2024_1757107762488.pdf', 'update_Heisenberg_27-May-2024.pdf', '/uploads/update-reports/update_Heisenberg_27-May-2024_1757107762488.pdf', NULL, '2024-05-27 00:00:00', '2025-09-05 21:29:22.514', '2025-09-05 21:29:22.514');
INSERT INTO public.update_reports VALUES ('cmf7clpt0000t2z9nzyweimhz', 'update_Heisenberg_27-May-2025_1757107776980.pdf', 'update_Heisenberg_27-May-2025.pdf', '/uploads/update-reports/update_Heisenberg_27-May-2025_1757107776980.pdf', NULL, '2025-05-27 00:00:00', '2025-09-05 21:29:36.997', '2025-09-05 21:29:36.997');
INSERT INTO public.update_reports VALUES ('cmf7cm0aa000u2z9n1lg4nagg', 'update_Heisenberg_28-Jan-2025_1757107790549.pdf', 'update_Heisenberg_28-Jan-2025.pdf', '/uploads/update-reports/update_Heisenberg_28-Jan-2025_1757107790549.pdf', NULL, '2025-01-28 00:00:00', '2025-09-05 21:29:50.578', '2025-09-05 21:29:50.578');
INSERT INTO public.update_reports VALUES ('cmf7cmb9f000v2z9nktyx11sq', 'update_Heisenberg_29-Apr-2025_1757107804791.pdf', 'update_Heisenberg_29-Apr-2025.pdf', '/uploads/update-reports/update_Heisenberg_29-Apr-2025_1757107804791.pdf', NULL, '2025-04-29 00:00:00', '2025-09-05 21:30:04.804', '2025-09-05 21:30:04.804');
INSERT INTO public.update_reports VALUES ('cmf7cmlvd000w2z9nvfudeael', 'update_Heisenberg_29-Oct-2024_1757107818542.pdf', 'update_Heisenberg_29-Oct-2024.pdf', '/uploads/update-reports/update_Heisenberg_29-Oct-2024_1757107818542.pdf', NULL, '2024-10-29 00:00:00', '2025-09-05 21:30:18.548', '2025-09-05 21:30:18.548');
INSERT INTO public.update_reports VALUES ('cmf7cmwwu000x2z9nwzdq79bf', 'update_Heisenberg_30-July-2024_1757107832860.pdf', 'update_Heisenberg_30-July-2024.pdf', '/uploads/update-reports/update_Heisenberg_30-July-2024_1757107832860.pdf', NULL, '2024-07-30 00:00:00', '2025-09-05 21:30:32.862', '2025-09-05 21:30:32.862');
INSERT INTO public.update_reports VALUES ('cmf7bzxrv0006pzyckj10jk9c', 'update_Heisenberg_10-Dec-2024_1757106760860.pdf', 'update_Heisenberg_10-Dec-2024.pdf', '/uploads/update-reports/update_Heisenberg_10-Dec-2024_1757106760860.pdf', NULL, '2024-12-10 00:00:00', '2025-09-05 21:12:40.889', '2025-09-05 21:39:48.66');


--
-- Data for Name: user_bookmarks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_bookmarks VALUES ('cmfdap2f2000182jpy36zlnq7', 'cmfcqd9hb003x57jllam86ipa', NULL, NULL, '2025-09-10 01:22:51.134');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('cmfg8n7mr00005gdzw3ss57vb', 'admin', 'admin@hgraphene.com', '$2b$12$AKFzyStTAn9D.Cdw6T1PzuIaZEzqqOeAVMmZwYS6xvBXfeYI28PjK', 'SUPER_ADMIN', 'Benjamin', 'Tyson', true, '2025-09-14 05:15:10.044', '2025-09-12 02:48:43.876', '2025-09-14 05:15:10.044');


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bet bet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_pkey PRIMARY KEY (id);


--
-- Name: biochar_lots biochar_lots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biochar_lots
    ADD CONSTRAINT biochar_lots_pkey PRIMARY KEY (id);


--
-- Name: biochar biochar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biochar
    ADD CONSTRAINT biochar_pkey PRIMARY KEY (id);


--
-- Name: compound_batch_sem_reports compound_batch_sem_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_sem_reports
    ADD CONSTRAINT compound_batch_sem_reports_pkey PRIMARY KEY (id);


--
-- Name: compound_batch_update_reports compound_batch_update_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_update_reports
    ADD CONSTRAINT compound_batch_update_reports_pkey PRIMARY KEY (id);


--
-- Name: compound_batches compound_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batches
    ADD CONSTRAINT compound_batches_pkey PRIMARY KEY (id);


--
-- Name: conductivity_tests conductivity_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductivity_tests
    ADD CONSTRAINT conductivity_tests_pkey PRIMARY KEY (id);


--
-- Name: content_processing_logs content_processing_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_processing_logs
    ADD CONSTRAINT content_processing_logs_pkey PRIMARY KEY (id);


--
-- Name: graphene_compound_batches graphene_compound_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_compound_batches
    ADD CONSTRAINT graphene_compound_batches_pkey PRIMARY KEY (id);


--
-- Name: graphene graphene_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene
    ADD CONSTRAINT graphene_pkey PRIMARY KEY (id);


--
-- Name: graphene_sem_reports graphene_sem_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_sem_reports
    ADD CONSTRAINT graphene_sem_reports_pkey PRIMARY KEY (id);


--
-- Name: graphene_update_reports graphene_update_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_update_reports
    ADD CONSTRAINT graphene_update_reports_pkey PRIMARY KEY (id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (id);


--
-- Name: material_shipments material_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_shipments
    ADD CONSTRAINT material_shipments_pkey PRIMARY KEY (id);


--
-- Name: micronizations micronizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micronizations
    ADD CONSTRAINT micronizations_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_pkey PRIMARY KEY (id);


--
-- Name: news_preferences news_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_preferences
    ADD CONSTRAINT news_preferences_pkey PRIMARY KEY (id);


--
-- Name: news_sources news_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_sources
    ADD CONSTRAINT news_sources_pkey PRIMARY KEY (id);


--
-- Name: raman_tests raman_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raman_tests
    ADD CONSTRAINT raman_tests_pkey PRIMARY KEY (id);


--
-- Name: sem_reports sem_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sem_reports
    ADD CONSTRAINT sem_reports_pkey PRIMARY KEY (id);


--
-- Name: tem_tests tem_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tem_tests
    ADD CONSTRAINT tem_tests_pkey PRIMARY KEY (id);


--
-- Name: update_reports update_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_reports
    ADD CONSTRAINT update_reports_pkey PRIMARY KEY (id);


--
-- Name: user_bookmarks user_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bet_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_compound_batch_number_idx ON public.bet USING btree (compound_batch_number);


--
-- Name: bet_compound_batch_number_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_compound_batch_number_test_date_idx ON public.bet USING btree (compound_batch_number, test_date);


--
-- Name: bet_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_created_at_idx ON public.bet USING btree (created_at);


--
-- Name: bet_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_graphene_sample_idx ON public.bet USING btree (graphene_sample);


--
-- Name: bet_graphene_sample_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_graphene_sample_test_date_idx ON public.bet USING btree (graphene_sample, test_date);


--
-- Name: bet_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_test_date_idx ON public.bet USING btree (test_date);


--
-- Name: bet_testing_lab_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bet_testing_lab_test_date_idx ON public.bet USING btree (testing_lab, test_date);


--
-- Name: biochar_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX biochar_created_at_idx ON public.biochar USING btree (created_at);


--
-- Name: biochar_experiment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX biochar_experiment_date_idx ON public.biochar USING btree (experiment_date);


--
-- Name: biochar_experiment_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX biochar_experiment_number_key ON public.biochar USING btree (experiment_number);


--
-- Name: biochar_lot_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX biochar_lot_number_idx ON public.biochar USING btree (lot_number);


--
-- Name: biochar_lots_lot_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX biochar_lots_lot_number_key ON public.biochar_lots USING btree (lot_number);


--
-- Name: biochar_test_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX biochar_test_order_idx ON public.biochar USING btree (test_order);


--
-- Name: compound_batch_sem_reports_compound_batch_id_sem_report_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX compound_batch_sem_reports_compound_batch_id_sem_report_id_key ON public.compound_batch_sem_reports USING btree (compound_batch_id, sem_report_id);


--
-- Name: compound_batch_update_reports_compound_batch_id_update_repo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX compound_batch_update_reports_compound_batch_id_update_repo_key ON public.compound_batch_update_reports USING btree (compound_batch_id, update_report_id);


--
-- Name: compound_batches_batch_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX compound_batches_batch_number_key ON public.compound_batches USING btree (batch_number);


--
-- Name: compound_batches_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compound_batches_created_at_idx ON public.compound_batches USING btree (created_at);


--
-- Name: compound_batches_created_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compound_batches_created_date_idx ON public.compound_batches USING btree (created_date);


--
-- Name: conductivity_tests_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_compound_batch_number_idx ON public.conductivity_tests USING btree (compound_batch_number);


--
-- Name: conductivity_tests_compound_batch_number_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_compound_batch_number_test_date_idx ON public.conductivity_tests USING btree (compound_batch_number, test_date);


--
-- Name: conductivity_tests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_created_at_idx ON public.conductivity_tests USING btree (created_at);


--
-- Name: conductivity_tests_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_graphene_sample_idx ON public.conductivity_tests USING btree (graphene_sample);


--
-- Name: conductivity_tests_graphene_sample_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_graphene_sample_test_date_idx ON public.conductivity_tests USING btree (graphene_sample, test_date);


--
-- Name: conductivity_tests_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conductivity_tests_test_date_idx ON public.conductivity_tests USING btree (test_date);


--
-- Name: content_processing_logs_source_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX content_processing_logs_source_id_created_at_idx ON public.content_processing_logs USING btree (source_id, created_at);


--
-- Name: content_processing_logs_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX content_processing_logs_status_created_at_idx ON public.content_processing_logs USING btree (status, created_at);


--
-- Name: graphene_biochar_experiment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX graphene_biochar_experiment_idx ON public.graphene USING btree (biochar_experiment);


--
-- Name: graphene_biochar_lot_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX graphene_biochar_lot_number_idx ON public.graphene USING btree (biochar_lot_number);


--
-- Name: graphene_compound_batches_graphene_id_compound_batch_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX graphene_compound_batches_graphene_id_compound_batch_id_key ON public.graphene_compound_batches USING btree (graphene_id, compound_batch_id);


--
-- Name: graphene_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX graphene_created_at_idx ON public.graphene USING btree (created_at);


--
-- Name: graphene_experiment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX graphene_experiment_date_idx ON public.graphene USING btree (experiment_date);


--
-- Name: graphene_experiment_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX graphene_experiment_number_key ON public.graphene USING btree (experiment_number);


--
-- Name: graphene_sem_reports_graphene_id_sem_report_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX graphene_sem_reports_graphene_id_sem_report_id_key ON public.graphene_sem_reports USING btree (graphene_id, sem_report_id);


--
-- Name: graphene_test_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX graphene_test_order_idx ON public.graphene USING btree (test_order);


--
-- Name: graphene_update_reports_graphene_id_update_report_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX graphene_update_reports_graphene_id_update_report_id_key ON public.graphene_update_reports USING btree (graphene_id, update_report_id);


--
-- Name: knowledge_documents_content_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_content_hash_idx ON public.knowledge_documents USING btree (content_hash);


--
-- Name: knowledge_documents_content_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX knowledge_documents_content_hash_key ON public.knowledge_documents USING btree (content_hash);


--
-- Name: knowledge_documents_document_category_uploaded_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_document_category_uploaded_at_idx ON public.knowledge_documents USING btree (document_category, uploaded_at);


--
-- Name: knowledge_documents_document_type_processing_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_document_type_processing_status_idx ON public.knowledge_documents USING btree (document_type, processing_status);


--
-- Name: knowledge_documents_is_active_uploaded_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_is_active_uploaded_at_idx ON public.knowledge_documents USING btree (is_active, uploaded_at);


--
-- Name: knowledge_documents_processing_status_processing_attempts_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_processing_status_processing_attempts_idx ON public.knowledge_documents USING btree (processing_status, processing_attempts);


--
-- Name: knowledge_documents_relevance_score_document_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX knowledge_documents_relevance_score_document_type_idx ON public.knowledge_documents USING btree (relevance_score, document_type);


--
-- Name: material_shipments_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_compound_batch_number_idx ON public.material_shipments USING btree (compound_batch_number);


--
-- Name: material_shipments_compound_batch_number_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_compound_batch_number_shipment_date_idx ON public.material_shipments USING btree (compound_batch_number, shipment_date);


--
-- Name: material_shipments_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_graphene_sample_idx ON public.material_shipments USING btree (graphene_sample);


--
-- Name: material_shipments_graphene_sample_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_graphene_sample_shipment_date_idx ON public.material_shipments USING btree (graphene_sample, shipment_date);


--
-- Name: material_shipments_micronization_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_micronization_sku_idx ON public.material_shipments USING btree (micronization_sku);


--
-- Name: material_shipments_micronization_sku_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_micronization_sku_shipment_date_idx ON public.material_shipments USING btree (micronization_sku, shipment_date);


--
-- Name: material_shipments_ship_from_location_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_ship_from_location_shipment_date_idx ON public.material_shipments USING btree (ship_from_location, shipment_date);


--
-- Name: material_shipments_ship_to_location_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_ship_to_location_shipment_date_idx ON public.material_shipments USING btree (ship_to_location, shipment_date);


--
-- Name: material_shipments_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_shipment_date_idx ON public.material_shipments USING btree (shipment_date);


--
-- Name: material_shipments_shipment_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX material_shipments_shipment_number_key ON public.material_shipments USING btree (shipment_number);


--
-- Name: material_shipments_status_shipment_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX material_shipments_status_shipment_date_idx ON public.material_shipments USING btree (status, shipment_date);


--
-- Name: micronizations_compound_batch_number_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_compound_batch_number_date_idx ON public.micronizations USING btree (compound_batch_number, date);


--
-- Name: micronizations_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_compound_batch_number_idx ON public.micronizations USING btree (compound_batch_number);


--
-- Name: micronizations_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_date_idx ON public.micronizations USING btree (date);


--
-- Name: micronizations_graphene_sample_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_graphene_sample_date_idx ON public.micronizations USING btree (graphene_sample, date);


--
-- Name: micronizations_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_graphene_sample_idx ON public.micronizations USING btree (graphene_sample);


--
-- Name: micronizations_micronization_location_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_micronization_location_date_idx ON public.micronizations USING btree (micronization_location, date);


--
-- Name: micronizations_micronization_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_micronization_location_idx ON public.micronizations USING btree (micronization_location);


--
-- Name: micronizations_micronization_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX micronizations_micronization_number_key ON public.micronizations USING btree (micronization_number);


--
-- Name: micronizations_sku_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_sku_date_idx ON public.micronizations USING btree (sku, date);


--
-- Name: micronizations_sku_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX micronizations_sku_idx ON public.micronizations USING btree (sku);


--
-- Name: micronizations_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX micronizations_sku_key ON public.micronizations USING btree (sku);


--
-- Name: news_articles_category_publish_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_category_publish_date_idx ON public.news_articles USING btree (category, publish_date);


--
-- Name: news_articles_content_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_content_hash_idx ON public.news_articles USING btree (content_hash);


--
-- Name: news_articles_content_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_articles_content_hash_key ON public.news_articles USING btree (content_hash);


--
-- Name: news_articles_publish_date_relevance_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_publish_date_relevance_score_idx ON public.news_articles USING btree (publish_date, relevance_score);


--
-- Name: news_articles_relevance_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_relevance_score_idx ON public.news_articles USING btree (relevance_score);


--
-- Name: news_articles_source_id_publish_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_source_id_publish_date_idx ON public.news_articles USING btree (source_id, publish_date);


--
-- Name: news_articles_summary_generated_relevance_score_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_summary_generated_relevance_score_idx ON public.news_articles USING btree (summary_generated, relevance_score);


--
-- Name: news_articles_summary_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_articles_summary_status_created_at_idx ON public.news_articles USING btree (summary_status, created_at);


--
-- Name: news_articles_url_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_articles_url_key ON public.news_articles USING btree (url);


--
-- Name: news_preferences_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_preferences_user_id_key ON public.news_preferences USING btree (user_id);


--
-- Name: news_sources_is_active_last_fetched_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_sources_is_active_last_fetched_idx ON public.news_sources USING btree (is_active, last_fetched);


--
-- Name: news_sources_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_sources_name_key ON public.news_sources USING btree (name);


--
-- Name: news_sources_sourceType_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "news_sources_sourceType_is_active_idx" ON public.news_sources USING btree ("sourceType", is_active);


--
-- Name: raman_tests_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_compound_batch_number_idx ON public.raman_tests USING btree (compound_batch_number);


--
-- Name: raman_tests_compound_batch_number_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_compound_batch_number_test_date_idx ON public.raman_tests USING btree (compound_batch_number, test_date);


--
-- Name: raman_tests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_created_at_idx ON public.raman_tests USING btree (created_at);


--
-- Name: raman_tests_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_graphene_sample_idx ON public.raman_tests USING btree (graphene_sample);


--
-- Name: raman_tests_graphene_sample_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_graphene_sample_test_date_idx ON public.raman_tests USING btree (graphene_sample, test_date);


--
-- Name: raman_tests_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_test_date_idx ON public.raman_tests USING btree (test_date);


--
-- Name: raman_tests_testing_lab_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX raman_tests_testing_lab_test_date_idx ON public.raman_tests USING btree (testing_lab, test_date);


--
-- Name: sem_reports_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sem_reports_created_at_idx ON public.sem_reports USING btree (created_at);


--
-- Name: sem_reports_report_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sem_reports_report_date_idx ON public.sem_reports USING btree (report_date);


--
-- Name: tem_tests_compound_batch_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_compound_batch_number_idx ON public.tem_tests USING btree (compound_batch_number);


--
-- Name: tem_tests_compound_batch_number_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_compound_batch_number_test_date_idx ON public.tem_tests USING btree (compound_batch_number, test_date);


--
-- Name: tem_tests_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_created_at_idx ON public.tem_tests USING btree (created_at);


--
-- Name: tem_tests_graphene_sample_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_graphene_sample_idx ON public.tem_tests USING btree (graphene_sample);


--
-- Name: tem_tests_graphene_sample_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_graphene_sample_test_date_idx ON public.tem_tests USING btree (graphene_sample, test_date);


--
-- Name: tem_tests_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_test_date_idx ON public.tem_tests USING btree (test_date);


--
-- Name: tem_tests_testing_lab_test_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tem_tests_testing_lab_test_date_idx ON public.tem_tests USING btree (testing_lab, test_date);


--
-- Name: update_reports_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX update_reports_created_at_idx ON public.update_reports USING btree (created_at);


--
-- Name: update_reports_week_of_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX update_reports_week_of_idx ON public.update_reports USING btree (week_of);


--
-- Name: user_bookmarks_article_id_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_bookmarks_article_id_user_id_key ON public.user_bookmarks USING btree (article_id, user_id);


--
-- Name: user_bookmarks_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_bookmarks_user_id_created_at_idx ON public.user_bookmarks USING btree (user_id, created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: bet bet_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bet bet_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bet
    ADD CONSTRAINT bet_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: biochar biochar_lot_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biochar
    ADD CONSTRAINT biochar_lot_number_fkey FOREIGN KEY (lot_number) REFERENCES public.biochar_lots(lot_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: compound_batch_sem_reports compound_batch_sem_reports_compound_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_sem_reports
    ADD CONSTRAINT compound_batch_sem_reports_compound_batch_id_fkey FOREIGN KEY (compound_batch_id) REFERENCES public.compound_batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compound_batch_sem_reports compound_batch_sem_reports_sem_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_sem_reports
    ADD CONSTRAINT compound_batch_sem_reports_sem_report_id_fkey FOREIGN KEY (sem_report_id) REFERENCES public.sem_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compound_batch_update_reports compound_batch_update_reports_compound_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_update_reports
    ADD CONSTRAINT compound_batch_update_reports_compound_batch_id_fkey FOREIGN KEY (compound_batch_id) REFERENCES public.compound_batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compound_batch_update_reports compound_batch_update_reports_update_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compound_batch_update_reports
    ADD CONSTRAINT compound_batch_update_reports_update_report_id_fkey FOREIGN KEY (update_report_id) REFERENCES public.update_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conductivity_tests conductivity_tests_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductivity_tests
    ADD CONSTRAINT conductivity_tests_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conductivity_tests conductivity_tests_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductivity_tests
    ADD CONSTRAINT conductivity_tests_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: content_processing_logs content_processing_logs_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_processing_logs
    ADD CONSTRAINT content_processing_logs_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.news_sources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene graphene_biochar_experiment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene
    ADD CONSTRAINT graphene_biochar_experiment_fkey FOREIGN KEY (biochar_experiment) REFERENCES public.biochar(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: graphene graphene_biochar_lot_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene
    ADD CONSTRAINT graphene_biochar_lot_number_fkey FOREIGN KEY (biochar_lot_number) REFERENCES public.biochar_lots(lot_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: graphene_compound_batches graphene_compound_batches_compound_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_compound_batches
    ADD CONSTRAINT graphene_compound_batches_compound_batch_id_fkey FOREIGN KEY (compound_batch_id) REFERENCES public.compound_batches(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene_compound_batches graphene_compound_batches_graphene_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_compound_batches
    ADD CONSTRAINT graphene_compound_batches_graphene_id_fkey FOREIGN KEY (graphene_id) REFERENCES public.graphene(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene_sem_reports graphene_sem_reports_graphene_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_sem_reports
    ADD CONSTRAINT graphene_sem_reports_graphene_id_fkey FOREIGN KEY (graphene_id) REFERENCES public.graphene(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene_sem_reports graphene_sem_reports_sem_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_sem_reports
    ADD CONSTRAINT graphene_sem_reports_sem_report_id_fkey FOREIGN KEY (sem_report_id) REFERENCES public.sem_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene_update_reports graphene_update_reports_graphene_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_update_reports
    ADD CONSTRAINT graphene_update_reports_graphene_id_fkey FOREIGN KEY (graphene_id) REFERENCES public.graphene(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: graphene_update_reports graphene_update_reports_update_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graphene_update_reports
    ADD CONSTRAINT graphene_update_reports_update_report_id_fkey FOREIGN KEY (update_report_id) REFERENCES public.update_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: material_shipments material_shipments_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_shipments
    ADD CONSTRAINT material_shipments_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: material_shipments material_shipments_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_shipments
    ADD CONSTRAINT material_shipments_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: material_shipments material_shipments_micronization_sku_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_shipments
    ADD CONSTRAINT material_shipments_micronization_sku_fkey FOREIGN KEY (micronization_sku) REFERENCES public.micronizations(sku) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: micronizations micronizations_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micronizations
    ADD CONSTRAINT micronizations_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: micronizations micronizations_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.micronizations
    ADD CONSTRAINT micronizations_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: news_articles news_articles_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.news_sources(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: raman_tests raman_tests_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raman_tests
    ADD CONSTRAINT raman_tests_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: raman_tests raman_tests_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raman_tests
    ADD CONSTRAINT raman_tests_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tem_tests tem_tests_compound_batch_number_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tem_tests
    ADD CONSTRAINT tem_tests_compound_batch_number_fkey FOREIGN KEY (compound_batch_number) REFERENCES public.compound_batches(batch_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tem_tests tem_tests_graphene_sample_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tem_tests
    ADD CONSTRAINT tem_tests_graphene_sample_fkey FOREIGN KEY (graphene_sample) REFERENCES public.graphene(experiment_number) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_bookmarks user_bookmarks_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

