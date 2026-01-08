-- Part 9 of 10
-- Records: 200

BEGIN;

-- toyota rav4 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'rav4', 2005, 2016, 5, 114.3, 60.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Rav4%20(2005%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota rav4 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'rav4', 2016, 2019, 5, 114.3, 60.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Rav4%20(2015%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota rav4 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'rav4', 2019, NULL, 5, 114.3, 60.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Rav4%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota sequoia (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'sequoia', 2001, 2007, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Sequoia%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota sequoia (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'sequoia', 2008, NULL, 5, 150, 110, '{18,20}', 'https://www.wheelfitment.eu/car/Toyota/Sequoia%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota sienna (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'sienna', 2011, 2020, 5, 114.3, 60.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Sienna%20(2011%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota sienna (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'sienna', 2021, NULL, 5, 114.3, 60.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Sienna%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota starlet (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'starlet', 1984, 1989, 4, 100, 54.1, '{13}', 'https://www.wheelfitment.eu/car/Toyota/Starlet%20(1984%20-%201989).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota starlet (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'starlet', 1990, 1999, 4, 100, 54.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Toyota/Starlet%20(1990%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota supra mk3 (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'supra mk3', 1986, 1993, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Supra%20MK3%20(1986%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota supra mk4 (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'supra mk4', 1992, 2002, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Supra%20MK4%20(1992%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota supra mk5 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'supra mk5', 2019, NULL, 5, 112, 66.5, '{17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Supra%20MK5%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota tacoma (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'tacoma', 1995, 2004, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Tacoma%20(1995%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota tercel (1981)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'tercel', 1981, 1990, 4, 100, 54.1, '{13,14}', 'https://www.wheelfitment.eu/car/Toyota/Tercel%20(1981%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota tercel (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'tercel', 1990, 1999, 4, 100, 54.1, '{13,14}', 'https://www.wheelfitment.eu/car/Toyota/Tercel%20(1990%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota tundra (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'tundra', 1999, 2007, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Tundra%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota tundra (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'tundra', 2008, NULL, 5, 150, 110, NULL, 'https://www.wheelfitment.eu/car/Toyota/Tundra%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota urban cruiser (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'urban cruiser', 2009, NULL, 5, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Urban%20Cruiser%20(2009%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota verso (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'verso', 2009, NULL, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Verso%20(2009%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota verso s (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'verso s', 2010, NULL, 5, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Toyota/Verso%20S%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota voltz (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'voltz', 2002, 2004, 5, 100, 73.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/Voltz%20(2002%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris', 1999, 2005, 4, 100, 54.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20(1999%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris', 2005, 2011, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris', 2011, 2020, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20(2011%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris', 2020, NULL, 5, 100, 54.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris ii 17 inch (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris ii 17 inch', 2005, 2011, 4, 100, 54.1, '{17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20II%2017%20inch%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota yaris verso (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'yaris verso', 1999, 2007, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Yaris%20Verso%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen amarok (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'amarok', 2010, NULL, 5, 120, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Amarok%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen arteon (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'arteon', 2017, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Arteon%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen beetle (1946)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'beetle', 1946, 1969, 5, 205, 161, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Beetle%20(1946%20-%201969).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen beetle (1970)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'beetle', 1970, 1979, 4, 130, 78.6, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Beetle%20(1970%20-%201979).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen bora (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'bora', 1998, 2006, 5, 100, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Bora%20(1998%20-2006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen caddy (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'caddy', 1982, 1992, 4, 100, 57.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Volkswagen/Caddy%20(1982%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen caddy (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'caddy', 1996, 2003, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Caddy%20(1996%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen caddy (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'caddy', 2003, 2020, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Caddy%20(2003%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen caddy (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'caddy', 2020, NULL, 5, 112, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Caddy%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen caddy life (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'caddy life', 2004, 2020, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Caddy%20Life%20(2004%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cc (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cc', 2012, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/CC%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen corrado (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'corrado', 1988, 1996, 4, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Corrado%20(1988%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen corrado vr6 (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'corrado vr6', 1991, 1996, 5, 100, 57.1, '{16}', 'https://www.wheelfitment.eu/car/Volkswagen/Corrado%20VR6%20(1991%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen crafter (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'crafter', 2017, NULL, 5, 120, 65.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Crafter%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross golf (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross golf', 2007, 2009, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Golf%20(2007%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross golf (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross golf', 2010, 2014, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Golf%20(2010%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross polo (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross polo', 2006, 2009, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Polo%20(2006%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross polo (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross polo', 2010, NULL, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Polo%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross touran (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross touran', 2007, NULL, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Touran%20(2007%20-%20.html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen cross up (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'cross up', 2013, NULL, 4, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Cross%20Up%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen e-crafter (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'e-crafter', 2018, NULL, 5, 120, 65.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/e-Crafter%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen e-up (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'e-up', 2013, NULL, 4, 100, 57.1, '{14,15}', 'https://www.wheelfitment.eu/car/Volkswagen/e-Up%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen eos (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'eos', 2006, 2015, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/EOS%20(2006%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen fox (1987)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'fox', 1987, 1993, 4, 100, 57.1, '{13,14}', 'https://www.wheelfitment.eu/car/Volkswagen/Fox%20(1987%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen fox (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'fox', 2005, 2011, 5, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Fox%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 1 (1974)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 1', 1974, 1983, 4, 100, 57.1, '{13,14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%201%20(1974%20-%201983).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 2 (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 2', 1983, 1992, 4, 100, 57.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%202%20(1983%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 3 (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 3', 1991, 1997, 4, 100, 57.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%203%20(1991%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 4 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 4', 1997, 2003, 5, 100, 57.1, '{14,15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%204%20(1997%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 4 r32 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 4 r32', 2002, 2004, 5, 100, 57.1, '{18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%204%20R32%20(2002%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 5 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 5', 2003, 2008, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%205%20(2003%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 5 gti (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 5 gti', 2004, 2008, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%205%20GTI%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 5 plus (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 5 plus', 2005, 2009, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%205%20Plus%20(2005%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 5 r32 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 5 r32', 2005, 2008, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%205%20R32%20(2005%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 6 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 6', 2008, 2012, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%206%20(2008%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 6 plus (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 6 plus', 2009, 2014, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%206%20Plus%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 7 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 7', 2012, 2020, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%207%20(2012%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 7 r (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 7 r', 2013, 2020, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%207%20R%20(2013%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 8 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 8', 2019, NULL, 5, 112, 57.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%208%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 8 gti (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 8 gti', 2020, NULL, 5, 112, 57.1, '{18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%208%20GTI%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf 8 r (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf 8 r', 2020, NULL, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%208%20R%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf sportsvan (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf sportsvan', 2014, 2017, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%20Sportsvan%20(2014%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen golf sportsvan (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'golf sportsvan', 2018, NULL, 5, 112, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Golf%20Sportsvan%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen grand california (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'grand california', 2018, NULL, 5, 120, 65.1, '{16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Grand%20California%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.3 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.3', 2020, NULL, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.3%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.4 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.4', 2020, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.4%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.5 rear (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.5 rear', 2022, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.5%20Achteras%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.5 front (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.5 front', 2022, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.5%20Vooras%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.6 crozz rear (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.6 crozz rear', 2021, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.6%20Crozz%20Achteras%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.6 crozz front (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.6 crozz front', 2021, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.6%20Crozz%20Vooras%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.6 x rear (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.6 x rear', 2021, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.6%20X%20Achteras%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.6 x front (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.6 x front', 2021, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.6%20X%20Vooras%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.7 (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.7', 2023, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.7%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.buzz rear (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.buzz rear', 2022, NULL, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.Buzz%20Achteras%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen id.buzz front (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'id.buzz front', 2022, NULL, 5, 112, 57.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/ID.Buzz%20Vooras%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (1979)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 1979, 1984, 4, 100, 57.1, '{13,14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(1979%20-%201984).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 1985, 1992, 4, 100, 57.1, '{13,14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(1985%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 1992, 1999, 4, 100, 57.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(1992%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 1999, 2005, 5, 100, 57.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(1999%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 2005, 2011, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(2005%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta', 2011, NULL, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20(2011%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen jetta vr6 (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'jetta vr6', 1992, 1999, 5, 100, 57.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Jetta%20VR6%20(1992%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen lt double (1975)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'lt double', 1975, 1996, 6, 205, 161, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/LT%20Double%20(1975%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen lt single (1975)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'lt single', 1975, 1996, 5, 160, 95, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/LT%20Single%20(1975%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen lupo (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'lupo', 1998, 2005, 4, 100, 57.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Volkswagen/Lupo%20(1998%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen lupo gti (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'lupo gti', 2002, 2005, 4, 100, 57.1, '{15,16}', 'https://www.wheelfitment.eu/car/Volkswagen/Lupo%20GTI%20(2002%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen multivan t4 (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'multivan t4', 1992, 1996, 5, 112, 57.1, '{15}', 'https://www.wheelfitment.eu/car/Volkswagen/Multivan%20T4%20(1992%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen multivan t5 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'multivan t5', 2002, 2015, 5, 120, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Multivan%20T5%20(2002%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen multivan t6 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'multivan t6', 2015, 2023, 5, 120, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Multivan%20T6%20(2015%20-%202023).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen multivan t7 (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'multivan t7', 2021, NULL, 5, 120, 65.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Multivan%20T7%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen new beetle (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'new beetle', 2011, NULL, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/New%20Beetle%20(2011%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen new beetle 15 inch (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'new beetle 15 inch', 1998, 2011, 5, 100, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/New%20Beetle%2015%20inch%20(1998%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen new beetle 16 inch (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'new beetle 16 inch', 1998, 2011, 5, 100, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/New%20Beetle%2016%20inch%20(1998%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat 4 bolts (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat 4 bolts', 1983, 1996, 4, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%204%20gaats%20(1983%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat 5 bolts (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat 5 bolts', 1993, 1996, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Passat%205%20gaats%20(1993%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b4 vr6 (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b4 vr6', 1991, 1996, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B4%20VR6%20(1991%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b5 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b5', 1996, 2005, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B5%20(1996%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b6 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b6', 2005, 2010, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B6%20(2005%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b7 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b7', 2010, 2014, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B7%20(2010%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b7 alltrack (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b7 alltrack', 2012, 2015, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B7%20Alltrack%20(2012%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b8 (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b8', 2014, 2024, 5, 112, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B8%20(2014%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b8 alltrack (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b8 alltrack', 2016, 2024, 5, 112, 57.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B8%20Alltrack%20(2016%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat b9 (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat b9', 2024, NULL, 5, 112, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20B9%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat cc (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat cc', 2008, 2012, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20CC%20(2008%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen passat w8 (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'passat w8', 2001, 2005, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Passat%20W8%20(2001%20-2005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen phaeton (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'phaeton', 2002, 2016, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Phaeton%20(2002%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo (1975)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo', 1975, 1981, 4, 100, 57.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%20(1975%20-%201981).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo (1981)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo', 1981, 1994, 4, 100, 57.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%20(1981%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo', 1994, 2001, 4, 100, 57.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%20(1994%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo', 2010, 2017, 5, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo', 2017, NULL, 5, 100, 57.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen polo 9n (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'polo 9n', 2001, 2009, 5, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Polo%209N%20(2001%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen scirocco ii (1981)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'scirocco ii', 1981, 1993, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Scirocco%20II%20(1981%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen scirocco iii (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'scirocco iii', 2008, NULL, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Scirocco%20III%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen scirocco iii r (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'scirocco iii r', 2010, NULL, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Scirocco%20III%20R%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen sharan (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'sharan', 1995, 2010, 5, 112, 57.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/Sharan%20(1995%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen sharan (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'sharan', 2010, NULL, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Sharan%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen t-cross (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 't-cross', 2019, NULL, 5, 100, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/T-Cross%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen t-roc (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 't-roc', 2017, NULL, 5, 112, 57.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Volkswagen/T-Roc%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen taigo (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'taigo', 2021, NULL, 5, 100, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Taigo%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen tiguan (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'tiguan', 2007, 2016, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Tiguan%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen tiguan (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'tiguan', 2016, 2024, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Tiguan%20(2016%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen tiguan (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'tiguan', 2024, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Tiguan%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen tiguan allspace (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'tiguan allspace', 2017, 2024, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Tiguan%20Allspace%20(2017%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touareg (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touareg', 2002, 2010, 5, 130, 71.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touareg%20(2002%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touareg (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touareg', 2010, 2018, 5, 130, 71.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touareg%20(2010%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touareg (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touareg', 2018, NULL, 5, 112, 66.6, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touareg%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touareg vr5 tdi (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touareg vr5 tdi', 2002, 2010, 5, 120, 65.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touareg%20VR5%20TDI%20(2002%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touran (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touran', 2003, 2010, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touran%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touran (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touran', 2010, 2015, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Touran%20(2010%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen touran (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'touran', 2015, NULL, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Touran%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t2 (1967)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t2', 1967, 1979, 5, 112, 66.6, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T2%20(1967%20-%201979).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t3 (1979)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t3', 1979, 1990, 5, 112, 66.6, NULL, 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T3%20(1979%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t4 (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t4', 1990, 1995, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T4%20(1990%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t4 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t4', 1996, 2003, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T4%20(1996%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t5 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t5', 2003, 2015, 5, 120, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T5%20(2003%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen transporter t6 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'transporter t6', 2015, 2024, 5, 120, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volkswagen/Transporter%20T6%20(2015%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen up (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'up', 2011, NULL, 4, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/Up%20(2011%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen vento (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'vento', 1992, 1998, 4, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Vento%20(1992%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen vento vr6 (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'vento vr6', 1995, 1998, 5, 100, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Volkswagen/Vento%20VR6%20(1995%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volkswagen xl1 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volkswagen', 'פולקסווגן', 'xl1', 2015, NULL, 4, 100, 57.1, '{16,17}', 'https://www.wheelfitment.eu/car/Volkswagen/XL1%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 140 (1966)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '140', 1966, 1974, 5, 108, 65.1, NULL, 'https://www.wheelfitment.eu/car/Volvo/140%20(1966%20-%201974).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 164 (1968)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '164', 1968, 1975, 5, 108, 65.1, '{15,16}', 'https://www.wheelfitment.eu/car/Volvo/164%20(1968%20-%201975).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 240 serie (1974)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '240 serie', 1974, 1993, 5, 108, 65.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/240%20Serie%20(1974%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 260 serie (1974)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '260 serie', 1974, 1982, 5, 108, 65.1, '{15,16}', 'https://www.wheelfitment.eu/car/Volvo/260%20Serie%20(1974%20-%201982).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 340 (1976)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '340', 1976, 1991, 4, 100, 52.1, '{13,14}', 'https://www.wheelfitment.eu/car/Volvo/340%20(1976%20-%201991).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 360 (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '360', 1983, 1991, 4, 100, 52.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Volvo/360%20(1983%20-%201991).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 440 (1987)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '440', 1987, 1997, 4, 100, 52.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/440%20(1987%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 460 (1987)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '460', 1987, 1997, 4, 100, 52.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/460%20(1987%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 480 (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '480', 1986, 1995, 4, 100, 52.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/480%20(1986%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 740 (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '740', 1984, 1992, 5, 108, 65.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/740%20(1984%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 745 (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '745', 1984, 1992, 5, 108, 65.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/745%20(1984%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 850 (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '850', 1991, 1993, 4, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/850%20(1991%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 850 (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '850', 1993, 1997, 5, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/850%20(1993%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 940 (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '940', 1990, 1998, 5, 108, 65.1, NULL, 'https://www.wheelfitment.eu/car/Volvo/940%20(1990%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 960 (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '960', 1990, 1994, 5, 108, 65.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/960%20(1990%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo 960 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', '960', 1994, 1997, 5, 108, 65.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/960%20(1994%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo amazon (1956)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'amazon', 1956, 1970, 5, 114.3, 70.6, NULL, 'https://www.wheelfitment.eu/car/Volvo/Amazon%20(1956%20-%201970).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo c30 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'c30', 2006, 2014, 5, 108, 63.4, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/C30%20(2006%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo c40 (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'c40', 2021, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/C40%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo c70 (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'c70', 1998, 2006, 5, 108, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/C70%20(1998%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo c70 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'c70', 2006, NULL, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/C70%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ec40 (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ec40', 2024, NULL, 5, 108, 63.4, '{19,20}', 'https://www.wheelfitment.eu/car/Volvo/EC40%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ex30 (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ex30', 2023, NULL, 5, 108, 63.4, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/EX30%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ex40 rear (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ex40 rear', 2024, NULL, 5, 108, 63.4, '{19,20}', 'https://www.wheelfitment.eu/car/Volvo/EX40%20Achteras%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ex40 front (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ex40 front', 2024, NULL, 5, 108, 63.4, '{19,20}', 'https://www.wheelfitment.eu/car/Volvo/EX40%20Vooras%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ex90 rear (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ex90 rear', 2023, NULL, 5, 108, 63.4, '{20}', 'https://www.wheelfitment.eu/car/Volvo/EX90%20Achteras%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo ex90 front (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'ex90 front', 2023, NULL, 5, 108, 63.4, '{20}', 'https://www.wheelfitment.eu/car/Volvo/EX90%20Vooras%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s40 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's40', 1996, 2004, 4, 114.3, 67.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volvo/S40%20(1996%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s40 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's40', 2004, 2012, 5, 108, 63.4, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S40%20(2004%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s60 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's60', 2000, 2010, 5, 108, 65.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S60%20(2000%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s60 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's60', 2010, 2018, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S60%20(2010%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s60 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's60', 2019, NULL, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S60%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s60r (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's60r', 2003, 2010, 5, 108, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S60R%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s70 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's70', 1997, 2000, 5, 108, 65.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volvo/S70%20(1997%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s80 (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's80', 1998, 2006, 5, 108, 65.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S80%20(1998%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s80 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's80', 2006, NULL, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S80%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s90 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's90', 1994, 1998, 5, 108, 65.1, NULL, 'https://www.wheelfitment.eu/car/Volvo/S90%20(1994%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo s90 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 's90', 2016, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/S90%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v40 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v40', 1996, 2005, 4, 114.3, 67.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volvo/V40%20(1996%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v40 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v40', 2012, 2021, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V40%20(2012%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v40 cross country (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v40 cross country', 2012, 2021, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V40%20Cross%20Country%20(2012%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v50 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v50', 2004, 2012, 5, 108, 63.4, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V50%20(2004%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v60 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v60', 2010, 2018, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V60%20(2010%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v60 (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v60', 2018, NULL, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V60%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v60 cross country (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v60 cross country', 2015, 2018, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V60%20Cross%20Country%20(2015%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v60 polestar (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v60 polestar', 2014, 2018, 5, 108, 63.4, '{19,20}', 'https://www.wheelfitment.eu/car/Volvo/V60%20Polestar%20(2014%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v70 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v70', 1997, 2000, 5, 108, 65.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Volvo/V70%20(1997%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v70 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v70', 2000, 2007, 5, 108, 65.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V70%20(2000%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v70 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v70', 2007, 2017, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V70%20(2007%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v70r (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v70r', 2003, 2007, 5, 108, 65.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V70R%20(2003%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v90 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v90', 1996, 1998, 5, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Volvo/V90%20(1996%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo v90 (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v90', 2016, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V90%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

COMMIT;
