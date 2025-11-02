--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-28 15:49:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 218 (class 1259 OID 16679)
-- Name: Projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Projects" (
    "ID" bigint NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Number" character varying(12) NOT NULL,
    "Description" character varying(255) NOT NULL,
    "AllowAssignWorkingHours" boolean DEFAULT false NOT NULL,
    "CountryCode" character varying(3) NOT NULL,
    "Manager" bigint NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16735)
-- Name: ActiveProjects; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."ActiveProjects" AS
 SELECT "Projects"."ID",
    "Projects"."Name",
    "Projects"."Number",
    "Projects"."Description",
    "Projects"."AllowAssignWorkingHours",
    "Projects"."CountryCode",
    "Projects"."Manager",
    concat("Projects"."Number", '/', "Projects"."Name") AS "NumberName"
   FROM public."Projects"
  WHERE "Projects"."AllowAssignWorkingHours";


--
-- TOC entry 226 (class 1259 OID 16730)
-- Name: CinnostTyp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CinnostTyp" (
    "ID" bigint NOT NULL,
    "Typ" character varying(20) NOT NULL,
    "Alias" character varying(50) NOT NULL,
    "Zmazane" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16719)
-- Name: HourType; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HourType" (
    "ID" bigint NOT NULL,
    "HourType" character varying(50) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16713)
-- Name: HourTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HourTypes" (
    "ID" bigint NOT NULL,
    "HourType" character varying(50) NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 17083)
-- Name: t_Anna_Lovasova; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Anna_Lovasova" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 263 (class 1259 OID 17300)
-- Name: t_Branislav_Skrada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Branislav_Skrada" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 276 (class 1259 OID 49591)
-- Name: t_David_Smotlak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_David_Smotlak" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 17020)
-- Name: t_Dominik_Kollar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Dominik_Kollar" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 270 (class 1259 OID 49345)
-- Name: t_Emilia_Curillova; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Emilia_Curillova" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 275 (class 1259 OID 49528)
-- Name: t_Gergely_Gondor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Gergely_Gondor" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 16896)
-- Name: t_Jaroslav_Sobon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Jaroslav_Sobon" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 253 (class 1259 OID 17145)
-- Name: t_Jozef_Vlcek; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Jozef_Vlcek" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 255 (class 1259 OID 17176)
-- Name: t_Jozef_Vybostok; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Jozef_Vybostok" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 282 (class 1259 OID 74127)
-- Name: t_Karol_Jancik; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Karol_Jancik" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 247 (class 1259 OID 17052)
-- Name: t_Krnac_Martin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Krnac_Martin" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 251 (class 1259 OID 17114)
-- Name: t_Lucia_Smotlakova; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Lucia_Smotlakova" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 16958)
-- Name: t_Martin_Krnac; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Martin_Krnac" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16834)
-- Name: t_Martin_Ostrihon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Martin_Ostrihon" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 24587)
-- Name: t_Martin_Sipka; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Martin_Sipka" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 284 (class 1259 OID 98609)
-- Name: t_Martina_Alaksova; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Martina_Alaksova" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 259 (class 1259 OID 17238)
-- Name: t_Michal_Scepka; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Michal_Scepka" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 257 (class 1259 OID 17207)
-- Name: t_Michal_Valkovic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Michal_Valkovic" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 16803)
-- Name: t_Milan_Smotlak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Milan_Smotlak" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 17269)
-- Name: t_Miroslav_Boloz; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Miroslav_Boloz" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16865)
-- Name: t_Peter_Fabik; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Peter_Fabik" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 32773)
-- Name: t_Richard_Prcek; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Richard_Prcek" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 16927)
-- Name: t_Robert_Polak; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Robert_Polak" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 273 (class 1259 OID 49496)
-- Name: t_Roman_Szolik; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Roman_Szolik" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 16989)
-- Name: t_Smotlak_David; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Smotlak_David" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 280 (class 1259 OID 57630)
-- Name: AllTData; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."AllTData" AS
 SELECT ttables."Person",
    ttables."StartDate",
    "Projects"."Number" AS "ProjectID",
    "HourType"."HourType",
        CASE
            WHEN (ttables."EndTime" < ttables."StartTime") THEN ((EXTRACT(epoch FROM (ttables."EndTime" - ttables."StartTime")) / (3600)::numeric) + (24)::numeric)
            ELSE (EXTRACT(epoch FROM (ttables."EndTime" - ttables."StartTime")) / (3600)::numeric)
        END AS "Hours",
    "HourTypes"."HourType" AS "HourTypeID",
    ttables."Description",
    ttables.km AS "KM",
    EXTRACT(month FROM ttables."StartDate") AS "Month",
    EXTRACT(year FROM ttables."StartDate") AS "Year",
    EXTRACT(week FROM ttables."StartDate") AS "Week"
   FROM ((((( SELECT 'Ing. Milan Šmotlák'::text AS "Person",
            "t_Milan_Smotlak"."ID",
            "t_Milan_Smotlak"."CinnostTypID",
            "t_Milan_Smotlak"."StartDate",
            "t_Milan_Smotlak"."ProjectID",
            "t_Milan_Smotlak"."HourTypeID",
            "t_Milan_Smotlak"."HourTypesID",
            "t_Milan_Smotlak"."StartTime",
            "t_Milan_Smotlak"."EndTime",
            "t_Milan_Smotlak"."Description",
            "t_Milan_Smotlak".km,
            "t_Milan_Smotlak"."Lock",
            "t_Milan_Smotlak"."DlhodobaSC"
           FROM public."t_Milan_Smotlak"
        UNION ALL
         SELECT 'Ing. Martin Ostrihoň'::text AS "Person",
            "t_Martin_Ostrihon"."ID",
            "t_Martin_Ostrihon"."CinnostTypID",
            "t_Martin_Ostrihon"."StartDate",
            "t_Martin_Ostrihon"."ProjectID",
            "t_Martin_Ostrihon"."HourTypeID",
            "t_Martin_Ostrihon"."HourTypesID",
            "t_Martin_Ostrihon"."StartTime",
            "t_Martin_Ostrihon"."EndTime",
            "t_Martin_Ostrihon"."Description",
            "t_Martin_Ostrihon".km,
            "t_Martin_Ostrihon"."Lock",
            "t_Martin_Ostrihon"."DlhodobaSC"
           FROM public."t_Martin_Ostrihon"
        UNION ALL
         SELECT 'Ing. Peter Fábik'::text AS "Person",
            "t_Peter_Fabik"."ID",
            "t_Peter_Fabik"."CinnostTypID",
            "t_Peter_Fabik"."StartDate",
            "t_Peter_Fabik"."ProjectID",
            "t_Peter_Fabik"."HourTypeID",
            "t_Peter_Fabik"."HourTypesID",
            "t_Peter_Fabik"."StartTime",
            "t_Peter_Fabik"."EndTime",
            "t_Peter_Fabik"."Description",
            "t_Peter_Fabik".km,
            "t_Peter_Fabik"."Lock",
            "t_Peter_Fabik"."DlhodobaSC"
           FROM public."t_Peter_Fabik"
        UNION ALL
         SELECT 'Jaroslav Soboň'::text AS "Person",
            "t_Jaroslav_Sobon"."ID",
            "t_Jaroslav_Sobon"."CinnostTypID",
            "t_Jaroslav_Sobon"."StartDate",
            "t_Jaroslav_Sobon"."ProjectID",
            "t_Jaroslav_Sobon"."HourTypeID",
            "t_Jaroslav_Sobon"."HourTypesID",
            "t_Jaroslav_Sobon"."StartTime",
            "t_Jaroslav_Sobon"."EndTime",
            "t_Jaroslav_Sobon"."Description",
            "t_Jaroslav_Sobon".km,
            "t_Jaroslav_Sobon"."Lock",
            "t_Jaroslav_Sobon"."DlhodobaSC"
           FROM public."t_Jaroslav_Sobon"
        UNION ALL
         SELECT 'Ing. Róbert Polák'::text AS "Person",
            "t_Robert_Polak"."ID",
            "t_Robert_Polak"."CinnostTypID",
            "t_Robert_Polak"."StartDate",
            "t_Robert_Polak"."ProjectID",
            "t_Robert_Polak"."HourTypeID",
            "t_Robert_Polak"."HourTypesID",
            "t_Robert_Polak"."StartTime",
            "t_Robert_Polak"."EndTime",
            "t_Robert_Polak"."Description",
            "t_Robert_Polak".km,
            "t_Robert_Polak"."Lock",
            "t_Robert_Polak"."DlhodobaSC"
           FROM public."t_Robert_Polak"
        UNION ALL
         SELECT 'Ing. Martin Krnáč'::text AS "Person",
            "t_Martin_Krnac"."ID",
            "t_Martin_Krnac"."CinnostTypID",
            "t_Martin_Krnac"."StartDate",
            "t_Martin_Krnac"."ProjectID",
            "t_Martin_Krnac"."HourTypeID",
            "t_Martin_Krnac"."HourTypesID",
            "t_Martin_Krnac"."StartTime",
            "t_Martin_Krnac"."EndTime",
            "t_Martin_Krnac"."Description",
            "t_Martin_Krnac".km,
            "t_Martin_Krnac"."Lock",
            "t_Martin_Krnac"."DlhodobaSC"
           FROM public."t_Martin_Krnac"
        UNION ALL
         SELECT 'Bc. Šmotlák Dávid'::text AS "Person",
            "t_Smotlak_David"."ID",
            "t_Smotlak_David"."CinnostTypID",
            "t_Smotlak_David"."StartDate",
            "t_Smotlak_David"."ProjectID",
            "t_Smotlak_David"."HourTypeID",
            "t_Smotlak_David"."HourTypesID",
            "t_Smotlak_David"."StartTime",
            "t_Smotlak_David"."EndTime",
            "t_Smotlak_David"."Description",
            "t_Smotlak_David".km,
            "t_Smotlak_David"."Lock",
            "t_Smotlak_David"."DlhodobaSC"
           FROM public."t_Smotlak_David"
        UNION ALL
         SELECT 'Ing. Dominik Kollár'::text AS "Person",
            "t_Dominik_Kollar"."ID",
            "t_Dominik_Kollar"."CinnostTypID",
            "t_Dominik_Kollar"."StartDate",
            "t_Dominik_Kollar"."ProjectID",
            "t_Dominik_Kollar"."HourTypeID",
            "t_Dominik_Kollar"."HourTypesID",
            "t_Dominik_Kollar"."StartTime",
            "t_Dominik_Kollar"."EndTime",
            "t_Dominik_Kollar"."Description",
            "t_Dominik_Kollar".km,
            "t_Dominik_Kollar"."Lock",
            "t_Dominik_Kollar"."DlhodobaSC"
           FROM public."t_Dominik_Kollar"
        UNION ALL
         SELECT 'Ing. Krnáč Martin'::text AS "Person",
            "t_Krnac_Martin"."ID",
            "t_Krnac_Martin"."CinnostTypID",
            "t_Krnac_Martin"."StartDate",
            "t_Krnac_Martin"."ProjectID",
            "t_Krnac_Martin"."HourTypeID",
            "t_Krnac_Martin"."HourTypesID",
            "t_Krnac_Martin"."StartTime",
            "t_Krnac_Martin"."EndTime",
            "t_Krnac_Martin"."Description",
            "t_Krnac_Martin".km,
            "t_Krnac_Martin"."Lock",
            "t_Krnac_Martin"."DlhodobaSC"
           FROM public."t_Krnac_Martin"
        UNION ALL
         SELECT 'Anna Lovásová'::text AS "Person",
            "t_Anna_Lovasova"."ID",
            "t_Anna_Lovasova"."CinnostTypID",
            "t_Anna_Lovasova"."StartDate",
            "t_Anna_Lovasova"."ProjectID",
            "t_Anna_Lovasova"."HourTypeID",
            "t_Anna_Lovasova"."HourTypesID",
            "t_Anna_Lovasova"."StartTime",
            "t_Anna_Lovasova"."EndTime",
            "t_Anna_Lovasova"."Description",
            "t_Anna_Lovasova".km,
            "t_Anna_Lovasova"."Lock",
            "t_Anna_Lovasova"."DlhodobaSC"
           FROM public."t_Anna_Lovasova"
        UNION ALL
         SELECT 'Lucia Šmotláková'::text AS "Person",
            "t_Lucia_Smotlakova"."ID",
            "t_Lucia_Smotlakova"."CinnostTypID",
            "t_Lucia_Smotlakova"."StartDate",
            "t_Lucia_Smotlakova"."ProjectID",
            "t_Lucia_Smotlakova"."HourTypeID",
            "t_Lucia_Smotlakova"."HourTypesID",
            "t_Lucia_Smotlakova"."StartTime",
            "t_Lucia_Smotlakova"."EndTime",
            "t_Lucia_Smotlakova"."Description",
            "t_Lucia_Smotlakova".km,
            "t_Lucia_Smotlakova"."Lock",
            "t_Lucia_Smotlakova"."DlhodobaSC"
           FROM public."t_Lucia_Smotlakova"
        UNION ALL
         SELECT 'Jozef Vlček'::text AS "Person",
            "t_Jozef_Vlcek"."ID",
            "t_Jozef_Vlcek"."CinnostTypID",
            "t_Jozef_Vlcek"."StartDate",
            "t_Jozef_Vlcek"."ProjectID",
            "t_Jozef_Vlcek"."HourTypeID",
            "t_Jozef_Vlcek"."HourTypesID",
            "t_Jozef_Vlcek"."StartTime",
            "t_Jozef_Vlcek"."EndTime",
            "t_Jozef_Vlcek"."Description",
            "t_Jozef_Vlcek".km,
            "t_Jozef_Vlcek"."Lock",
            "t_Jozef_Vlcek"."DlhodobaSC"
           FROM public."t_Jozef_Vlcek"
        UNION ALL
         SELECT 'Bc. Jozef Výbošťok'::text AS "Person",
            "t_Jozef_Vybostok"."ID",
            "t_Jozef_Vybostok"."CinnostTypID",
            "t_Jozef_Vybostok"."StartDate",
            "t_Jozef_Vybostok"."ProjectID",
            "t_Jozef_Vybostok"."HourTypeID",
            "t_Jozef_Vybostok"."HourTypesID",
            "t_Jozef_Vybostok"."StartTime",
            "t_Jozef_Vybostok"."EndTime",
            "t_Jozef_Vybostok"."Description",
            "t_Jozef_Vybostok".km,
            "t_Jozef_Vybostok"."Lock",
            "t_Jozef_Vybostok"."DlhodobaSC"
           FROM public."t_Jozef_Vybostok"
        UNION ALL
         SELECT 'Michal Valkovič'::text AS "Person",
            "t_Michal_Valkovic"."ID",
            "t_Michal_Valkovic"."CinnostTypID",
            "t_Michal_Valkovic"."StartDate",
            "t_Michal_Valkovic"."ProjectID",
            "t_Michal_Valkovic"."HourTypeID",
            "t_Michal_Valkovic"."HourTypesID",
            "t_Michal_Valkovic"."StartTime",
            "t_Michal_Valkovic"."EndTime",
            "t_Michal_Valkovic"."Description",
            "t_Michal_Valkovic".km,
            "t_Michal_Valkovic"."Lock",
            "t_Michal_Valkovic"."DlhodobaSC"
           FROM public."t_Michal_Valkovic"
        UNION ALL
         SELECT 'Michal Ščepka'::text AS "Person",
            "t_Michal_Scepka"."ID",
            "t_Michal_Scepka"."CinnostTypID",
            "t_Michal_Scepka"."StartDate",
            "t_Michal_Scepka"."ProjectID",
            "t_Michal_Scepka"."HourTypeID",
            "t_Michal_Scepka"."HourTypesID",
            "t_Michal_Scepka"."StartTime",
            "t_Michal_Scepka"."EndTime",
            "t_Michal_Scepka"."Description",
            "t_Michal_Scepka".km,
            "t_Michal_Scepka"."Lock",
            "t_Michal_Scepka"."DlhodobaSC"
           FROM public."t_Michal_Scepka"
        UNION ALL
         SELECT 'Ing. Miroslav Boloz'::text AS "Person",
            "t_Miroslav_Boloz"."ID",
            "t_Miroslav_Boloz"."CinnostTypID",
            "t_Miroslav_Boloz"."StartDate",
            "t_Miroslav_Boloz"."ProjectID",
            "t_Miroslav_Boloz"."HourTypeID",
            "t_Miroslav_Boloz"."HourTypesID",
            "t_Miroslav_Boloz"."StartTime",
            "t_Miroslav_Boloz"."EndTime",
            "t_Miroslav_Boloz"."Description",
            "t_Miroslav_Boloz".km,
            "t_Miroslav_Boloz"."Lock",
            "t_Miroslav_Boloz"."DlhodobaSC"
           FROM public."t_Miroslav_Boloz"
        UNION ALL
         SELECT 'Ing. Branislav Škrada'::text AS "Person",
            "t_Branislav_Skrada"."ID",
            "t_Branislav_Skrada"."CinnostTypID",
            "t_Branislav_Skrada"."StartDate",
            "t_Branislav_Skrada"."ProjectID",
            "t_Branislav_Skrada"."HourTypeID",
            "t_Branislav_Skrada"."HourTypesID",
            "t_Branislav_Skrada"."StartTime",
            "t_Branislav_Skrada"."EndTime",
            "t_Branislav_Skrada"."Description",
            "t_Branislav_Skrada".km,
            "t_Branislav_Skrada"."Lock",
            "t_Branislav_Skrada"."DlhodobaSC"
           FROM public."t_Branislav_Skrada"
        UNION ALL
         SELECT 'Martin Šípka'::text AS "Person",
            "t_Martin_Sipka"."ID",
            "t_Martin_Sipka"."CinnostTypID",
            "t_Martin_Sipka"."StartDate",
            "t_Martin_Sipka"."ProjectID",
            "t_Martin_Sipka"."HourTypeID",
            "t_Martin_Sipka"."HourTypesID",
            "t_Martin_Sipka"."StartTime",
            "t_Martin_Sipka"."EndTime",
            "t_Martin_Sipka"."Description",
            "t_Martin_Sipka".km,
            "t_Martin_Sipka"."Lock",
            "t_Martin_Sipka"."DlhodobaSC"
           FROM public."t_Martin_Sipka"
        UNION ALL
         SELECT 'Richard Prček'::text AS "Person",
            "t_Richard_Prcek"."ID",
            "t_Richard_Prcek"."CinnostTypID",
            "t_Richard_Prcek"."StartDate",
            "t_Richard_Prcek"."ProjectID",
            "t_Richard_Prcek"."HourTypeID",
            "t_Richard_Prcek"."HourTypesID",
            "t_Richard_Prcek"."StartTime",
            "t_Richard_Prcek"."EndTime",
            "t_Richard_Prcek"."Description",
            "t_Richard_Prcek".km,
            "t_Richard_Prcek"."Lock",
            "t_Richard_Prcek"."DlhodobaSC"
           FROM public."t_Richard_Prcek"
        UNION ALL
         SELECT 'Emília Čurillová'::text AS "Person",
            "t_Emilia_Curillova"."ID",
            "t_Emilia_Curillova"."CinnostTypID",
            "t_Emilia_Curillova"."StartDate",
            "t_Emilia_Curillova"."ProjectID",
            "t_Emilia_Curillova"."HourTypeID",
            "t_Emilia_Curillova"."HourTypesID",
            "t_Emilia_Curillova"."StartTime",
            "t_Emilia_Curillova"."EndTime",
            "t_Emilia_Curillova"."Description",
            "t_Emilia_Curillova".km,
            "t_Emilia_Curillova"."Lock",
            "t_Emilia_Curillova"."DlhodobaSC"
           FROM public."t_Emilia_Curillova"
        UNION ALL
         SELECT 'Ing. David Šmotlák'::text AS "Person",
            "t_David_Smotlak"."ID",
            "t_David_Smotlak"."CinnostTypID",
            "t_David_Smotlak"."StartDate",
            "t_David_Smotlak"."ProjectID",
            "t_David_Smotlak"."HourTypeID",
            "t_David_Smotlak"."HourTypesID",
            "t_David_Smotlak"."StartTime",
            "t_David_Smotlak"."EndTime",
            "t_David_Smotlak"."Description",
            "t_David_Smotlak".km,
            "t_David_Smotlak"."Lock",
            "t_David_Smotlak"."DlhodobaSC"
           FROM public."t_David_Smotlak"
        UNION ALL
         SELECT 'Bc. Roman Szolík'::text AS "Person",
            "t_Roman_Szolik"."ID",
            "t_Roman_Szolik"."CinnostTypID",
            "t_Roman_Szolik"."StartDate",
            "t_Roman_Szolik"."ProjectID",
            "t_Roman_Szolik"."HourTypeID",
            "t_Roman_Szolik"."HourTypesID",
            "t_Roman_Szolik"."StartTime",
            "t_Roman_Szolik"."EndTime",
            "t_Roman_Szolik"."Description",
            "t_Roman_Szolik".km,
            "t_Roman_Szolik"."Lock",
            "t_Roman_Szolik"."DlhodobaSC"
           FROM public."t_Roman_Szolik"
        UNION ALL
         SELECT 'Ing. Gergely Gondor'::text AS "Person",
            "t_Gergely_Gondor"."ID",
            "t_Gergely_Gondor"."CinnostTypID",
            "t_Gergely_Gondor"."StartDate",
            "t_Gergely_Gondor"."ProjectID",
            "t_Gergely_Gondor"."HourTypeID",
            "t_Gergely_Gondor"."HourTypesID",
            "t_Gergely_Gondor"."StartTime",
            "t_Gergely_Gondor"."EndTime",
            "t_Gergely_Gondor"."Description",
            "t_Gergely_Gondor".km,
            "t_Gergely_Gondor"."Lock",
            "t_Gergely_Gondor"."DlhodobaSC"
           FROM public."t_Gergely_Gondor"
        UNION ALL
         SELECT 'Bc. Karol Jančík'::text AS "Person",
            "t_Karol_Jancik"."ID",
            "t_Karol_Jancik"."CinnostTypID",
            "t_Karol_Jancik"."StartDate",
            "t_Karol_Jancik"."ProjectID",
            "t_Karol_Jancik"."HourTypeID",
            "t_Karol_Jancik"."HourTypesID",
            "t_Karol_Jancik"."StartTime",
            "t_Karol_Jancik"."EndTime",
            "t_Karol_Jancik"."Description",
            "t_Karol_Jancik".km,
            "t_Karol_Jancik"."Lock",
            "t_Karol_Jancik"."DlhodobaSC"
           FROM public."t_Karol_Jancik"
        UNION ALL
         SELECT 'Martina Aľakšová'::text AS "Person",
            "t_Martina_Alaksova"."ID",
            "t_Martina_Alaksova"."CinnostTypID",
            "t_Martina_Alaksova"."StartDate",
            "t_Martina_Alaksova"."ProjectID",
            "t_Martina_Alaksova"."HourTypeID",
            "t_Martina_Alaksova"."HourTypesID",
            "t_Martina_Alaksova"."StartTime",
            "t_Martina_Alaksova"."EndTime",
            "t_Martina_Alaksova"."Description",
            "t_Martina_Alaksova".km,
            "t_Martina_Alaksova"."Lock",
            "t_Martina_Alaksova"."DlhodobaSC"
           FROM public."t_Martina_Alaksova") ttables
     LEFT JOIN public."CinnostTyp" ON (("CinnostTyp"."ID" = ttables."CinnostTypID")))
     LEFT JOIN public."Projects" ON (("Projects"."ID" = ttables."ProjectID")))
     LEFT JOIN public."HourType" ON (("HourType"."ID" = ttables."HourTypeID")))
     LEFT JOIN public."HourTypes" ON (("HourTypes"."ID" = ttables."HourTypesID")))
  WHERE (("CinnostTyp"."ID" = 1) OR ("CinnostTyp"."ID" = 6));


--
-- TOC entry 225 (class 1259 OID 16729)
-- Name: CinnostTyp_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."CinnostTyp" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."CinnostTyp_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 16673)
-- Name: Countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Countries" (
    "CountryCode" character varying(3) NOT NULL,
    "CountryName" character varying(100) NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16724)
-- Name: Holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Holidays" (
    "Den" date NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 16718)
-- Name: HourType_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."HourType" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."HourType_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16712)
-- Name: HourTypes_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."HourTypes" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."HourTypes_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16697)
-- Name: Nadcasy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Nadcasy" (
    "ZamestnanecID" bigint NOT NULL,
    "Datum" date NOT NULL,
    "Nadcas" interval NOT NULL,
    "Schvalil" bigint,
    "Poznamka" character varying(100),
    "Typ" character varying DEFAULT 'Flexi'::character varying NOT NULL,
    "Odpocet" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16785)
-- Name: NadcasyTyp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NadcasyTyp" (
    "TypNadcasu" character varying NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 49378)
-- Name: Projects_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Projects" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Projects_ID_seq"
    START WITH 185
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 16744)
-- Name: Verzia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Verzia" (
    "Major" integer NOT NULL,
    "Minor" integer NOT NULL,
    "Build" integer NOT NULL,
    "Revision" integer NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 16657)
-- Name: Zamestnanci; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Zamestnanci" (
    "ID" bigint NOT NULL,
    "Meno" character varying(20) NOT NULL,
    "Priezvisko" character varying(50) NOT NULL,
    "TitulPred" character varying(10),
    "TitulZa" character varying(10),
    "Dovolenka" real DEFAULT 20 NOT NULL,
    "IsAdmin" boolean DEFAULT false NOT NULL,
    "TypZamestnanca" character varying(20) NOT NULL,
    "Podpis" bytea,
    "RocnyNadcasVPlate" integer,
    "PoslednyZaznam" date,
    "ZamknuteK" date
);


--
-- TOC entry 268 (class 1259 OID 32855)
-- Name: ZamestnanciFullName; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."ZamestnanciFullName" AS
 SELECT "Zamestnanci"."ID",
    "Zamestnanci"."Meno",
    "Zamestnanci"."Priezvisko",
    "Zamestnanci"."TitulPred",
    "Zamestnanci"."TitulZa",
    "Zamestnanci"."Dovolenka",
    "Zamestnanci"."IsAdmin",
    "Zamestnanci"."TypZamestnanca",
    "Zamestnanci"."Podpis",
    "Zamestnanci"."RocnyNadcasVPlate",
    "Zamestnanci"."PoslednyZaznam",
    "Zamestnanci"."ZamknuteK",
        CASE
            WHEN ("Zamestnanci"."ID" = 1) THEN 'Aplikácia'::text
            WHEN (("Zamestnanci"."TitulPred" IS NULL) OR (("Zamestnanci"."TitulPred")::text = ''::text)) THEN
            CASE
                WHEN (("Zamestnanci"."TitulZa" IS NULL) OR (("Zamestnanci"."TitulZa")::text = ''::text)) THEN concat("Zamestnanci"."Meno", ' ', "Zamestnanci"."Priezvisko")
                ELSE concat("Zamestnanci"."Meno", ' ', "Zamestnanci"."Priezvisko", ', ', "Zamestnanci"."TitulZa")
            END
            ELSE
            CASE
                WHEN (("Zamestnanci"."TitulZa" IS NULL) OR (("Zamestnanci"."TitulZa")::text = ''::text)) THEN concat("Zamestnanci"."TitulPred", ' ', "Zamestnanci"."Meno", ' ', "Zamestnanci"."Priezvisko")
                ELSE concat("Zamestnanci"."TitulPred", ' ', "Zamestnanci"."Meno", ' ', "Zamestnanci"."Priezvisko", ', ', "Zamestnanci"."TitulZa")
            END
        END AS "FullName"
   FROM public."Zamestnanci";


--
-- TOC entry 215 (class 1259 OID 16656)
-- Name: Zamestnanci_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Zamestnanci" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Zamestnanci_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 214 (class 1259 OID 16651)
-- Name: ZamestnanecTyp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ZamestnanecTyp" (
    "Typ" character varying(20) NOT NULL,
    "FondPracovnehoCasu" integer NOT NULL
);


--
-- TOC entry 248 (class 1259 OID 17082)
-- Name: t_Anna_Lovasova_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Anna_Lovasova" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Anna_Lovasova_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 262 (class 1259 OID 17299)
-- Name: t_Branislav_Skrada_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Branislav_Skrada" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Branislav_Skrada_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 242 (class 1259 OID 16988)
-- Name: t_David_Smotlak_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Smotlak_David" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_David_Smotlak_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 279 (class 1259 OID 57623)
-- Name: t_David_Smotlak_ID_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_David_Smotlak" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_David_Smotlak_ID_seq1"
    START WITH 81
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 244 (class 1259 OID 17019)
-- Name: t_Dominik_Kollar_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Dominik_Kollar" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Dominik_Kollar_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 269 (class 1259 OID 49344)
-- Name: t_Emilia_Curillova_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Emilia_Curillova" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Emilia_Curillova_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 278 (class 1259 OID 49600)
-- Name: t_Ferko_Mrkvicka; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."t_Ferko_Mrkvicka" (
    "ID" bigint NOT NULL,
    "CinnostTypID" bigint NOT NULL,
    "StartDate" date NOT NULL,
    "ProjectID" bigint,
    "HourTypeID" bigint,
    "HourTypesID" bigint,
    "StartTime" time without time zone NOT NULL,
    "EndTime" time without time zone NOT NULL,
    "Description" text,
    km integer DEFAULT 0,
    "Lock" boolean DEFAULT false NOT NULL,
    "DlhodobaSC" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 277 (class 1259 OID 49599)
-- Name: t_Ferko_Mrkvicka_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Ferko_Mrkvicka" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Ferko_Mrkvicka_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 274 (class 1259 OID 49527)
-- Name: t_Gergely_Gondor_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Gergely_Gondor" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Gergely_Gondor_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 16895)
-- Name: t_Jaroslav_Sobon_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Jaroslav_Sobon" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Jaroslav_Sobon_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 252 (class 1259 OID 17144)
-- Name: t_Jozef_Vlcek_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Jozef_Vlcek" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Jozef_Vlcek_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 254 (class 1259 OID 17175)
-- Name: t_Jozef_Vybostok_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Jozef_Vybostok" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Jozef_Vybostok_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 281 (class 1259 OID 74126)
-- Name: t_Karol_Jancik_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Karol_Jancik" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Karol_Jancik_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 246 (class 1259 OID 17051)
-- Name: t_Krnac_Martin_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Krnac_Martin" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Krnac_Martin_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 250 (class 1259 OID 17113)
-- Name: t_Lucia_Smotlakova_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Lucia_Smotlakova" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Lucia_Smotlakova_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 283 (class 1259 OID 98608)
-- Name: t_Martin_Alaksova_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Martina_Alaksova" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Martin_Alaksova_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 16957)
-- Name: t_Martin_Krnac_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Martin_Krnac" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Martin_Krnac_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16833)
-- Name: t_Martin_Ostrihon_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Martin_Ostrihon" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Martin_Ostrihon_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 264 (class 1259 OID 24586)
-- Name: t_Martin_Sipka_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Martin_Sipka" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Martin_Sipka_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 258 (class 1259 OID 17237)
-- Name: t_Michal_Scepka_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Michal_Scepka" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Michal_Scepka_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 256 (class 1259 OID 17206)
-- Name: t_Michal_Valkovic_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Michal_Valkovic" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Michal_Valkovic_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16802)
-- Name: t_Milan_Smotlak_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Milan_Smotlak" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Milan_Smotlak_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 260 (class 1259 OID 17268)
-- Name: t_Miroslav_Boloz_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Miroslav_Boloz" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Miroslav_Boloz_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16864)
-- Name: t_Peter_Fabik_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Peter_Fabik" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Peter_Fabik_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 266 (class 1259 OID 32772)
-- Name: t_Richard_Prcek_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Richard_Prcek" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Richard_Prcek_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 16926)
-- Name: t_Robert_Polak_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Robert_Polak" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Robert_Polak_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 272 (class 1259 OID 49495)
-- Name: t_Roman_Szolik_ID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."t_Roman_Szolik" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."t_Roman_Szolik_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3488 (class 2606 OID 16734)
-- Name: CinnostTyp CinnostTyp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CinnostTyp"
    ADD CONSTRAINT "CinnostTyp_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3474 (class 2606 OID 16677)
-- Name: Countries Countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "Countries_pkey" PRIMARY KEY ("CountryCode");


--
-- TOC entry 3486 (class 2606 OID 16728)
-- Name: Holidays Holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Holidays"
    ADD CONSTRAINT "Holidays_pkey" PRIMARY KEY ("Den");


--
-- TOC entry 3484 (class 2606 OID 16723)
-- Name: HourType HourType_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HourType"
    ADD CONSTRAINT "HourType_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3482 (class 2606 OID 16717)
-- Name: HourTypes HourTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HourTypes"
    ADD CONSTRAINT "HourTypes_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3492 (class 2606 OID 16791)
-- Name: NadcasyTyp NadcasyTyp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NadcasyTyp"
    ADD CONSTRAINT "NadcasyTyp_pkey" PRIMARY KEY ("TypNadcasu");


--
-- TOC entry 3480 (class 2606 OID 49447)
-- Name: Nadcasy Nadcasy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Nadcasy"
    ADD CONSTRAINT "Nadcasy_pkey" PRIMARY KEY ("ZamestnanecID", "Datum", "Typ", "Odpocet");


--
-- TOC entry 3476 (class 2606 OID 16686)
-- Name: Projects Projects_Number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_Number_key" UNIQUE ("Number");


--
-- TOC entry 3478 (class 2606 OID 16684)
-- Name: Projects Projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3490 (class 2606 OID 16748)
-- Name: Verzia Verzia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Verzia"
    ADD CONSTRAINT "Verzia_pkey" PRIMARY KEY ("Major", "Minor", "Build", "Revision");


--
-- TOC entry 3470 (class 2606 OID 16667)
-- Name: Zamestnanci Zamestnanci_Meno_Priezvisko_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Zamestnanci"
    ADD CONSTRAINT "Zamestnanci_Meno_Priezvisko_key" UNIQUE ("Meno", "Priezvisko");


--
-- TOC entry 3472 (class 2606 OID 16665)
-- Name: Zamestnanci Zamestnanci_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Zamestnanci"
    ADD CONSTRAINT "Zamestnanci_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3468 (class 2606 OID 16655)
-- Name: ZamestnanecTyp ZamestnanecTyp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ZamestnanecTyp"
    ADD CONSTRAINT "ZamestnanecTyp_pkey" PRIMARY KEY ("Typ");


--
-- TOC entry 3512 (class 2606 OID 17092)
-- Name: t_Anna_Lovasova t_Anna_Lovasova_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Anna_Lovasova"
    ADD CONSTRAINT "t_Anna_Lovasova_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3526 (class 2606 OID 17309)
-- Name: t_Branislav_Skrada t_Branislav_Skrada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Branislav_Skrada"
    ADD CONSTRAINT "t_Branislav_Skrada_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3539 (class 2606 OID 49632)
-- Name: t_David_Smotlak t_David_Smotlak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_David_Smotlak"
    ADD CONSTRAINT "t_David_Smotlak_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3508 (class 2606 OID 17029)
-- Name: t_Dominik_Kollar t_Dominik_Kollar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Dominik_Kollar"
    ADD CONSTRAINT "t_Dominik_Kollar_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3532 (class 2606 OID 49354)
-- Name: t_Emilia_Curillova t_Emilia_Curillova_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Emilia_Curillova"
    ADD CONSTRAINT "t_Emilia_Curillova_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3541 (class 2606 OID 49609)
-- Name: t_Ferko_Mrkvicka t_Ferko_Mrkvicka_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Ferko_Mrkvicka"
    ADD CONSTRAINT "t_Ferko_Mrkvicka_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3536 (class 2606 OID 49537)
-- Name: t_Gergely_Gondor t_Gergely_Gondor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Gergely_Gondor"
    ADD CONSTRAINT "t_Gergely_Gondor_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3500 (class 2606 OID 16905)
-- Name: t_Jaroslav_Sobon t_Jaroslav_Sobon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jaroslav_Sobon"
    ADD CONSTRAINT "t_Jaroslav_Sobon_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3516 (class 2606 OID 17154)
-- Name: t_Jozef_Vlcek t_Jozef_Vlcek_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vlcek"
    ADD CONSTRAINT "t_Jozef_Vlcek_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3518 (class 2606 OID 17185)
-- Name: t_Jozef_Vybostok t_Jozef_Vybostok_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vybostok"
    ADD CONSTRAINT "t_Jozef_Vybostok_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3543 (class 2606 OID 74136)
-- Name: t_Karol_Jancik t_Karol_Jancik_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Karol_Jancik"
    ADD CONSTRAINT "t_Karol_Jancik_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3510 (class 2606 OID 17061)
-- Name: t_Krnac_Martin t_Krnac_Martin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Krnac_Martin"
    ADD CONSTRAINT "t_Krnac_Martin_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3514 (class 2606 OID 17123)
-- Name: t_Lucia_Smotlakova t_Lucia_Smotlakova_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Lucia_Smotlakova"
    ADD CONSTRAINT "t_Lucia_Smotlakova_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3545 (class 2606 OID 98618)
-- Name: t_Martina_Alaksova t_Martin_Alaksova_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martina_Alaksova"
    ADD CONSTRAINT "t_Martin_Alaksova_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3504 (class 2606 OID 16967)
-- Name: t_Martin_Krnac t_Martin_Krnac_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Krnac"
    ADD CONSTRAINT "t_Martin_Krnac_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3496 (class 2606 OID 16843)
-- Name: t_Martin_Ostrihon t_Martin_Ostrihon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Ostrihon"
    ADD CONSTRAINT "t_Martin_Ostrihon_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3528 (class 2606 OID 24596)
-- Name: t_Martin_Sipka t_Martin_Sipka_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Sipka"
    ADD CONSTRAINT "t_Martin_Sipka_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3522 (class 2606 OID 17247)
-- Name: t_Michal_Scepka t_Michal_Scepka_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Scepka"
    ADD CONSTRAINT "t_Michal_Scepka_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3520 (class 2606 OID 17216)
-- Name: t_Michal_Valkovic t_Michal_Valkovic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Valkovic"
    ADD CONSTRAINT "t_Michal_Valkovic_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3494 (class 2606 OID 16812)
-- Name: t_Milan_Smotlak t_Milan_Smotlak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Milan_Smotlak"
    ADD CONSTRAINT "t_Milan_Smotlak_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3524 (class 2606 OID 17278)
-- Name: t_Miroslav_Boloz t_Miroslav_Boloz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Miroslav_Boloz"
    ADD CONSTRAINT "t_Miroslav_Boloz_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3498 (class 2606 OID 16874)
-- Name: t_Peter_Fabik t_Peter_Fabik_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Peter_Fabik"
    ADD CONSTRAINT "t_Peter_Fabik_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3530 (class 2606 OID 32782)
-- Name: t_Richard_Prcek t_Richard_Prcek_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Richard_Prcek"
    ADD CONSTRAINT "t_Richard_Prcek_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3502 (class 2606 OID 16936)
-- Name: t_Robert_Polak t_Robert_Polak_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Robert_Polak"
    ADD CONSTRAINT "t_Robert_Polak_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3534 (class 2606 OID 49505)
-- Name: t_Roman_Szolik t_Roman_Szolik_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Roman_Szolik"
    ADD CONSTRAINT "t_Roman_Szolik_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3506 (class 2606 OID 16998)
-- Name: t_Smotlak_David t_Smotlak_David_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Smotlak_David"
    ADD CONSTRAINT "t_Smotlak_David_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3537 (class 1259 OID 49638)
-- Name: fki_t_David_Smotlak_CinnostTypID_fkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fki_t_David_Smotlak_CinnostTypID_fkey" ON public."t_David_Smotlak" USING btree ("CinnostTypID");


--
-- TOC entry 3549 (class 2606 OID 16707)
-- Name: Nadcasy Nadcasy_Schvalil_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Nadcasy"
    ADD CONSTRAINT "Nadcasy_Schvalil_fkey" FOREIGN KEY ("Schvalil") REFERENCES public."Zamestnanci"("ID");


--
-- TOC entry 3550 (class 2606 OID 16795)
-- Name: Nadcasy Nadcasy_Typ_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Nadcasy"
    ADD CONSTRAINT "Nadcasy_Typ_fkey" FOREIGN KEY ("Typ") REFERENCES public."NadcasyTyp"("TypNadcasu");


--
-- TOC entry 3551 (class 2606 OID 16702)
-- Name: Nadcasy Nadcasy_ZamestnanecID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Nadcasy"
    ADD CONSTRAINT "Nadcasy_ZamestnanecID_fkey" FOREIGN KEY ("ZamestnanecID") REFERENCES public."Zamestnanci"("ID");


--
-- TOC entry 3547 (class 2606 OID 16687)
-- Name: Projects Projects_CountryCode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_CountryCode_fkey" FOREIGN KEY ("CountryCode") REFERENCES public."Countries"("CountryCode");


--
-- TOC entry 3548 (class 2606 OID 16692)
-- Name: Projects Projects_Manager_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Projects"
    ADD CONSTRAINT "Projects_Manager_fkey" FOREIGN KEY ("Manager") REFERENCES public."Zamestnanci"("ID");


--
-- TOC entry 3546 (class 2606 OID 16668)
-- Name: Zamestnanci Zamestnanci_TypZamestnanca_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Zamestnanci"
    ADD CONSTRAINT "Zamestnanci_TypZamestnanca_fkey" FOREIGN KEY ("TypZamestnanca") REFERENCES public."ZamestnanecTyp"("Typ");


--
-- TOC entry 3588 (class 2606 OID 17093)
-- Name: t_Anna_Lovasova t_Anna_Lovasova_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Anna_Lovasova"
    ADD CONSTRAINT "t_Anna_Lovasova_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3589 (class 2606 OID 17098)
-- Name: t_Anna_Lovasova t_Anna_Lovasova_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Anna_Lovasova"
    ADD CONSTRAINT "t_Anna_Lovasova_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3590 (class 2606 OID 17103)
-- Name: t_Anna_Lovasova t_Anna_Lovasova_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Anna_Lovasova"
    ADD CONSTRAINT "t_Anna_Lovasova_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3591 (class 2606 OID 17108)
-- Name: t_Anna_Lovasova t_Anna_Lovasova_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Anna_Lovasova"
    ADD CONSTRAINT "t_Anna_Lovasova_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3616 (class 2606 OID 17310)
-- Name: t_Branislav_Skrada t_Branislav_Skrada_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Branislav_Skrada"
    ADD CONSTRAINT "t_Branislav_Skrada_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3617 (class 2606 OID 17315)
-- Name: t_Branislav_Skrada t_Branislav_Skrada_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Branislav_Skrada"
    ADD CONSTRAINT "t_Branislav_Skrada_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3618 (class 2606 OID 17320)
-- Name: t_Branislav_Skrada t_Branislav_Skrada_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Branislav_Skrada"
    ADD CONSTRAINT "t_Branislav_Skrada_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3619 (class 2606 OID 17325)
-- Name: t_Branislav_Skrada t_Branislav_Skrada_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Branislav_Skrada"
    ADD CONSTRAINT "t_Branislav_Skrada_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3640 (class 2606 OID 49633)
-- Name: t_David_Smotlak t_David_Smotlak_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_David_Smotlak"
    ADD CONSTRAINT "t_David_Smotlak_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3641 (class 2606 OID 49649)
-- Name: t_David_Smotlak t_David_Smotlak_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_David_Smotlak"
    ADD CONSTRAINT "t_David_Smotlak_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID") NOT VALID;


--
-- TOC entry 3642 (class 2606 OID 49644)
-- Name: t_David_Smotlak t_David_Smotlak_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_David_Smotlak"
    ADD CONSTRAINT "t_David_Smotlak_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID") NOT VALID;


--
-- TOC entry 3643 (class 2606 OID 49639)
-- Name: t_David_Smotlak t_David_Smotlak_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_David_Smotlak"
    ADD CONSTRAINT "t_David_Smotlak_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID") NOT VALID;


--
-- TOC entry 3580 (class 2606 OID 17030)
-- Name: t_Dominik_Kollar t_Dominik_Kollar_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Dominik_Kollar"
    ADD CONSTRAINT "t_Dominik_Kollar_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3581 (class 2606 OID 17035)
-- Name: t_Dominik_Kollar t_Dominik_Kollar_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Dominik_Kollar"
    ADD CONSTRAINT "t_Dominik_Kollar_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3582 (class 2606 OID 17040)
-- Name: t_Dominik_Kollar t_Dominik_Kollar_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Dominik_Kollar"
    ADD CONSTRAINT "t_Dominik_Kollar_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3583 (class 2606 OID 17045)
-- Name: t_Dominik_Kollar t_Dominik_Kollar_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Dominik_Kollar"
    ADD CONSTRAINT "t_Dominik_Kollar_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3628 (class 2606 OID 49355)
-- Name: t_Emilia_Curillova t_Emilia_Curillova_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Emilia_Curillova"
    ADD CONSTRAINT "t_Emilia_Curillova_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3629 (class 2606 OID 49360)
-- Name: t_Emilia_Curillova t_Emilia_Curillova_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Emilia_Curillova"
    ADD CONSTRAINT "t_Emilia_Curillova_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3630 (class 2606 OID 49365)
-- Name: t_Emilia_Curillova t_Emilia_Curillova_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Emilia_Curillova"
    ADD CONSTRAINT "t_Emilia_Curillova_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3631 (class 2606 OID 49370)
-- Name: t_Emilia_Curillova t_Emilia_Curillova_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Emilia_Curillova"
    ADD CONSTRAINT "t_Emilia_Curillova_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3644 (class 2606 OID 49610)
-- Name: t_Ferko_Mrkvicka t_Ferko_Mrkvicka_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Ferko_Mrkvicka"
    ADD CONSTRAINT "t_Ferko_Mrkvicka_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3645 (class 2606 OID 49615)
-- Name: t_Ferko_Mrkvicka t_Ferko_Mrkvicka_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Ferko_Mrkvicka"
    ADD CONSTRAINT "t_Ferko_Mrkvicka_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3646 (class 2606 OID 49620)
-- Name: t_Ferko_Mrkvicka t_Ferko_Mrkvicka_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Ferko_Mrkvicka"
    ADD CONSTRAINT "t_Ferko_Mrkvicka_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3647 (class 2606 OID 49625)
-- Name: t_Ferko_Mrkvicka t_Ferko_Mrkvicka_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Ferko_Mrkvicka"
    ADD CONSTRAINT "t_Ferko_Mrkvicka_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3636 (class 2606 OID 49538)
-- Name: t_Gergely_Gondor t_Gergely_Gondor_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Gergely_Gondor"
    ADD CONSTRAINT "t_Gergely_Gondor_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3637 (class 2606 OID 49543)
-- Name: t_Gergely_Gondor t_Gergely_Gondor_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Gergely_Gondor"
    ADD CONSTRAINT "t_Gergely_Gondor_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3638 (class 2606 OID 49548)
-- Name: t_Gergely_Gondor t_Gergely_Gondor_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Gergely_Gondor"
    ADD CONSTRAINT "t_Gergely_Gondor_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3639 (class 2606 OID 49553)
-- Name: t_Gergely_Gondor t_Gergely_Gondor_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Gergely_Gondor"
    ADD CONSTRAINT "t_Gergely_Gondor_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3564 (class 2606 OID 16906)
-- Name: t_Jaroslav_Sobon t_Jaroslav_Sobon_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jaroslav_Sobon"
    ADD CONSTRAINT "t_Jaroslav_Sobon_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3565 (class 2606 OID 16911)
-- Name: t_Jaroslav_Sobon t_Jaroslav_Sobon_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jaroslav_Sobon"
    ADD CONSTRAINT "t_Jaroslav_Sobon_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3566 (class 2606 OID 16916)
-- Name: t_Jaroslav_Sobon t_Jaroslav_Sobon_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jaroslav_Sobon"
    ADD CONSTRAINT "t_Jaroslav_Sobon_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3567 (class 2606 OID 16921)
-- Name: t_Jaroslav_Sobon t_Jaroslav_Sobon_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jaroslav_Sobon"
    ADD CONSTRAINT "t_Jaroslav_Sobon_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3596 (class 2606 OID 17155)
-- Name: t_Jozef_Vlcek t_Jozef_Vlcek_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vlcek"
    ADD CONSTRAINT "t_Jozef_Vlcek_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3597 (class 2606 OID 17160)
-- Name: t_Jozef_Vlcek t_Jozef_Vlcek_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vlcek"
    ADD CONSTRAINT "t_Jozef_Vlcek_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3598 (class 2606 OID 17165)
-- Name: t_Jozef_Vlcek t_Jozef_Vlcek_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vlcek"
    ADD CONSTRAINT "t_Jozef_Vlcek_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3599 (class 2606 OID 17170)
-- Name: t_Jozef_Vlcek t_Jozef_Vlcek_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vlcek"
    ADD CONSTRAINT "t_Jozef_Vlcek_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3600 (class 2606 OID 17186)
-- Name: t_Jozef_Vybostok t_Jozef_Vybostok_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vybostok"
    ADD CONSTRAINT "t_Jozef_Vybostok_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3601 (class 2606 OID 17191)
-- Name: t_Jozef_Vybostok t_Jozef_Vybostok_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vybostok"
    ADD CONSTRAINT "t_Jozef_Vybostok_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3602 (class 2606 OID 17196)
-- Name: t_Jozef_Vybostok t_Jozef_Vybostok_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vybostok"
    ADD CONSTRAINT "t_Jozef_Vybostok_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3603 (class 2606 OID 17201)
-- Name: t_Jozef_Vybostok t_Jozef_Vybostok_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Jozef_Vybostok"
    ADD CONSTRAINT "t_Jozef_Vybostok_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3648 (class 2606 OID 74137)
-- Name: t_Karol_Jancik t_Karol_Jancik_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Karol_Jancik"
    ADD CONSTRAINT "t_Karol_Jancik_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3649 (class 2606 OID 74142)
-- Name: t_Karol_Jancik t_Karol_Jancik_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Karol_Jancik"
    ADD CONSTRAINT "t_Karol_Jancik_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3650 (class 2606 OID 74147)
-- Name: t_Karol_Jancik t_Karol_Jancik_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Karol_Jancik"
    ADD CONSTRAINT "t_Karol_Jancik_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3651 (class 2606 OID 74152)
-- Name: t_Karol_Jancik t_Karol_Jancik_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Karol_Jancik"
    ADD CONSTRAINT "t_Karol_Jancik_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3584 (class 2606 OID 17062)
-- Name: t_Krnac_Martin t_Krnac_Martin_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Krnac_Martin"
    ADD CONSTRAINT "t_Krnac_Martin_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3585 (class 2606 OID 17067)
-- Name: t_Krnac_Martin t_Krnac_Martin_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Krnac_Martin"
    ADD CONSTRAINT "t_Krnac_Martin_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3586 (class 2606 OID 17072)
-- Name: t_Krnac_Martin t_Krnac_Martin_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Krnac_Martin"
    ADD CONSTRAINT "t_Krnac_Martin_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3587 (class 2606 OID 17077)
-- Name: t_Krnac_Martin t_Krnac_Martin_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Krnac_Martin"
    ADD CONSTRAINT "t_Krnac_Martin_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3592 (class 2606 OID 17124)
-- Name: t_Lucia_Smotlakova t_Lucia_Smotlakova_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Lucia_Smotlakova"
    ADD CONSTRAINT "t_Lucia_Smotlakova_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3593 (class 2606 OID 17129)
-- Name: t_Lucia_Smotlakova t_Lucia_Smotlakova_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Lucia_Smotlakova"
    ADD CONSTRAINT "t_Lucia_Smotlakova_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3594 (class 2606 OID 17134)
-- Name: t_Lucia_Smotlakova t_Lucia_Smotlakova_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Lucia_Smotlakova"
    ADD CONSTRAINT "t_Lucia_Smotlakova_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3595 (class 2606 OID 17139)
-- Name: t_Lucia_Smotlakova t_Lucia_Smotlakova_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Lucia_Smotlakova"
    ADD CONSTRAINT "t_Lucia_Smotlakova_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3652 (class 2606 OID 98619)
-- Name: t_Martina_Alaksova t_Martin_Alaksova_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martina_Alaksova"
    ADD CONSTRAINT "t_Martin_Alaksova_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3653 (class 2606 OID 98624)
-- Name: t_Martina_Alaksova t_Martin_Alaksova_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martina_Alaksova"
    ADD CONSTRAINT "t_Martin_Alaksova_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3654 (class 2606 OID 98629)
-- Name: t_Martina_Alaksova t_Martin_Alaksova_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martina_Alaksova"
    ADD CONSTRAINT "t_Martin_Alaksova_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3655 (class 2606 OID 98634)
-- Name: t_Martina_Alaksova t_Martin_Alaksova_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martina_Alaksova"
    ADD CONSTRAINT "t_Martin_Alaksova_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3572 (class 2606 OID 16968)
-- Name: t_Martin_Krnac t_Martin_Krnac_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Krnac"
    ADD CONSTRAINT "t_Martin_Krnac_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3573 (class 2606 OID 16973)
-- Name: t_Martin_Krnac t_Martin_Krnac_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Krnac"
    ADD CONSTRAINT "t_Martin_Krnac_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3574 (class 2606 OID 16978)
-- Name: t_Martin_Krnac t_Martin_Krnac_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Krnac"
    ADD CONSTRAINT "t_Martin_Krnac_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3575 (class 2606 OID 16983)
-- Name: t_Martin_Krnac t_Martin_Krnac_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Krnac"
    ADD CONSTRAINT "t_Martin_Krnac_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3556 (class 2606 OID 16844)
-- Name: t_Martin_Ostrihon t_Martin_Ostrihon_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Ostrihon"
    ADD CONSTRAINT "t_Martin_Ostrihon_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3557 (class 2606 OID 16849)
-- Name: t_Martin_Ostrihon t_Martin_Ostrihon_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Ostrihon"
    ADD CONSTRAINT "t_Martin_Ostrihon_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3558 (class 2606 OID 16854)
-- Name: t_Martin_Ostrihon t_Martin_Ostrihon_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Ostrihon"
    ADD CONSTRAINT "t_Martin_Ostrihon_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3559 (class 2606 OID 16859)
-- Name: t_Martin_Ostrihon t_Martin_Ostrihon_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Ostrihon"
    ADD CONSTRAINT "t_Martin_Ostrihon_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3620 (class 2606 OID 24597)
-- Name: t_Martin_Sipka t_Martin_Sipka_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Sipka"
    ADD CONSTRAINT "t_Martin_Sipka_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3621 (class 2606 OID 24602)
-- Name: t_Martin_Sipka t_Martin_Sipka_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Sipka"
    ADD CONSTRAINT "t_Martin_Sipka_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3622 (class 2606 OID 24607)
-- Name: t_Martin_Sipka t_Martin_Sipka_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Sipka"
    ADD CONSTRAINT "t_Martin_Sipka_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3623 (class 2606 OID 24612)
-- Name: t_Martin_Sipka t_Martin_Sipka_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Martin_Sipka"
    ADD CONSTRAINT "t_Martin_Sipka_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3608 (class 2606 OID 17248)
-- Name: t_Michal_Scepka t_Michal_Scepka_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Scepka"
    ADD CONSTRAINT "t_Michal_Scepka_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3609 (class 2606 OID 17253)
-- Name: t_Michal_Scepka t_Michal_Scepka_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Scepka"
    ADD CONSTRAINT "t_Michal_Scepka_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3610 (class 2606 OID 17258)
-- Name: t_Michal_Scepka t_Michal_Scepka_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Scepka"
    ADD CONSTRAINT "t_Michal_Scepka_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3611 (class 2606 OID 17263)
-- Name: t_Michal_Scepka t_Michal_Scepka_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Scepka"
    ADD CONSTRAINT "t_Michal_Scepka_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3604 (class 2606 OID 17217)
-- Name: t_Michal_Valkovic t_Michal_Valkovic_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Valkovic"
    ADD CONSTRAINT "t_Michal_Valkovic_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3605 (class 2606 OID 17222)
-- Name: t_Michal_Valkovic t_Michal_Valkovic_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Valkovic"
    ADD CONSTRAINT "t_Michal_Valkovic_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3606 (class 2606 OID 17227)
-- Name: t_Michal_Valkovic t_Michal_Valkovic_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Valkovic"
    ADD CONSTRAINT "t_Michal_Valkovic_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3607 (class 2606 OID 17232)
-- Name: t_Michal_Valkovic t_Michal_Valkovic_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Michal_Valkovic"
    ADD CONSTRAINT "t_Michal_Valkovic_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3552 (class 2606 OID 16813)
-- Name: t_Milan_Smotlak t_Milan_Smotlak_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Milan_Smotlak"
    ADD CONSTRAINT "t_Milan_Smotlak_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3553 (class 2606 OID 16818)
-- Name: t_Milan_Smotlak t_Milan_Smotlak_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Milan_Smotlak"
    ADD CONSTRAINT "t_Milan_Smotlak_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3554 (class 2606 OID 16823)
-- Name: t_Milan_Smotlak t_Milan_Smotlak_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Milan_Smotlak"
    ADD CONSTRAINT "t_Milan_Smotlak_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3555 (class 2606 OID 16828)
-- Name: t_Milan_Smotlak t_Milan_Smotlak_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Milan_Smotlak"
    ADD CONSTRAINT "t_Milan_Smotlak_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3612 (class 2606 OID 17279)
-- Name: t_Miroslav_Boloz t_Miroslav_Boloz_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Miroslav_Boloz"
    ADD CONSTRAINT "t_Miroslav_Boloz_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3613 (class 2606 OID 17284)
-- Name: t_Miroslav_Boloz t_Miroslav_Boloz_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Miroslav_Boloz"
    ADD CONSTRAINT "t_Miroslav_Boloz_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3614 (class 2606 OID 17289)
-- Name: t_Miroslav_Boloz t_Miroslav_Boloz_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Miroslav_Boloz"
    ADD CONSTRAINT "t_Miroslav_Boloz_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3615 (class 2606 OID 17294)
-- Name: t_Miroslav_Boloz t_Miroslav_Boloz_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Miroslav_Boloz"
    ADD CONSTRAINT "t_Miroslav_Boloz_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3560 (class 2606 OID 16875)
-- Name: t_Peter_Fabik t_Peter_Fabik_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Peter_Fabik"
    ADD CONSTRAINT "t_Peter_Fabik_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3561 (class 2606 OID 16880)
-- Name: t_Peter_Fabik t_Peter_Fabik_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Peter_Fabik"
    ADD CONSTRAINT "t_Peter_Fabik_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3562 (class 2606 OID 16885)
-- Name: t_Peter_Fabik t_Peter_Fabik_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Peter_Fabik"
    ADD CONSTRAINT "t_Peter_Fabik_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3563 (class 2606 OID 16890)
-- Name: t_Peter_Fabik t_Peter_Fabik_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Peter_Fabik"
    ADD CONSTRAINT "t_Peter_Fabik_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3624 (class 2606 OID 32783)
-- Name: t_Richard_Prcek t_Richard_Prcek_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Richard_Prcek"
    ADD CONSTRAINT "t_Richard_Prcek_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3625 (class 2606 OID 32788)
-- Name: t_Richard_Prcek t_Richard_Prcek_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Richard_Prcek"
    ADD CONSTRAINT "t_Richard_Prcek_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3626 (class 2606 OID 32793)
-- Name: t_Richard_Prcek t_Richard_Prcek_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Richard_Prcek"
    ADD CONSTRAINT "t_Richard_Prcek_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3627 (class 2606 OID 32798)
-- Name: t_Richard_Prcek t_Richard_Prcek_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Richard_Prcek"
    ADD CONSTRAINT "t_Richard_Prcek_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3568 (class 2606 OID 16937)
-- Name: t_Robert_Polak t_Robert_Polak_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Robert_Polak"
    ADD CONSTRAINT "t_Robert_Polak_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3569 (class 2606 OID 16942)
-- Name: t_Robert_Polak t_Robert_Polak_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Robert_Polak"
    ADD CONSTRAINT "t_Robert_Polak_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3570 (class 2606 OID 16947)
-- Name: t_Robert_Polak t_Robert_Polak_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Robert_Polak"
    ADD CONSTRAINT "t_Robert_Polak_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3571 (class 2606 OID 16952)
-- Name: t_Robert_Polak t_Robert_Polak_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Robert_Polak"
    ADD CONSTRAINT "t_Robert_Polak_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3632 (class 2606 OID 49506)
-- Name: t_Roman_Szolik t_Roman_Szolik_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Roman_Szolik"
    ADD CONSTRAINT "t_Roman_Szolik_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3633 (class 2606 OID 49511)
-- Name: t_Roman_Szolik t_Roman_Szolik_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Roman_Szolik"
    ADD CONSTRAINT "t_Roman_Szolik_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3634 (class 2606 OID 49516)
-- Name: t_Roman_Szolik t_Roman_Szolik_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Roman_Szolik"
    ADD CONSTRAINT "t_Roman_Szolik_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3635 (class 2606 OID 49521)
-- Name: t_Roman_Szolik t_Roman_Szolik_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Roman_Szolik"
    ADD CONSTRAINT "t_Roman_Szolik_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


--
-- TOC entry 3576 (class 2606 OID 16999)
-- Name: t_Smotlak_David t_Smotlak_David_CinnostTypID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Smotlak_David"
    ADD CONSTRAINT "t_Smotlak_David_CinnostTypID_fkey" FOREIGN KEY ("CinnostTypID") REFERENCES public."CinnostTyp"("ID");


--
-- TOC entry 3577 (class 2606 OID 17004)
-- Name: t_Smotlak_David t_Smotlak_David_HourTypeID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Smotlak_David"
    ADD CONSTRAINT "t_Smotlak_David_HourTypeID_fkey" FOREIGN KEY ("HourTypeID") REFERENCES public."HourType"("ID");


--
-- TOC entry 3578 (class 2606 OID 17009)
-- Name: t_Smotlak_David t_Smotlak_David_HourTypesID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Smotlak_David"
    ADD CONSTRAINT "t_Smotlak_David_HourTypesID_fkey" FOREIGN KEY ("HourTypesID") REFERENCES public."HourTypes"("ID");


--
-- TOC entry 3579 (class 2606 OID 17014)
-- Name: t_Smotlak_David t_Smotlak_David_ProjectID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."t_Smotlak_David"
    ADD CONSTRAINT "t_Smotlak_David_ProjectID_fkey" FOREIGN KEY ("ProjectID") REFERENCES public."Projects"("ID");


-- Completed on 2025-10-28 15:49:55

--
-- PostgreSQL database dump complete
--

