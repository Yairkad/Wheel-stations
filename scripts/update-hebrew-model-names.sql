-- Update Hebrew model names in the variants column for existing vehicles
-- Run this script in Supabase SQL Editor

-- Toyota
UPDATE vehicle_models SET variants = 'קורולה' WHERE LOWER(model) = 'corolla' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'יאריס' WHERE LOWER(model) = 'yaris' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קאמרי' WHERE LOWER(model) = 'camry' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ראב4' WHERE LOWER(model) = 'rav4' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'לנד קרוזר' WHERE LOWER(model) = 'land cruiser' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'היילקס' WHERE LOWER(model) = 'hilux' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אוריס' WHERE LOWER(model) = 'auris' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פריוס' WHERE LOWER(model) = 'prius' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אייגו' WHERE LOWER(model) = 'aygo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סי-אייצר' WHERE LOWER(model) = 'c-hr' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'היילנדר' WHERE LOWER(model) = 'highlander' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אבנסיס' WHERE LOWER(model) = 'avensis' AND (variants IS NULL OR variants = '');

-- Hyundai
UPDATE vehicle_models SET variants = 'אלנטרה' WHERE LOWER(model) = 'elantra' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טוסון' WHERE LOWER(model) = 'tucson' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סנטה פה' WHERE LOWER(model) = 'santa fe' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קונה' WHERE LOWER(model) = 'kona' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'איוניק' WHERE LOWER(model) = 'ioniq' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אקסנט' WHERE LOWER(model) = 'accent' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'גטס' WHERE LOWER(model) = 'getz' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סונטה' WHERE LOWER(model) = 'sonata' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'i10' WHERE LOWER(model) = 'i10' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'i20' WHERE LOWER(model) = 'i20' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'i30' WHERE LOWER(model) = 'i30' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'i35' WHERE LOWER(model) = 'i35' AND (variants IS NULL OR variants = '');

-- Kia
UPDATE vehicle_models SET variants = 'פיקנטו' WHERE LOWER(model) = 'picanto' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ריו' WHERE LOWER(model) = 'rio' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סיד' WHERE LOWER(model) = 'ceed' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סורנטו' WHERE LOWER(model) = 'sorento' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ספורטאז''' WHERE LOWER(model) = 'sportage' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'נירו' WHERE LOWER(model) = 'niro' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סטוניק' WHERE LOWER(model) = 'stonic' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אופטימה' WHERE LOWER(model) = 'optima' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קרניבל' WHERE LOWER(model) = 'carnival' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סול' WHERE LOWER(model) = 'soul' AND (variants IS NULL OR variants = '');

-- Mazda
UPDATE vehicle_models SET variants = 'מאזדה 2' WHERE LOWER(model) = 'mazda2' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מאזדה 3' WHERE LOWER(model) = 'mazda3' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מאזדה 6' WHERE LOWER(model) = 'mazda6' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מאזדה 2' WHERE LOWER(model) = '2' AND LOWER(make) = 'mazda' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מאזדה 3' WHERE LOWER(model) = '3' AND LOWER(make) = 'mazda' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מאזדה 6' WHERE LOWER(model) = '6' AND LOWER(make) = 'mazda' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'CX-3' WHERE LOWER(model) = 'cx-3' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'CX-5' WHERE LOWER(model) = 'cx-5' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'CX-30' WHERE LOWER(model) = 'cx-30' AND (variants IS NULL OR variants = '');

-- Honda
UPDATE vehicle_models SET variants = 'סיוויק' WHERE LOWER(model) = 'civic' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ג''אז' WHERE LOWER(model) = 'jazz' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אקורד' WHERE LOWER(model) = 'accord' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'CR-V' WHERE LOWER(model) = 'cr-v' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'HR-V' WHERE LOWER(model) = 'hr-v' AND (variants IS NULL OR variants = '');

-- Nissan
UPDATE vehicle_models SET variants = 'מיקרה' WHERE LOWER(model) = 'micra' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ג''וק' WHERE LOWER(model) = 'juke' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קשקאי' WHERE LOWER(model) = 'qashqai' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אקס-טרייל' WHERE LOWER(model) = 'x-trail' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ליף' WHERE LOWER(model) = 'leaf' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סנטרה' WHERE LOWER(model) = 'sentra' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'נבארה' WHERE LOWER(model) = 'navara' AND (variants IS NULL OR variants = '');

-- Suzuki
UPDATE vehicle_models SET variants = 'סוויפט' WHERE LOWER(model) = 'swift' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'בלנו' WHERE LOWER(model) = 'baleno' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ויטרה' WHERE LOWER(model) = 'vitara' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'איגניס' WHERE LOWER(model) = 'ignis' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ג''ימני' WHERE LOWER(model) = 'jimny' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'S-Cross' WHERE LOWER(model) = 's-cross' AND (variants IS NULL OR variants = '');

-- Volkswagen
UPDATE vehicle_models SET variants = 'גולף' WHERE LOWER(model) = 'golf' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פולו' WHERE LOWER(model) = 'polo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פאסאט' WHERE LOWER(model) = 'passat' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טיגואן' WHERE LOWER(model) = 'tiguan' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טי-רוק' WHERE LOWER(model) = 't-roc' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ג''טה' WHERE LOWER(model) = 'jetta' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אפ' WHERE LOWER(model) = 'up' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טוראן' WHERE LOWER(model) = 'touran' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קאדי' WHERE LOWER(model) = 'caddy' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טרנספורטר' WHERE LOWER(model) = 'transporter' AND (variants IS NULL OR variants = '');

-- Skoda
UPDATE vehicle_models SET variants = 'פאביה' WHERE LOWER(model) = 'fabia' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אוקטביה' WHERE LOWER(model) = 'octavia' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סופרב' WHERE LOWER(model) = 'superb' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קארוק' WHERE LOWER(model) = 'karoq' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קודיאק' WHERE LOWER(model) = 'kodiaq' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סקאלה' WHERE LOWER(model) = 'scala' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קאמיק' WHERE LOWER(model) = 'kamiq' AND (variants IS NULL OR variants = '');

-- Seat
UPDATE vehicle_models SET variants = 'איביזה' WHERE LOWER(model) = 'ibiza' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'לאון' WHERE LOWER(model) = 'leon' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ארונה' WHERE LOWER(model) = 'arona' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אטקה' WHERE LOWER(model) = 'ateca' AND (variants IS NULL OR variants = '');

-- BMW
UPDATE vehicle_models SET variants = 'סדרה 1' WHERE LOWER(model) = '1 series' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סדרה 2' WHERE LOWER(model) = '2 series' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סדרה 3' WHERE LOWER(model) = '3 series' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סדרה 4' WHERE LOWER(model) = '4 series' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סדרה 5' WHERE LOWER(model) = '5 series' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'X1' WHERE LOWER(model) = 'x1' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'X3' WHERE LOWER(model) = 'x3' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'X5' WHERE LOWER(model) = 'x5' AND (variants IS NULL OR variants = '');

-- Mercedes
UPDATE vehicle_models SET variants = 'A קלאס' WHERE LOWER(model) = 'a-class' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'B קלאס' WHERE LOWER(model) = 'b-class' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'C קלאס' WHERE LOWER(model) = 'c-class' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'E קלאס' WHERE LOWER(model) = 'e-class' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ויטו' WHERE LOWER(model) = 'vito' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ספרינטר' WHERE LOWER(model) = 'sprinter' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'GLA' WHERE LOWER(model) = 'gla' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'GLC' WHERE LOWER(model) = 'glc' AND (variants IS NULL OR variants = '');

-- Peugeot
UPDATE vehicle_models SET variants = 'פרטנר' WHERE LOWER(model) = 'partner' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '208' WHERE LOWER(model) = '208' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '308' WHERE LOWER(model) = '308' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '2008' WHERE LOWER(model) = '2008' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '3008' WHERE LOWER(model) = '3008' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '5008' WHERE LOWER(model) = '5008' AND (variants IS NULL OR variants = '');

-- Citroen
UPDATE vehicle_models SET variants = 'ברלינגו' WHERE LOWER(model) = 'berlingo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'C3' WHERE LOWER(model) = 'c3' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'C4' WHERE LOWER(model) = 'c4' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'C5' WHERE LOWER(model) = 'c5' AND (variants IS NULL OR variants = '');

-- Renault
UPDATE vehicle_models SET variants = 'קליאו' WHERE LOWER(model) = 'clio' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מגאן' WHERE LOWER(model) = 'megane' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קפצ''ור' WHERE LOWER(model) = 'captur' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קדג''אר' WHERE LOWER(model) = 'kadjar' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'סניק' WHERE LOWER(model) = 'scenic' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קנגו' WHERE LOWER(model) = 'kangoo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'זואי' WHERE LOWER(model) = 'zoe' AND (variants IS NULL OR variants = '');

-- Fiat
UPDATE vehicle_models SET variants = 'פנדה' WHERE LOWER(model) = 'panda' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פונטו' WHERE LOWER(model) = 'punto' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טיפו' WHERE LOWER(model) = 'tipo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = '500' WHERE LOWER(model) = '500' AND (variants IS NULL OR variants = '');

-- Opel
UPDATE vehicle_models SET variants = 'קורסה' WHERE LOWER(model) = 'corsa' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אסטרה' WHERE LOWER(model) = 'astra' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אינסיגניה' WHERE LOWER(model) = 'insignia' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'מוקה' WHERE LOWER(model) = 'mokka' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קרוסלנד' WHERE LOWER(model) = 'crossland' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'גרנדלנד' WHERE LOWER(model) = 'grandland' AND (variants IS NULL OR variants = '');

-- Subaru
UPDATE vehicle_models SET variants = 'אימפרזה' WHERE LOWER(model) = 'impreza' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פורסטר' WHERE LOWER(model) = 'forester' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אאוטבק' WHERE LOWER(model) = 'outback' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'לגאסי' WHERE LOWER(model) = 'legacy' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'XV' WHERE LOWER(model) = 'xv' AND (variants IS NULL OR variants = '');

-- Mitsubishi
UPDATE vehicle_models SET variants = 'לנסר' WHERE LOWER(model) = 'lancer' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אאוטלנדר' WHERE LOWER(model) = 'outlander' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פאג''רו' WHERE LOWER(model) = 'pajero' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'ASX' WHERE LOWER(model) = 'asx' AND (variants IS NULL OR variants = '');

-- Ford
UPDATE vehicle_models SET variants = 'פיאסטה' WHERE LOWER(model) = 'fiesta' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פוקוס' WHERE LOWER(model) = 'focus' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'פומה' WHERE LOWER(model) = 'puma' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קוגה' WHERE LOWER(model) = 'kuga' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'טרנזיט' WHERE LOWER(model) = 'transit' AND (variants IS NULL OR variants = '');

-- Chevrolet
UPDATE vehicle_models SET variants = 'ספארק' WHERE LOWER(model) = 'spark' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'אוואו' WHERE LOWER(model) = 'aveo' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קרוז' WHERE LOWER(model) = 'cruze' AND (variants IS NULL OR variants = '');

-- Dacia
UPDATE vehicle_models SET variants = 'סנדרו' WHERE LOWER(model) = 'sandero' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'דאסטר' WHERE LOWER(model) = 'duster' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'לוג''אן' WHERE LOWER(model) = 'logan' AND (variants IS NULL OR variants = '');

-- Jeep
UPDATE vehicle_models SET variants = 'רנגלר' WHERE LOWER(model) = 'wrangler' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'קומפאס' WHERE LOWER(model) = 'compass' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'רנגייד' WHERE LOWER(model) = 'renegade' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'צ''רוקי' WHERE LOWER(model) = 'cherokee' AND (variants IS NULL OR variants = '');
UPDATE vehicle_models SET variants = 'גרנד צ''רוקי' WHERE LOWER(model) = 'grand cherokee' AND (variants IS NULL OR variants = '');

-- Check results
SELECT model, variants FROM vehicle_models WHERE variants IS NOT NULL AND variants != '' ORDER BY model;
