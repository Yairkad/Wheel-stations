-- Part 1 of 10
-- Records: 200

BEGIN;

-- ON vehicle_models (make, model, year_from) WHERE year_from IS NOT NULL;
-- byd atto 3 (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'atto 3', 2021, NULL, 5, 114.3, 60.1, '{18}', 'https://www.wheelfitment.eu/car/BYD/Atto%203%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd dolphin (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'dolphin', 2021, NULL, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/BYD/Dolphin%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd dolphin plus (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'dolphin plus', 2023, NULL, 5, 114.3, 60.1, '{17}', 'https://www.wheelfitment.eu/car/BYD/Dolphin%20Plus%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd etp3 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'etp3', 2014, NULL, 5, 120, 64.1, '{15,16}', 'https://www.wheelfitment.eu/car/BYD/Etp3%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd han (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'han', 2022, NULL, 5, 120, 64.1, '{19,20}', 'https://www.wheelfitment.eu/car/BYD/Han%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd m3 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'm3', 2014, NULL, 5, 120, 64.1, '{15,16}', 'https://www.wheelfitment.eu/car/BYD/M3%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd seal (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'seal', 2022, NULL, 5, 120, 64.1, '{19,20}', 'https://www.wheelfitment.eu/car/BYD/Seal%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd t3 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 't3', 2014, NULL, 5, 120, 64.1, '{15,16}', 'https://www.wheelfitment.eu/car/BYD/T3%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- byd tang (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('byd', 'בי.ווי.די', 'tang', 2021, NULL, 5, 120, 64.1, '{20}', 'https://www.wheelfitment.eu/car/BYD/Tang%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi 100 (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', '100', 1982, 1990, 4, 108, 57.1, '{14,16,17,18}', 'https://www.wheelfitment.eu/car/Audi/100%20(1982%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi 100 (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', '100', 1990, 1994, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/100%20(1990%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi 80 (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', '80', 1986, 1996, 4, 108, 57.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/80%20(1986%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a1 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a1', 2010, 2018, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Audi/A1%20(2010%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a1 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a1', 2018, NULL, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Audi/A1%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a1 citycarver (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a1 citycarver', 2019, 2022, 5, 100, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Audi/A1%20Citycarver%20(2019%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a2 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a2', 1999, 2006, 5, 100, 57.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Audi/A2%20(1999%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a2 1.2 tdi (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a2 1.2 tdi', 2000, 2006, 4, 100, 57.1, '{14}', 'https://www.wheelfitment.eu/car/Audi/A2%201.2%20TDI%20(2000%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a3 8l (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a3 8l', 1996, 2003, 5, 100, 57.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/A3%208L%20(1996%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a3 8p (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a3 8p', 2003, 2012, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A3%208P%20(2003%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a3 8v (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a3 8v', 2012, 2020, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A3%208V%20(2012%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a3 8y (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a3 8y', 2020, NULL, 5, 112, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/A3%208Y%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4', 2019, NULL, 5, 112, 66.5, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/A4%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 allroad b8 (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 allroad b8', 2009, 2015, 5, 112, 66.5, '{17,18,19}', 'https://www.wheelfitment.eu/car/Audi/A4%20Allroad%20B8%20(2009%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 b5 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 b5', 1994, 2000, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A4%20B5%20(1994%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 b6 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 b6', 2000, 2004, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A4%20B6%20(2000%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 b7 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 b7', 2004, 2008, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A4%20B7%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 b8 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 b8', 2007, 2015, 5, 112, 66.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A4%20B8%20(2007%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 b9 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 b9', 2015, 2019, 5, 112, 66.5, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/A4%20B9%20(2015%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a4 convertible 8h (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a4 convertible 8h', 2002, 2009, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A4%20Cabriolet%208H%20(2002%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a5 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a5', 2007, 2016, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A5%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a5 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a5', 2016, NULL, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A5%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a5 sportback (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a5 sportback', 2009, 2016, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A5%20Sportback%20(2009%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 1994, 1997, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A6%20(1994%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 1997, 1999, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A6%20(1997%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 1999, 2004, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A6%20(1999%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 2004, 2011, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A6%20(2004%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 2011, 2014, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/A6%20(2011%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6', 2014, 2018, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A6%20(2014%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a6 c8 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a6 c8', 2018, NULL, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A6%20C8%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a7 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a7', 2018, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/A7%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a7 4g (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a7 4g', 2010, 2017, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/A7%204G%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a8 4e (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a8 4e', 2002, 2010, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A8%204E%20(2002%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a8 4h (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a8 4h', 2010, 2018, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/A8%204H%20(2010%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a8 d2 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a8 d2', 1994, 2002, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/A8%20D2%20(1994%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi a8 d5 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'a8 d5', 2018, NULL, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/A8%20D5%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi all-road (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'all-road', 2000, 2006, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/All-Road%20(2000%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi all-road (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'all-road', 2006, 2012, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/All-Road%20(2006%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi allroad (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'allroad', 2012, 2016, 5, 112, 66.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Allroad%20(2012%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi convertible (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'convertible', 1991, 2000, 4, 108, 57.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/Cabriolet%20(1991%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi coupe (1980)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'coupe', 1980, 1988, 4, 108, 57.1, '{14,15}', 'https://www.wheelfitment.eu/car/Audi/Coupe%20(1980%20-%201988).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi coupe (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'coupe', 1989, 1996, 4, 108, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Audi/Coupe%20(1989%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi e-tron (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'e-tron', 2018, 2023, 5, 112, 66.6, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/E-Tron%20(2018%20-%202023).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q2 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q2', 2016, 2021, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q2%20(2016%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q3 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q3', 2011, 2018, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q3%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q3 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q3', 2018, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q3%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q3 rs (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q3 rs', 2013, 2018, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q3%20RS%20(2013%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q3 rs (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q3 rs', 2019, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/Q3%20RS%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q4 e-tron (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q4 e-tron', 2021, NULL, 5, 112, 57.1, '{20}', 'https://www.wheelfitment.eu/car/Audi/Q4%20E-TRON%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q5 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q5', 2008, 2016, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q5%20(2008%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q5 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q5', 2017, NULL, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q5%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q7 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q7', 2005, 2015, 5, 130, 71.6, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q7%20(2005%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q7 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q7', 2015, NULL, 5, 112, 66.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/Q7%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q7 v12tdi (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q7 v12tdi', 2008, 2012, 5, 130, 71.5, '{20}', 'https://www.wheelfitment.eu/car/Audi/Q7%20V12TDI%20(2008%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi q8 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'q8', 2018, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/Q8%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi r8 rear (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'r8 rear', 2007, 2015, 5, 112, 57.1, '{18,19}', 'https://www.wheelfitment.eu/car/Audi/R8%20Achteras%20(2007%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi r8 rear (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'r8 rear', 2016, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/R8%20Achteras%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi r8 front (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'r8 front', 2007, 2015, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/R8%20Vooras%20(2007%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi r8 front (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'r8 front', 2016, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/R8%20Vooras%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs q3 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs q3', 2019, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS%20Q3%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs q8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs q8', 2019, NULL, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/RS%20Q8%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs2 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs2', 1994, 1996, 5, 130, 72.6, NULL, 'https://www.wheelfitment.eu/car/Audi/RS2%20(1994%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs3 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs3', 2011, 2015, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/RS3%20(2011%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs3 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs3', 2015, 2020, 5, 112, 57.1, '{19}', 'https://www.wheelfitment.eu/car/Audi/RS3%20(2015%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs4 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs4', 2000, 2001, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/RS4%20(2000%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs4 b8 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs4 b8', 2012, 2016, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS4%20B8%20(2012%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs4 b9 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs4 b9', 2017, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS4%20B9%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs4 qb6 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs4 qb6', 2006, 2008, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/RS4%20QB6%20(2006%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs5 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs5', 2010, 2016, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS5%20(2010%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs5 f5 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs5 f5', 2017, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS5%20F5%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs6 c5 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs6 c5', 2002, 2004, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/RS6%20C5%20(2002%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs6 c6 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs6 c6', 2008, 2010, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/RS6%20C6%20(2008%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs6 c7 (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs6 c7', 2013, 2018, 5, 112, 66.5, '{20}', 'https://www.wheelfitment.eu/car/Audi/RS6%20C7%20(2013%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs6 c8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs6 c8', 2019, NULL, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/RS6%20C8%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs7 sportback (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs7 sportback', 2013, 2018, 5, 112, 66.5, '{20}', 'https://www.wheelfitment.eu/car/Audi/RS7%20Sportback%20(2013%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi rs7 sportback (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'rs7 sportback', 2019, NULL, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/RS7%20Sportback%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s1 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's1', 2014, 2018, 5, 100, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/S1%20(2014%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s1 sportback (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's1 sportback', 2014, 2018, 5, 100, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/S1%20Sportback%20(2014%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s2 (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's2', 1990, 1995, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S2%20(1990%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s3 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's3', 1999, 2003, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S3%20(1999%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s3 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's3', 2006, 2012, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S3%20(2006%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s3 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's3', 2012, 2020, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S3%20(2012%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s3 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's3', 2020, NULL, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S3%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s4 (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's4', 1991, 1994, 5, 112, 57.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Audi/S4%20(1991%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s4 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's4', 1997, 2001, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S4%20(1997%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s4 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's4', 2003, 2009, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S4%20(2003%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s4 (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's4', 2009, 2015, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/Audi/S4%20(2009%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s4 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's4', 2016, NULL, 5, 112, 66.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S4%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s5 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's5', 2007, 2016, 5, 112, 66.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S5%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s5 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's5', 2017, NULL, 5, 112, 66.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S5%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s6 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's6', 1994, 1997, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S6%20(1994%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s6 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's6', 1999, 2004, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/S6%20(1999%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s6 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's6', 2006, 2011, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S6%20(2006%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s6 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's6', 2011, 2018, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S6%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s6 c8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's6 c8', 2019, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S6%20C8%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s7 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's7', 2011, 2018, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S7%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s7 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's7', 2019, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S7%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s8 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's8', 1996, 2002, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S8%20(1996%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's8', 2019, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S8%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s8 4e (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's8 4e', 2006, 2010, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/S8%204E%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi s8 4h (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 's8 4h', 2011, 2018, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/S8%204H%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi sq2 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'sq2', 2019, NULL, 5, 112, 57.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Audi/SQ2%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi sq5 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'sq5', 2012, 2017, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/SQ5%20(2012%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi sq5 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'sq5', 2017, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/SQ5%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi sq7 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'sq7', 2016, NULL, 5, 112, 66.5, '{20}', 'https://www.wheelfitment.eu/car/Audi/SQ7%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi sq8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'sq8', 2019, NULL, 5, 112, 66.5, '{20}', 'https://www.wheelfitment.eu/car/Audi/SQ8%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt', 2014, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Audi/TT%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt 8j (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt 8j', 2007, 2014, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/TT%208J%20(2007%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt 8n (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt 8n', 2003, 2007, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/TT%208N%20(2003%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt convertible 1.8t (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt convertible 1.8t', 1999, 2007, 5, 100, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/TT%20cabriolet%201.8T%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt coupe 1.8t (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt coupe 1.8t', 1998, 2006, 5, 100, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Audi/TT%20coupe%201.8T%20(1998%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt rs (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt rs', 2009, 2014, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Audi/TT%20RS%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi tt rs (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'tt rs', 2014, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Audi/TT%20RS%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- audi ur-quattro (1980)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('audi', 'אאודי', 'ur-quattro', 1980, 1991, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Audi/Ur-Quattro%20(1980%20-%201991).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie e81 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie e81', 2007, 2011, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20E81%20(2007%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie e82 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie e82', 2007, 2013, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20E82%20(2007%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie e87 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie e87', 2004, 2011, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20E87%20(2004%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie e88 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie e88', 2007, 2013, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20E88%20(2007%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie f20 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie f20', 2011, 2019, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20F20%20(2011%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie f21 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie f21', 2012, 2019, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20F21%20(2012%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie m e87 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie m e87', 2011, 2018, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20M%20E87%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 1 serie sedan f52 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '1 serie sedan f52', 2017, NULL, 5, 112, 66.6, '{17,18}', 'https://www.wheelfitment.eu/car/BMW/1%20Serie%20Sedan%20F52%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie active tourer f45 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie active tourer f45', 2014, 2022, 5, 112, 66.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20Active%20Tourer%20F45%20(2014%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie active tourer u06 (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie active tourer u06', 2022, NULL, 5, 112, 66.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20Active%20Tourer%20U06%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie convertible f22 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie convertible f22', 2014, 2021, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20Cabriolet%20F22%20(2014%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie coupe f22 (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie coupe f22', 2013, 2021, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20Coupe%20F22%20(2013%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie f44 (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie f44', 2021, NULL, 5, 112, 66.6, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20F44%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2 serie gran tourer f46 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2 serie gran tourer f46', 2015, 2023, 5, 112, 66.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/2%20Serie%20Gran%20Tourer%20F46%20(2015%20-%202023).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 2000c-cs-ca (1962)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '2000c-cs-ca', 1962, 1972, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/BMW/2000C-CS-CA%20(1962%20-%201972)%20.html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e21 (1975)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e21', 1975, 1982, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E21%20(1975%20-%201982)%20.html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e30 (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e30', 1982, 1990, 4, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E30%20(1982%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e36 4 equal rims (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e36 4 equal rims', 1990, 1999, 5, 120, 72.5, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E36%204%20dezelfde%20velgen%20(1990%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e46 4 equal rims (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e46 4 equal rims', 1998, 2005, 5, 120, 72.5, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E46%204%20dezelfde%20velgen%20(1998%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e90 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e90', 2005, 2011, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E90%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e91 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e91', 2005, 2011, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E91%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e92 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e92', 2006, 2011, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E92%20(2007%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie e93 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie e93', 2007, 2011, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20E93%20(2007%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie f30 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie f30', 2012, 2019, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20F30%20(2012%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie f31 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie f31', 2012, 2019, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20F31%20(2012%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie g20-g21 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie g20-g21', 2019, NULL, 5, 112, 66.6, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20G20-G21%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 3 serie gran turismo f34 (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '3 serie gran turismo f34', 2013, 2019, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/3%20Serie%20Gran%20Turismo%20F34%20(2013%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 4 serie convertible f33 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '4 serie convertible f33', 2014, 2020, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/4%20Serie%20Cabriolet%20F33%20(2014%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 4 serie coupe f32 (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '4 serie coupe f32', 2013, 2020, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/4%20Serie%20Coupe%20F32%20(2013%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 4 serie g22-g23-g26 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '4 serie g22-g23-g26', 2020, NULL, 5, 112, 66.6, '{17,18,19}', 'https://www.wheelfitment.eu/car/BMW/4%20Serie%20G22-G23-G26%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 4 serie gran coupe f36 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '4 serie gran coupe f36', 2014, 2020, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/4%20Serie%20Gran%20Coupe%20F36%20(2014%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e12 (1972)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e12', 1972, 1981, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E12%20(1972%20-%201981).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e28 (1981)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e28', 1981, 1988, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E28%20(1981%20-%201988).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e34 (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e34', 1988, 1995, 5, 120, 72.5, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E34%20(1988%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e39 (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e39', 1995, 2003, 5, 120, 74.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E39%20(1995%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e60 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e60', 2003, 2010, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E60%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie e61 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie e61', 2004, 2010, 5, 120, 72.5, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20E61%20(2004%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie f10 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie f10', 2010, 2017, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20F10%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie f11 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie f11', 2010, 2017, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20F11%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie g30-g31 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie g30-g31', 2017, 2024, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20G30-G31%20(2017%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 5 serie gt f07 (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '5 serie gt f07', 2009, 2017, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/5%20Serie%20GT%20F07%20(2009%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie e24 (1976)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie e24', 1976, 1989, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20E24%20(1976%20-%201989).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie e63 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie e63', 2003, 2010, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20E63%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie e64 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie e64', 2003, 2010, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20E64%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie f12 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie f12', 2011, 2018, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20F12%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie f13 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie f13', 2011, 2018, 5, 120, 72.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20F13%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie f14 gran coupe (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie f14 gran coupe', 2012, 2020, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20F14%20Gran%20Coupe%20(2012%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 6 serie g32 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '6 serie g32', 2018, 2023, 5, 112, 66.5, NULL, 'https://www.wheelfitment.eu/car/BMW/6%20Serie%20G32%20(2018%20-%202023).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie e23 (1977)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie e23', 1977, 1986, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20E23%20(1977%20-%201986).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie e32 (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie e32', 1986, 1994, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20E32%20(1986%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie e38 (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie e38', 1995, 2001, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20E38%20(1995%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie e65 (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie e65', 2001, 2008, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20E65%20(2001%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie f01 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie f01', 2008, 2015, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20F01%20(2008%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie g11 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie g11', 2015, 2022, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20G11%20(2015%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie g12 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie g12', 2015, 2022, 5, 112, 66.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20G12%20(2015%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 7 serie g70 (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '7 serie g70', 2022, NULL, 5, 112, 66.6, '{19,20}', 'https://www.wheelfitment.eu/car/BMW/7%20Serie%20G70%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 8 serie e31 (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '8 serie e31', 1989, 1999, 5, 120, 72.5, '{17,18}', 'https://www.wheelfitment.eu/car/BMW/8%20Serie%20E31%20(1989%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw 8 serie g15 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', '8 serie g15', 2018, NULL, 5, 112, 66.6, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/8%20Serie%20G15%20(%202018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw i3 (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'i3', 2013, NULL, 5, 112, 66.5, '{19,20}', 'https://www.wheelfitment.eu/car/BMW/i3%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw i4 (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'i4', 2021, NULL, 5, 112, 66.6, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/i4%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw i5 (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'i5', 2023, NULL, 5, 112, 66.6, '{20}', 'https://www.wheelfitment.eu/car/BMW/I5%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw i7 (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'i7', 2022, NULL, 5, 112, 66.6, '{19,20}', 'https://www.wheelfitment.eu/car/BMW/i7%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw i8 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'i8', 2014, NULL, 5, 112, 66.5, '{20}', 'https://www.wheelfitment.eu/car/BMW/i8%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw ix (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'ix', 2021, NULL, 5, 112, 66.6, '{20}', 'https://www.wheelfitment.eu/car/BMW/iX%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw ix1 (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'ix1', 2022, NULL, 5, 112, 66.6, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/BMW/iX1%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw ix3 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'ix3', 2020, NULL, 5, 112, 66.6, '{19,20}', 'https://www.wheelfitment.eu/car/BMW/iX3%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m1 (1979)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm1', 1979, 1981, 5, 120, 72.5, '{16,19}', 'https://www.wheelfitment.eu/car/BMW/M1%20(1979%20-%201981).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m2 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm2', 2016, NULL, 5, 120, 72.6, '{19,20}', 'https://www.wheelfitment.eu/car/BMW/M2%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 e36 (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 e36', 1992, 1999, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M3%20E36%20(1992%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 e46 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 e46', 2000, 2008, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M3%20E46%20(2000%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 e90 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 e90', 2008, 2013, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M3%20E90%20(2008%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 e92 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 e92', 2007, 2013, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M3%20E92%20(2007%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 e93 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 e93', 2008, 2013, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M3%20E93%20(2008%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m3 f80 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm3 f80', 2014, 2018, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/M3%20F80%20(2014%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m4 f82 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm4 f82', 2014, NULL, 5, 120, 72.5, '{18,19,20}', 'https://www.wheelfitment.eu/car/BMW/M4%20F82%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m5 e34 (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm5 e34', 1988, 1995, 5, 120, 72.5, NULL, 'https://www.wheelfitment.eu/car/BMW/M5%20E34%20(1988%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- bmw m5 e39 (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('bmw', 'ב.מ.וו', 'm5 e39', 1998, 2003, 5, 120, 74.1, NULL, 'https://www.wheelfitment.eu/car/BMW/M5%20E39%20(1998%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

COMMIT;
