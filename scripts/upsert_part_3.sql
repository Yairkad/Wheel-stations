-- Part 3 of 10
-- Records: 200

BEGIN;

-- citroen c8 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'c8', 2002, 2014, 5, 98, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/C8%20(2002%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen cx (1974)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'cx', 1974, 1985, 5, 98, 58.1, '{14}', 'https://www.wheelfitment.eu/car/Citroen/CX%20(1974%20-%201985).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen cx (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'cx', 1985, 1992, 5, 98, 58.1, '{14}', 'https://www.wheelfitment.eu/car/Citroen/CX%20(1985%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen ds3 (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'ds3', 2010, 2016, 4, 108, 65.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Citroen/DS3%20(2010%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen ds4 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'ds4', 2011, 2018, 4, 108, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Citroen/DS4%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen ds5 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'ds5', 2012, 2018, 4, 108, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Citroen/DS5%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen e-berlingo (211)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'e-berlingo', 211, NULL, 5, 108, 65.1, '{16,17}', 'https://www.wheelfitment.eu/car/Citroen/E-Berlingo%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen evasion (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'evasion', 1994, 2002, 5, 98, 58.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/Evasion%20(1994%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen gs-gsa (1970)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'gs-gsa', 1970, 1986, 3, 160, NULL, NULL, 'https://www.wheelfitment.eu/car/Citroen/GS-GSA%20(1970%20-%201986).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper', 1994, 2006, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper', 2006, 2010, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper', 2010, NULL, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper maxi (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper maxi', 1994, 2006, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20Maxi%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper maxi (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper maxi', 2006, 2010, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20Maxi%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumper maxi (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumper maxi', 2010, NULL, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Jumper%20Maxi%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumpy (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumpy', 1996, 2006, 5, 98, 58.1, '{14}', 'https://www.wheelfitment.eu/car/Citroen/Jumpy%20(1996%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen jumpy (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'jumpy', 2006, NULL, 5, 108, 65.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Citroen/Jumpy%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen nemo (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'nemo', 2008, NULL, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/Nemo%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay', 1994, 2006, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay', 2006, 2010, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay', 2010, 2017, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay maxi (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay maxi', 1994, 2006, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20Maxi%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay maxi (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay maxi', 2006, 2010, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20Maxi%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen relay maxi (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'relay maxi', 2010, 2017, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Citroen/Relay%20Maxi%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen saxo (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'saxo', 1996, 2003, 4, 108, 65.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Citroen/Saxo%20(1996%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen xantia (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'xantia', 1993, 2001, 4, 108, 65.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/Xantia%20(1993%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen xm (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'xm', 1989, 2001, 5, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/XM%20(1989%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen xsara (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'xsara', 1997, 2004, 4, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/Xsara%20(1997%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen xsara picasso (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'xsara picasso', 1999, 2010, 4, 108, 65.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Citroen/Xsara%20Picasso%20(1999%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- citroen zx (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('citroen', 'סיטרואן', 'zx', 1991, 1997, 4, 108, 65.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Citroen/ZX%20(1991%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge avenger (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'avenger', 2007, 2014, 5, 114.3, 67.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Avenger%20(2007%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge caliber (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'caliber', 2006, 2011, 5, 114.3, 67.1, NULL, 'https://www.wheelfitment.eu/car/Dodge/Caliber%20(2006%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge caravan (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'caravan', 2001, 2007, 5, 114.3, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Caravan%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge caravan (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'caravan', 2007, NULL, 5, 114.3, 71.6, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Caravan%20(2007%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge challenger (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'challenger', 2008, NULL, 5, 115, 71.6, '{18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Challenger%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge charger (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'charger', 2006, NULL, 5, 115, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Charger%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge dakota (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'dakota', 1997, 2004, 6, 114.3, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Dakota%20(1997%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge dakota (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'dakota', 2004, NULL, 5, 139.7, 78.1, NULL, 'https://www.wheelfitment.eu/car/Dodge/Dakota%20(2004%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge dart (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'dart', 2012, 2018, 5, 110, 65.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Dart%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge durango (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'durango', 1998, 2004, 6, 114.3, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Durango%20(1998%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge durango (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'durango', 2004, 2008, 5, 139.7, 78.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Dodge/Durango%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge durango (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'durango', 2011, NULL, 5, 127, 71.5, '{18,20}', 'https://www.wheelfitment.eu/car/Dodge/Durango%20(2011%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge grand caravan (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'grand caravan', 2001, 2007, 5, 114.3, 71.6, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Dodge/Grand%20Caravan%20(2001-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge grand caravan (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'grand caravan', 2008, 2022, 5, 127, 71.6, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Grand%20Caravan%20(2008-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge journey (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'journey', 2008, 2011, 5, 127, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Journey%20(2008%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge magnum (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'magnum', 2004, 2008, 5, 115, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Magnum%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge magnum 4x4 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'magnum 4x4', 2004, 2008, 5, 115, 71.6, NULL, 'https://www.wheelfitment.eu/car/Dodge/Magnum%204x4%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge neon (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'neon', 2000, 2005, 5, 100, 57.1, '{14,15,16}', 'https://www.wheelfitment.eu/car/Dodge/Neon%20(2000%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge neon srt4 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'neon srt4', 2003, 2005, 5, 100, 57.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Dodge/Neon%20SRT4%20(2003%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge nitro (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'nitro', 2007, 2012, 5, 114.3, 71.6, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/Nitro%20(2007%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge pickup (1971)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'pickup', 1971, 1993, 8, 165.1, 117, NULL, 'https://www.wheelfitment.eu/car/Dodge/Pickup%20(1971%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ram 1500 (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ram 1500', 1993, 2001, 5, 139.7, 77.8, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Dodge/RAM%201500%20(1993%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ram 1500 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ram 1500', 2002, 2008, 5, 139.7, 77.8, '{17,18}', 'https://www.wheelfitment.eu/car/Dodge/RAM%201500%20(2002%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ram 1500 (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ram 1500', 2009, 2012, 5, 139.7, 78.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Dodge/Ram%201500%20(2009%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ram 1500 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ram 1500', 2012, 2018, 5, 139.7, 78.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Dodge/Ram%201500%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ram 1500 (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ram 1500', 2019, NULL, 6, 139.7, 77.8, '{18}', 'https://www.wheelfitment.eu/car/Dodge/RAM%201500%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge ramcharger (1979)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'ramcharger', 1979, 1983, 5, 139.7, 77.8, NULL, 'https://www.wheelfitment.eu/car/Dodge/Ramcharger%20(1979%20-%201983).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- dodge stratus (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('dodge', 'דודג''', 'stratus', 1995, 2000, 5, 110, 57.1, NULL, 'https://www.wheelfitment.eu/car/Dodge/Stratus%20(1995%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 124 spider (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '124 spider', 2015, NULL, 4, 100, 54.1, '{16,17}', 'https://www.wheelfitment.eu/car/Fiat/124%20Spider%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500 (1957)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500', 1957, 1976, 4, 98, 150, NULL, 'https://www.wheelfitment.eu/car/Fiat/500%20(1957%20-%201976).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500', 2007, NULL, 4, 98, 58.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/500%20(2007%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500e (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500e', 2013, 2019, 4, 98, 58.1, '{15,16}', 'https://www.wheelfitment.eu/car/Fiat/500e%20(2013%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500e (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500e', 2020, NULL, 4, 98, 58.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/500e%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500l (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500l', 2012, NULL, 5, 98, 58.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/500L%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500l trekking (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500l trekking', 2013, NULL, 5, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/500L%20Trekking%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 500x (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '500x', 2014, NULL, 5, 110, 65.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/500X%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 600 (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '600', 2023, NULL, 4, 108, 65.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/600%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat 600e (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', '600e', 2023, NULL, 4, 108, 65.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/600E%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat albea (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'albea', 2002, 2012, 4, 98, 58.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Albea%20(2002%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat barchetta (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'barchetta', 1995, 2005, 4, 98, 58.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Barchetta%20(1995%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat brava (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'brava', 1995, 2001, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Brava%20(1995%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat bravo (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'bravo', 1995, 2001, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Bravo%20(1995%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat bravo (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'bravo', 2007, NULL, 4, 98, 58.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Bravo%20(2007%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat cinquecento (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'cinquecento', 1991, 1998, 4, 98, 58.1, '{14}', 'https://www.wheelfitment.eu/car/Fiat/Cinquecento%20(1991%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat coupe (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'coupe', 1993, 2000, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Coupe%20(1993%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat coupe turbo (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'coupe turbo', 1993, 2000, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Coupe%20Turbo%20(1993%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat croma (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'croma', 1985, 1996, 4, 98, 58.1, '{14,15,16}', 'https://www.wheelfitment.eu/car/Fiat/Croma%20(1985%20-%2019967).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat croma (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'croma', 2005, 2007, 5, 110, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Croma%20(2005%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat croma (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'croma', 2007, 2011, 5, 110, 65.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Croma%20(2007%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat doblo (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'doblo', 2001, 2005, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Doblo%20(2001%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat doblo (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'doblo', 2005, 2010, 4, 98, 58.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Doblo%20(2005%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat doblo (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'doblo', 2010, 2022, 5, 98, 58.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Doblo%20(2010%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat doblo (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'doblo', 2022, NULL, 5, 98, 58.1, '{16}', 'https://www.wheelfitment.eu/car/Fiat/Doblo%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat doblo maxi (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'doblo maxi', 2010, 2022, 5, 98, 58.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Doblo%20Maxi%20(2010%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato', 1982, 1990, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20(1982%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato', 1989, 1994, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20(1989%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato', 1994, 2006, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato', 2006, 2010, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato', 2010, NULL, 5, 118, 71.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato maxi (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato maxi', 1994, 2006, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20Maxi%20(1994%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato maxi (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato maxi', 2006, 2010, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20Maxi%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ducato maxi (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ducato maxi', 2010, NULL, 5, 130, 78.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ducato%20Maxi%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat duna (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'duna', 1985, 1997, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Duna%20(1985%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat e-doblo (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'e-doblo', 2022, NULL, 5, 98, 58.1, '{16}', 'https://www.wheelfitment.eu/car/Fiat/e-Doblo%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat fiorino (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'fiorino', 1989, 2001, 4, 98, 58.1, '{13,14}', 'https://www.wheelfitment.eu/car/Fiat/Fiorino%20(1989%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat fiorino (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'fiorino', 2006, NULL, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Fiorino%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat freemont (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'freemont', 2011, 2016, 5, 127, 71.5, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Freemont%20(2011%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat grand punto (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'grand punto', 2005, 2009, 4, 100, 56.6, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Grand%20Punto%20(2005%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat idea (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'idea', 2003, 2016, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Idea%20(2003%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat linea (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'linea', 2007, 2016, 4, 98, 58.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Linea%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat marea (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'marea', 1996, 2001, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Marea%20(1996%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat multipla (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'multipla', 1999, 2010, 4, 98, 58.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Multipla%20(1999%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat palio (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'palio', 1998, 2006, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Palio%20(1998%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat panda (1980)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'panda', 1980, 2003, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Panda%20(1980%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat panda (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'panda', 2003, 2012, 4, 98, 58.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Fiat/Panda%20(2003%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat panda (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'panda', 2012, NULL, 4, 98, 58.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Panda%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat panda 4x4 (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'panda 4x4', 2003, 2012, 4, 98, 58.1, '{14,15,16}', 'https://www.wheelfitment.eu/car/Fiat/Panda%204x4%20(2003%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat petra (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'petra', 1996, 2012, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Petra%20(1996%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat punto (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'punto', 1993, 1999, 4, 98, 58.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Punto%20(1993%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat punto (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'punto', 1999, 2011, 4, 98, 58.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Punto%20(1999%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat punto (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'punto', 2012, 2018, 4, 100, 56.6, '{15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Punto%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat punto evo (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'punto evo', 2009, 2012, 4, 100, 56.6, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Punto%20Evo%20(2009%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat qubo (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'qubo', 2010, NULL, 4, 98, 58.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Qubo%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat regata (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'regata', 1983, 1990, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Regata%20(1983%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ritmo (1978)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ritmo', 1978, 1988, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Ritmo%20(1978%20-%201988).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat scudo (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'scudo', 1996, 2004, 5, 98, 65.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Scudo%20(1996%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat scudo (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'scudo', 2004, 2006, 5, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Scudo%20(2004%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat scudo (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'scudo', 2007, 2016, 5, 108, 65.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Scudo%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat scudo (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'scudo', 2022, NULL, 5, 108, 65.1, '{16,17}', 'https://www.wheelfitment.eu/car/Fiat/Scudo%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat sedici (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'sedici', 2006, 2016, 5, 114.3, 60.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Sedici%20(2006%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat seicento (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'seicento', 1998, 2010, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Seicento%20(1998%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat siena (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'siena', 1996, 2012, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Siena%20(1996%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat stilo (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'stilo', 2001, 2007, 4, 98, 58.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Fiat/Stilo%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat strada (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'strada', 1996, 2012, 4, 98, 58.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Strada%20(1996%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat strada (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'strada', 2012, NULL, 4, 98, 58.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Strada%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat talento (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'talento', 2016, NULL, 5, 114.3, 66.1, '{16,17}', 'https://www.wheelfitment.eu/car/Fiat/Talento%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat tempra (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'tempra', 1990, 1998, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Tempra%20(1990%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat tipo (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'tipo', 1988, 1995, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Tipo%20(1988%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat tipo (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'tipo', 2015, NULL, 5, 98, 58.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Fiat/Tipo%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat topolino (2023)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'topolino', 2023, NULL, 4, 108, 65.1, '{14,15}', 'https://www.wheelfitment.eu/car/Fiat/Topolino%20(2023%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ulysse (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ulysse', 1994, 2002, 5, 98, 58.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Fiat/Ulysse%20(1994%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat ulysse (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'ulysse', 2003, 2010, 5, 98, 58.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Fiat/Ulysse%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- fiat uno (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('fiat', 'פיאט', 'uno', 1983, 1995, 4, 98, 58.1, NULL, 'https://www.wheelfitment.eu/car/Fiat/Uno%20(1983%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford 500 (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', '500', 2005, 2008, 5, 114.3, 63.4, NULL, 'https://www.wheelfitment.eu/car/Ford/500%20(2005%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford aerostar (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'aerostar', 1985, 1997, 5, 114.3, 64.1, NULL, 'https://www.wheelfitment.eu/car/Ford/Aerostar%20(1985%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford b max (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'b max', 2012, 2018, 4, 108, 63.4, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Ford/B%20Max%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford bronco (1975)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'bronco', 1975, 1996, 5, 139.7, 87.1, NULL, 'https://www.wheelfitment.eu/car/Ford/Bronco%20(1975%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford bronco (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'bronco', 2021, NULL, 6, 139.7, 93.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Bronco%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford bronco ii (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'bronco ii', 1982, 1992, 5, 114.3, 70.6, NULL, 'https://www.wheelfitment.eu/car/Ford/Bronco%20II%20(1982%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford c max (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'c max', 2003, 2010, 5, 108, 63.4, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Ford/C%20Max%20(2003%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford c max (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'c max', 2010, 2019, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/C%20Max%20(2010%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford cougar (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'cougar', 1999, 2004, 4, 108, 63.4, '{16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Cougar%20(1999%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford courier (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'courier', 1995, 2000, 4, 108, 63.4, '{13,14}', 'https://www.wheelfitment.eu/car/Ford/Courier%20(1995%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford courier (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'courier', 2000, 2013, 4, 108, 63.4, '{13,14}', 'https://www.wheelfitment.eu/car/Ford/Courier%20(2000%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford crown (1960)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'crown', 1960, 1972, 5, 114.3, 70.3, NULL, 'https://www.wheelfitment.eu/car/Ford/Crown%20(1960%20-%201972).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford crown victoria (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'crown victoria', 1992, 1997, 5, 114.3, 70.5, '{15,16,17}', 'https://www.wheelfitment.eu/car/Ford/Crown%20Victoria%20(1992%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford crown victoria (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'crown victoria', 1998, 2011, 5, 114.3, 70.5, '{16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Crown%20Victoria%20(1998%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford e-150 econoline (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'e-150 econoline', 1992, 2007, 5, 139.7, 87, '{15}', 'https://www.wheelfitment.eu/car/Ford/E-150%20Econoline%20(1992%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford e-150 econoline (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'e-150 econoline', 2008, 2014, 8, 165.1, 87, '{16}', 'https://www.wheelfitment.eu/car/Ford/E-150%20Econoline%20(2008%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford e-250 econoline (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'e-250 econoline', 1992, 2007, 8, 165.1, 123.9, '{16}', 'https://www.wheelfitment.eu/car/Ford/E-250%20Econoline%20(1992%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford e-250 econoline (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'e-250 econoline', 2008, 2014, 8, 165.1, 123.9, '{16}', 'https://www.wheelfitment.eu/car/Ford/E-250%20Econoline%20(2008%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford e-350 (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'e-350', 1992, 2007, 8, 165.1, 123.9, '{16}', 'https://www.wheelfitment.eu/car/Ford/E-350%20(1992%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford ecosport (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'ecosport', 2014, 2023, 4, 108, 63.4, '{15,16,17}', 'https://www.wheelfitment.eu/car/Ford/EcoSport%20(2014%20-%202023).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford edge (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'edge', 2006, 2015, 5, 114.3, 70.6, NULL, 'https://www.wheelfitment.eu/car/Ford/Edge%20(2006%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford edge (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'edge', 2015, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Edge%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escape (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escape', 2000, 2006, 5, 114.3, 67.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Escape%20(2000%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escape (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escape', 2007, 2012, 5, 114.3, 67.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Escape%20(2007%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escape (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escape', 2012, 2019, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Escape%20(2012%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escape (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escape', 2020, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Escape%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escort (1980)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escort', 1980, 1985, 4, 108, 63.4, '{13,14,15}', 'https://www.wheelfitment.eu/car/Ford/Escort%20(1980%20-%201985).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escort (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escort', 1985, 1990, 4, 108, 63.4, '{13,14,15}', 'https://www.wheelfitment.eu/car/Ford/Escort%20(1985%20-%201990).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escort (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escort', 1990, 2000, 4, 108, 63.4, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Escort%20(1990%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escort express (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escort express', 1990, 1999, 4, 108, 63.4, NULL, 'https://www.wheelfitment.eu/car/Ford/Escort%20Express%20(1990%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford escort rs cosworth (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'escort rs cosworth', 1992, 1996, 4, 108, 63.4, NULL, 'https://www.wheelfitment.eu/car/Ford/Escort%20RS%20Cosworth%20(1992%20-%201996).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford excursion (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'excursion', 2000, 2005, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/Excursion%20(2000%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford expedition (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'expedition', 2007, 2017, 6, 135, 87.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/Expedition%20(2007%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford expedition (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'expedition', 2018, NULL, 6, 135, 87.1, '{18,20}', 'https://www.wheelfitment.eu/car/Ford/Expedition%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford explorer (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'explorer', 1991, 2002, 5, 114.3, 70.6, NULL, 'https://www.wheelfitment.eu/car/Ford/Explorer%20(1991%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford explorer (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'explorer', 2002, 2010, 5, 114.3, 70.3, '{16,17,18,20}', 'https://www.wheelfitment.eu/car/Ford/Explorer%20(2002%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford explorer (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'explorer', 2011, 2019, 5, 114.3, 63.4, '{18,20}', 'https://www.wheelfitment.eu/car/Ford/Explorer%20(2011%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford explorer (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'explorer', 2020, NULL, 5, 114.3, 70.5, '{18,20}', 'https://www.wheelfitment.eu/car/Ford/Explorer%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford explorer ev (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'explorer ev', 2024, NULL, 5, 112, 57.1, '{19,20}', 'https://www.wheelfitment.eu/car/Ford/Explorer%20EV%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f150 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f150', 1997, 2004, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F150%20(1997%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f150 (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f150', 2004, 2008, 6, 135, 87.1, NULL, 'https://www.wheelfitment.eu/car/Ford/F150%20(2004%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f150 (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f150', 2009, 2014, 6, 135, 87.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F150%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f150 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f150', 2015, 2020, 6, 135, 87.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F150%20(2015%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f150 (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f150', 2020, NULL, 6, 135, 87.1, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F150%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f250 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f250', 1999, 2007, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F250%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f250 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f250', 2008, 2010, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F250%20(2008%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f250 (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f250', 2011, 2016, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F250%20(2011%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f250 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f250', 2017, 2022, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F250%20(2017%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford f350 (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'f350', 1997, 2004, 8, 170, 124.9, '{17,18,20}', 'https://www.wheelfitment.eu/car/Ford/F350%20(1997%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fairline (1955)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fairline', 1955, 1970, 5, 114.3, 70.3, NULL, 'https://www.wheelfitment.eu/car/Ford/Fairline%20(1955%20-%201970).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (1976)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 1976, 1983, 4, 108, 63.4, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(1976%20-%201983).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (1983)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 1983, 1989, 4, 108, 63.4, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(1983%20-%201989).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 1989, 2002, 4, 108, 63.4, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(1989%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 2002, 2008, 4, 108, 63.4, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(2002%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 2008, 2017, 4, 108, 63.4, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(2008%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford fiesta (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'fiesta', 2017, NULL, 4, 108, 63.4, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Fiesta%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford flex (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'flex', 2009, 2019, 5, 114.3, 70.3, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Flex%20(2009%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus', 1998, 2004, 4, 108, 63.4, '{14,15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Ford/Focus%20(1998%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus', 2004, 2010, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20(2004%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus', 2011, 2018, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus', 2018, NULL, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus rs (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus rs', 2002, 2003, 4, 108, 63.4, NULL, 'https://www.wheelfitment.eu/car/Ford/Focus%20RS%20(2002%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus rs (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus rs', 2009, 2011, 5, 108, 63.4, '{18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20RS%20(2009%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus rs (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus rs', 2016, 2018, 5, 108, 63.4, '{18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20RS%20(2016%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus st (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus st', 2005, 2013, 5, 108, 63.4, '{18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Focus%20ST%20(2005%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford focus st170 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'focus st170', 2002, 2004, 4, 108, 63.4, '{16,17,18}', 'https://www.wheelfitment.eu/car/Ford/Focus%20ST170%20(2002%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- ford freestar (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('ford', 'פורד', 'freestar', 2004, 2007, 5, 114.3, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Ford/Freestar%20(2004%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

COMMIT;
