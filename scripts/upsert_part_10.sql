-- Part 10 of 10
-- Records: 8

BEGIN;

-- volvo v90 cross country (2016)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'v90 cross country', 2016, NULL, 5, 108, 63.4, '{18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/V90%20Cross%20Country%20(2016%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc40 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc40', 2017, NULL, 5, 108, 63.4, '{17,18,19}', 'https://www.wheelfitment.eu/car/Volvo/XC40%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc60 (2008)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc60', 2008, 2017, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC60%20(2008%20-%202017).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc60 (2017)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc60', 2017, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC60%20(2017%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc70 (2000)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc70', 2000, 2007, 5, 108, 65.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC70%20(2000%20-%202007).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc70 (2007)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc70', 2007, 2016, 5, 108, 63.4, '{16,17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC70%20(2007%20-%202016).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc90 (2002)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc90', 2002, 2014, 5, 108, 67.1, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC90%20(2002%20-%202014).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

-- volvo xc90 (2015)
INSERT INTO vehicle_models (make, make_he, model, year_from, year_to, bolt_count, bolt_spacing, center_bore, rim_sizes_allowed, source_url, source)
VALUES ('volvo', 'וולוו', 'xc90', 2015, NULL, 5, 108, 63.4, '{17,18,19,20}', 'https://www.wheelfitment.eu/car/Volvo/XC90%20(2015%20-%20).html', 'wheelfitment.eu')
ON CONFLICT (make, model, year_from)
DO UPDATE SET
  rim_sizes_allowed = COALESCE(vehicle_models.rim_sizes_allowed, EXCLUDED.rim_sizes_allowed),
  source_url = COALESCE(vehicle_models.source_url, EXCLUDED.source_url),
  center_bore = COALESCE(vehicle_models.center_bore, EXCLUDED.center_bore),
  make_he = COALESCE(vehicle_models.make_he, EXCLUDED.make_he),
  updated_at = NOW();

COMMIT;
