-- Part 8 of 10
-- Records: 200

BEGIN;

-- seat arona (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'arona', 2017, NULL, 5, 100, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Arona%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat arosa (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'arosa', 1997, 2005, 4, 100, 57.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Seat/Arosa%20(1997%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ateca (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ateca', 2016, NULL, 5, 112, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Ateca%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat cordoba (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'cordoba', 1993, 2002, 4, 100, 57.1, '{13,14,15,16,17}', 'https://www.wheelfitment.eu/car/Seat/Cordoba%20(1993%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat cordoba (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'cordoba', 2002, 2009, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Cordoba%20(2002%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat exeo (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'exeo', 2009, 2013, 5, 112, 57.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Exeo%20(2009%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ibiza (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ibiza', 1993, 2002, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Ibiza%20(1993%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ibiza (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ibiza', 2002, 2006, 5, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Ibiza%20(2002%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ibiza (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ibiza', 2006, 2008, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Ibiza%20(2006%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ibiza (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ibiza', 2008, NULL, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Ibiza%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat ibiza st (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'ibiza st', 2010, NULL, 5, 100, 57.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Ibiza%20ST%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat inca (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'inca', 1995, 2003, 4, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Inca%20(1995%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon', 1999, 2005, 5, 100, 57.1, '{14,15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20(1999%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon', 2005, 2010, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20(2005%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon', 2010, 2012, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20(2010%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon', 2012, 2020, 5, 112, 57.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20(2012%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon', 2020, NULL, 5, 112, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Leon%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon cupra (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon cupra', 2014, 2020, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20Cupra%20(2014%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon cupra (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon cupra', 2020, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20Cupra%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon cupra r (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon cupra r', 2002, 2006, 5, 100, 57.1, NULL, 'https://www.wheelfitment.eu/car/Seat/Leon%20Cupra%20R%20(2002%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon cupra sportstourer (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon cupra sportstourer', 2020, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20Cupra%20Sportstourer%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat leon cupra st (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'leon cupra st', 2015, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Leon%20Cupra%20ST%20(2015%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat marbella (1987)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'marbella', 1987, 1998, 4, 98, 58.1, '{13,14}', 'https://www.wheelfitment.eu/car/Seat/Marbella%20(1987%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat mii (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'mii', 2012, 2021, 4, 100, 57.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Seat/Mii%20(2012%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat tarraco (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'tarraco', 2018, NULL, 5, 112, 57.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Tarraco%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat toledo (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'toledo', 1991, 1998, 4, 100, 57.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Toledo%20(1991%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat toledo (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'toledo', 1998, 2004, 5, 100, 57.1, '{14,15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Toledo%20(1998%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat toledo (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'toledo', 2004, 2012, 5, 112, 57.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Seat/Toledo%20(2004%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- seat toledo (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('seat', 'סיאט', 'toledo', 2012, 2018, 5, 100, 57.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Seat/Toledo%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru ascent (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'ascent', 2019, NULL, 5, 114.3, 56.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Ascent%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru b9 tribeca (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'b9 tribeca', 2005, 2014, 5, 114.3, 56.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/B9%20Tribeca%20(2005%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru baja (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'baja', 2002, 2007, 5, 100, 56.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Subaru/Baja%20(2002%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru brz (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'brz', 2012, NULL, 5, 100, 56.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/BRZ%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru crosstrek (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'crosstrek', 2022, NULL, 5, 114.3, 56.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Crosstrek%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru forester (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'forester', 1997, 2002, 5, 100, 56.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Forester%20(1997%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru forester (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'forester', 2003, 2008, 5, 100, 56.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Forester%20(2003%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru forester (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'forester', 2008, 2013, 5, 100, 56.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Forester%20(2008%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru forester (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'forester', 2013, 2018, 5, 100, 56.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Forester%20(2013%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru forester (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'forester', 2018, NULL, 5, 114.3, 56.1, '{17,18}', 'https://www.wheelfitment.eu/car/Subaru/Forester%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza', 1993, 2000, 5, 100, 56.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/Impreza%20(1993%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza', 2001, 2007, 5, 100, 56.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/Impreza%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza', 2007, 2011, 5, 100, 56.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20(2007%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza', 2011, 2016, 5, 100, 56.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20(2011%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza', 2017, NULL, 5, 100, 56.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza wrx sti (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza wrx sti', 2000, 2005, 5, 100, 56.1, '{17,18}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20WRX%20STi%20(2000%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza wrx sti (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza wrx sti', 2005, 2007, 5, 114.3, 56.1, '{17,18}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20WRX%20STi%20(2005%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru impreza wrx sti (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'impreza wrx sti', 2007, 2014, 5, 114.3, 56.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Impreza%20WRX%20STi%20(2007%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru justy (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'justy', 1984, 1994, 4, 100, 59.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Subaru/Justy%20(1984%20-%201994).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru justy (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'justy', 1995, 2004, 4, 114.3, 60.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Subaru/Justy%20(1995%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru justy (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'justy', 2004, 2010, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/Justy%20(2004%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru legacy (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'legacy', 1989, 2003, 5, 100, 56.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/Legacy%20(1989%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru legacy (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'legacy', 2003, 2009, 5, 100, 56.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Subaru/Legacy%20(2003%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru legacy (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'legacy', 2009, 2014, 5, 100, 56.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Legacy%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru legacy (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'legacy', 2015, 2020, 5, 114.3, 56.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Legacy%20(2015%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru legacy (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'legacy', 2020, NULL, 5, 114.3, 56.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Legacy%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru levorg (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'levorg', 2014, 2022, 5, 114.3, 56.1, '{17,18}', 'https://www.wheelfitment.eu/car/Subaru/Levorg%20(2014%20-%202022).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru outback (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'outback', 1998, 2003, 5, 100, 56.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Subaru/Outback%20(1998%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru outback (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'outback', 2004, 2009, 5, 100, 56.1, '{16,17}', 'https://www.wheelfitment.eu/car/Subaru/Outback%20(2004%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru outback (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'outback', 2009, 2014, 5, 100, 56.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Outback%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru outback (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'outback', 2015, 2020, 5, 114.3, 56.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/Outback%20(2015%20-%202020).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru outback (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'outback', 2020, NULL, 5, 114.3, 56.1, '{17,18}', 'https://www.wheelfitment.eu/car/Subaru/Outback%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru solterra (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'solterra', 2022, NULL, 5, 114.3, 60.1, '{18,20}', 'https://www.wheelfitment.eu/car/Subaru/Solterra%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru svx (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'svx', 1992, 1997, 5, 114.3, 56.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Subaru/SVX%20(1992%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru trezia (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'trezia', 2010, 2016, 5, 100, 54.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/Trezia%20(2010%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru vivio (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'vivio', 1992, 2001, 4, 100, 59.1, NULL, 'https://www.wheelfitment.eu/car/Subaru/Vivio%20(1992%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru wrx sti (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'wrx sti', 2013, NULL, 5, 114.3, 56.1, '{18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/WRX%20STI%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru xv (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'xv', 2011, 2017, 5, 100, 56.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Subaru/XV%20(2011%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- subaru xv (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('subaru', 'סובארו', 'xv', 2017, NULL, 5, 100, 56.1, '{17,18,19}', 'https://www.wheelfitment.eu/car/Subaru/XV%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki across (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'across', 2020, NULL, 5, 114.3, 60.1, '{18,19}', 'https://www.wheelfitment.eu/car/Suzuki/Across%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alto (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alto', 1985, 1995, 4, 114.3, 60.1, '{12,13,14}', 'https://www.wheelfitment.eu/car/Suzuki/Alto%20(1985%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alto (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alto', 1995, 2002, 4, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Suzuki/Alto%20(1995%20-%202002)%20.html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alto (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alto', 2002, 2009, 4, 100, 54.1, '{14}', 'https://www.wheelfitment.eu/car/Suzuki/Alto%20(2002%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alto (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alto', 2009, 2014, 4, 100, 54.1, '{14,15}', 'https://www.wheelfitment.eu/car/Suzuki/Alto%20(2009%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alto (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alto', 2014, NULL, 4, 100, 54.1, '{14}', 'https://www.wheelfitment.eu/car/Suzuki/Alto%20(2014%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki alvivio (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'alvivio', 2015, NULL, 4, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Alvivio%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki baleno (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'baleno', 1995, 2002, 4, 100, 54.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Baleno%20(1995%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki baleno (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'baleno', 2015, NULL, 4, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Baleno%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki cappuccino (1991)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'cappuccino', 1991, 1998, 4, 114.3, 67.1, '{14,15}', 'https://www.wheelfitment.eu/car/Suzuki/Cappuccino%20(1991%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki carry (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'carry', 1990, 1995, 4, 114.3, 60.1, '{13}', 'https://www.wheelfitment.eu/car/Suzuki/Carry%20(1990%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki carry (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'carry', 1995, 1999, 4, 100, 60.1, '{13}', 'https://www.wheelfitment.eu/car/Suzuki/Carry%20(1995%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki carry (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'carry', 1999, 2013, 4, 100, 60.1, '{13}', 'https://www.wheelfitment.eu/car/Suzuki/Carry%20(1999%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki celerio (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'celerio', 2015, NULL, 4, 100, 54.1, '{14,15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Celerio%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki esteem (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'esteem', 1995, 2002, 4, 100, 54.1, '{13,14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Esteem%20(1995%20-%202002.html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki gand vitara (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'gand vitara', 1998, 2005, 5, 139.7, 104.5, '{16,17,18,20}', 'https://www.wheelfitment.eu/car/Suzuki/Gand%20Vitara%20(1998%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki grand vitara (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'grand vitara', 1998, 2005, 5, 139.7, 108.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Suzuki/Grand%20Vitara%20(1998%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki grand vitara (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'grand vitara', 2005, NULL, 5, 114.3, 60.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Suzuki/Grand%20Vitara%20(2005%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki ignis (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'ignis', 2000, 2003, 4, 100, 54.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Suzuki/Ignis%20(2000%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki ignis (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'ignis', 2016, NULL, 4, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Ignis%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki ignis ii (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'ignis ii', 2003, 2008, 4, 100, 54.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Suzuki/Ignis%20II%20(2003%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki invicto (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'invicto', 2022, NULL, 5, 114.3, 60.1, '{17}', 'https://www.wheelfitment.eu/car/Suzuki/Invicto%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki jimny (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'jimny', 1984, 1997, 5, 139.7, 108.4, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Jimny%20(1984%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki jimny (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'jimny', 1998, 2018, 5, 139.7, 108.4, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Jimny%20(1998%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki jimny (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'jimny', 2018, NULL, 5, 139.7, 108.4, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Jimny%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki kizashi (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'kizashi', 2009, NULL, 5, 114.3, 60.1, '{17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Kizashi%20(2009%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki liana (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'liana', 2001, 2007, 4, 100, 54.1, '{15}', 'https://www.wheelfitment.eu/car/Suzuki/Liana%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki s-cross (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 's-cross', 2013, NULL, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/Suzuki/S-Cross%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki splash (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'splash', 2008, NULL, 4, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Splash%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swace (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swace', 2020, NULL, 5, 114.3, 60.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Swace%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift', 1984, 2003, 4, 114.3, 60.1, '{14,15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20(1984%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift', 2005, 2010, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20(2005%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift', 2010, 2017, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift', 2017, NULL, 4, 100, 54.1, '{15,16}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift 4wd (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift 4wd', 2010, 2017, 4, 100, 54.1, '{15}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%204WD%20(2010%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift sport (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift sport', 2006, 2010, 5, 114.3, 60.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20Sport%20(2006%20-%202010).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki swift sport (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'swift sport', 2011, 2017, 5, 114.3, 60.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Suzuki/Swift%20Sport%20(2011%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki sx4 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'sx4', 2006, 2015, 5, 114.3, 60.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Suzuki/SX4%20(2006%20-%202015).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki sx4 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'sx4', 2017, 2021, 5, 114.3, 60.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Suzuki/SX4%20(2017%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki vitara (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'vitara', 1988, 1998, 5, 139.7, 108.1, '{16}', 'https://www.wheelfitment.eu/car/Suzuki/Vitara%20(1988%20-%201998).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki vitara (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'vitara', 2001, 2006, 5, 139.7, 108.4, NULL, 'https://www.wheelfitment.eu/car/Suzuki/Vitara%20(2001%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki vitara (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'vitara', 2015, NULL, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/Suzuki/Vitara%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki wagon r plus (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'wagon r plus', 1997, 2000, 4, 100, 54.1, '{13,14}', 'https://www.wheelfitment.eu/car/Suzuki/Wagon%20R%20plus%20(1997%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki wagon r plus (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'wagon r plus', 2000, 2010, 4, 100, 54.1, '{14}', 'https://www.wheelfitment.eu/car/Suzuki/Wagon%20R%20plus%20(2000%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- suzuki xl7 (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('suzuki', 'סוזוקי', 'xl7', 2006, 2009, 5, 139.7, 104.5, NULL, 'https://www.wheelfitment.eu/car/Suzuki/XL7%20(2006%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota 4 runner (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', '4 runner', 2003, NULL, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/4%20Runner%20(2003%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota altezza (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'altezza', 1998, 2005, 5, 114.3, 60.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Toyota/Altezza%20(1998%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota aristo (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'aristo', 1997, 2004, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/Aristo%20(1997%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota auris (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'auris', 2007, 2012, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Auris%20(2007%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota auris (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'auris', 2013, NULL, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Auris%20(2013%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota avensis (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'avensis', 1998, 2003, 5, 100, 54.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Avensis%20(1998%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota avensis ii (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'avensis ii', 2003, 2008, 5, 100, 54.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Avensis%20II%20(2003%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota avensis ii 2.2 diesel (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'avensis ii 2.2 diesel', 2005, 2008, 5, 114.3, 60.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Avensis%20II%202.2%20Diesel%20(2005%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota avensis iii (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'avensis iii', 2008, NULL, 5, 114.3, 60.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Avensis%20III%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota avensis verso (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'avensis verso', 2001, 2005, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Avensis%20Verso%20(2001%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota aygo (2005)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'aygo', 2005, NULL, 4, 100, 54.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Toyota/Aygo%20(2005%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota bb (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'bb', 2000, 2016, 4, 100, 54.1, '{14,15}', 'https://www.wheelfitment.eu/car/Toyota/BB%20(2000%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota bz4x (2022)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'bz4x', 2022, NULL, 5, 114.3, 60.1, '{18,20}', 'https://www.wheelfitment.eu/car/Toyota/BZ4X%20(2022%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota c-hr (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'c-hr', 2016, NULL, 5, 114.3, 60.1, '{17,18}', 'https://www.wheelfitment.eu/car/Toyota/C-HR%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (1982)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 1982, 1986, 5, 100, 54.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(1982%20-%201986).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 1986, 1991, 5, 114.3, 60.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(1986%20-%201991).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 1990, 2001, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(1990%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 2001, 2011, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(2001%20-%202011).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (2011)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 2011, 2018, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(2011%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota camry (2018)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'camry', 2018, NULL, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Camry%20(2018%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota carina (1992)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'carina', 1992, 1997, 5, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Carina%20(1992%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota carina 4 bolts (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'carina 4 bolts', 1988, 1992, 4, 100, 54.1, '{13,14,15}', 'https://www.wheelfitment.eu/car/Toyota/Carina%204%20gaats%20(1988%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota carina 5 bolts (1988)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'carina 5 bolts', 1988, 1992, 5, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Carina%205%20gaats%20(1988%20-%201992).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celica (1971)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celica', 1971, 1977, 4, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Celica%20(1971%20-%201977).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celica (1985)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celica', 1985, 1989, 4, 100, 54.1, '{13,14,15,16}', 'https://www.wheelfitment.eu/car/Toyota/Celica%20(1985%20-%201989).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celica (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celica', 1989, 1993, 4, 100, 54.1, '{14,15}', 'https://www.wheelfitment.eu/car/Toyota/Celica%20(1989%20-%201993).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celica (1993)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celica', 1993, 1999, 5, 100, 54.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Celica%20(1993%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celica (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celica', 1999, 2007, 5, 100, 54.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Celica%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota celsior (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'celsior', 2000, 2006, 5, 114.3, 60.1, '{16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Celsior%20(2000%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota century (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'century', 2017, 2024, 5, 120, 60.1, '{18,19}', 'https://www.wheelfitment.eu/car/Toyota/Century%20(2017%20-%202024).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota century (2024)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'century', 2024, NULL, 5, 120, 60.1, '{20}', 'https://www.wheelfitment.eu/car/Toyota/Century%20(2024%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota chaser (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'chaser', 1996, 2001, 5, 114.3, 60.1, '{15,16}', 'https://www.wheelfitment.eu/car/Toyota/Chaser%20(1996%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla (1987)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla', 1987, 1997, 4, 100, 54.1, '{14,15,16,17}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20(1987%20-%201997).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla', 1997, 2001, 4, 100, 54.1, '{14,15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20(1997%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla', 2002, 2007, 4, 100, 54.1, '{15,16,17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20(2002%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla', 2007, 2013, 5, 114.3, 60.1, '{15,16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20(2007%20-%202013).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla cross (2020)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla cross', 2020, NULL, 5, 114.3, 60.1, '{17,18}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20Cross%20(2020%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla eu (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla eu', 2016, 2019, 5, 114.3, 60.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20EU%20(2016%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla eu (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla eu', 2019, NULL, 5, 114.3, 60.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20EU%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla us (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla us', 2013, 2019, 5, 100, 54.1, '{15,16,17}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20US%20(2013%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla us (2019)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla us', 2019, NULL, 5, 100, 54.1, '{15,16,18}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20US%20(2019%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla verso (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla verso', 2002, 2004, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Corolla%20Verso%20(2002%20-%202004).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota corolla verso (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'corolla verso', 2004, 2009, 5, 114.3, 60.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Corolla%20Verso%20(2004%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota crown athlete (2003)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'crown athlete', 2003, 2008, 5, 114.3, 60.1, '{18}', 'https://www.wheelfitment.eu/car/Toyota/Crown%20Athlete%20(2003%20-%202008).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota crown athlete (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'crown athlete', 2008, 2012, 5, 114.3, 60.1, '{18}', 'https://www.wheelfitment.eu/car/Toyota/Crown%20Athlete%20(2008%20-%202012).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota crown athlete (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'crown athlete', 2012, 2018, 5, 114.3, 60.1, '{17,18}', 'https://www.wheelfitment.eu/car/Toyota/Crown%20Athlete%20(2012%20-%202018).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota fj cruiser (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'fj cruiser', 2006, NULL, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/FJ%20Cruiser%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota gt 86 (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'gt 86', 2012, NULL, 5, 100, 56.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/GT%2086%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hi-ace 2wd (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hi-ace 2wd', 1989, 1995, 5, 114.3, 67.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Hi-Ace%202WD%20(1989%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hi-ace 2wd (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hi-ace 2wd', 1995, 2001, 6, 139.7, 106, '{15,16}', 'https://www.wheelfitment.eu/car/Toyota/Hi-Ace%202WD%20(1995%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hi-ace 4wd (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hi-ace 4wd', 1989, 1995, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Hi-Ace%204WD%20(1989%20-%201995).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hi-ace 4wd (1995)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hi-ace 4wd', 1995, 2006, 6, 139.7, 67.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Hi-Ace%204WD%20(1995%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota highlander (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'highlander', 2001, 2007, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/Highlander%20(2001%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota highlander (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'highlander', 2008, NULL, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Highlander%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hilux 2wd (1986)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hilux 2wd', 1986, 2005, 5, 114.3, 67.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/HiLux%202WD%20(1986%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hilux 2wd (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hilux 2wd', 2006, NULL, 5, 114.3, 67.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/HiLux%202WD%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hilux 4wd (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hilux 4wd', 1989, 1999, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/HiLux%204WD%20(1989%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hilux 4wd (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hilux 4wd', 1999, 2005, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/HiLux%204WD%20(1999%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota hilux 4wd (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'hilux 4wd', 2006, NULL, 6, 139.7, 106, '{15,16,17,18,20}', 'https://www.wheelfitment.eu/car/Toyota/HiLux%204WD%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota iq (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'iq', 2009, NULL, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/IQ%20(2009%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota land cruiser j100 (1998)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'land cruiser j100', 1998, 2007, 5, 150, 110, NULL, 'https://www.wheelfitment.eu/car/Toyota/Land%20Cruiser%20J100%20(1998%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota land cruiser j20 v8 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'land cruiser j20 v8', 2008, NULL, 5, 150, 110, NULL, 'https://www.wheelfitment.eu/car/Toyota/Land%20Cruiser%20J20%20V8%20(2008%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota land cruiser j90 (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'land cruiser j90', 1996, 2002, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Land%20Cruiser%20J90%20(1996%20-%202002).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota land cruiser prado (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'land cruiser prado', 2002, 2009, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Land%20Cruiser%20Prado%20(2002%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota land cruiser prado (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'land cruiser prado', 2009, NULL, 6, 139.7, 106, NULL, 'https://www.wheelfitment.eu/car/Toyota/Land%20Cruiser%20Prado%20(2009%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mark x (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mark x', 2004, 2009, 5, 114.3, 60.1, '{16,18}', 'https://www.wheelfitment.eu/car/Toyota/Mark%20X%20(2004%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mark x (2009)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mark x', 2009, 2016, 5, 114.3, 60.1, '{16,18}', 'https://www.wheelfitment.eu/car/Toyota/Mark%20X%20(2009%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mark x (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mark x', 2016, 2019, 5, 114.3, 60.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Mark%20X%20(2016%20-%202019).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mirai (2014)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mirai', 2014, 2021, 5, 114.3, 60.1, '{17,18}', 'https://www.wheelfitment.eu/car/Toyota/Mirai%20(2014%20-%202021).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mirai (2021)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mirai', 2021, NULL, 5, 120, 60.1, '{19,20}', 'https://www.wheelfitment.eu/car/Toyota/Mirai%20(2021%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mr2 (1984)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mr2', 1984, 1988, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/MR2%20(1984%20-%201988).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mr2 (1989)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mr2', 1989, 1999, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/MR2%20(1989%20-%201999).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota mr2 (1999)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'mr2', 1999, 2007, 4, 100, 54.1, '{15,16,17,18}', 'https://www.wheelfitment.eu/car/Toyota/MR2%20(1999%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota paseo (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'paseo', 1996, 2000, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Paseo%20(1996%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota picnic (1996)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'picnic', 1996, 2001, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Picnic%20(1996%20-%202001).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota picnic (2001)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'picnic', 2001, 2009, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Picnic%20(2001%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota previa (1990)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'previa', 1990, 2000, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Previa%20(1990%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota previa (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'previa', 2000, 2006, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Previa%20(2000%20-%202006).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota previa (2006)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'previa', 2006, NULL, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Previa%20(2006%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota prius (1997)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'prius', 1997, 2003, 4, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Prius%20(1997%20-%202003).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota prius (2004)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'prius', 2004, 2009, 5, 100, 54.1, '{16,17,18,19}', 'https://www.wheelfitment.eu/car/Toyota/Prius%20(2004%20-%202009).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota prius (2010)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'prius', 2010, NULL, 5, 100, 54.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Prius%20(2010%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota prius wagon (2012)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'prius wagon', 2012, NULL, 5, 114.3, 60.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/Prius%20Wagon%20(2012%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota proace (2013)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'proace', 2013, 2016, 5, 108, 65.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/ProAce%20(2013%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota proace (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'proace', 2016, NULL, 5, 108, 65.1, '{16,17}', 'https://www.wheelfitment.eu/car/Toyota/ProAce%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota rav4 (1994)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'rav4', 1994, 2000, 5, 114.3, 60.1, NULL, 'https://www.wheelfitment.eu/car/Toyota/Rav4%20(1994%20-%202000).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- toyota rav4 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('toyota', 'טויוטה', 'rav4', 2000, 2005, 5, 114.3, 60.1, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Toyota/Rav4%20(2000%20-%202005).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

COMMIT;
