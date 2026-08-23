/**
 * Pulse AI — Medical Knowledge Base
 *
 * Curated medical data that gets injected into AI context.
 * Covers: symptoms, diseases, drugs, diagnostics, emergencies, report interpretation.
 * Sources: WHO, ICMR, NCBI, Harrison's Principles, API Pharmacology textbooks.
 *
 * This knowledge base makes free models perform like specialized medical AI.
 */

const knowledgeBase = {

  // ═══════════════════════════════════════════════════════════
  // EMERGENCY PROTOCOLS — Always checked first
  // ═══════════════════════════════════════════════════════════
  emergencies: {
    title: "Medical Emergencies — Immediate Action Required",
    content: `
CHEST PAIN + BREATHING DIFFICULTY + SWEATING + JAW/ARM PAIN = Possible Heart Attack
→ Call emergency services IMMEDIATELY. Do not wait. Chew an aspirin (325mg) if not allergic.

SUDDEN SEVERE HEADACHE "worst of my life" + STIFF NECK + VOMITING = Possible Brain Hemorrhage/Meningitis
→ Emergency hospital visit immediately.

UNCONTROLLED BLEEDING that doesn't stop with 15 min pressure = Hemorrhage
→ Apply firm pressure, elevate, go to emergency.

SEIZURE lasting more than 5 minutes = Status Epilepticus
→ Call emergency. Do not put anything in the mouth.

DIFFICULTY BREATHING + BLUE LIPS/NAILS = Respiratory Failure
→ Emergency immediately.

SUDDEN WEAKNESS/NUMBNESS on one side + SPEECH DIFFICULTY = Possible Stroke (FAST: Face, Arms, Speech, Time)
→ Emergency immediately. Note the time symptoms started.

SEVERE BURN covering >10% body area or on face/hands/joints = Major Burn
→ Cool with running water 10-20 min. Emergency hospital.

HIGH FEVER (>103°F/39.4°C) + RASH + CONFUSION = Possible Meningitis/Septicemia
→ Emergency immediately.

SEVERE ABDOMINAL PAIN + RIGID BELLY + VOMITING = Possible Perforation/Appendicitis
→ Emergency. Do not eat or drink.

ALLERGIC REACTION: SWELLING OF TONGUE/THROAT + DIFFICULTY BREATHING = Anaphylaxis
→ Use epinephrine auto-injector if available. Call emergency.

SUDDEN SEVERE CHEST TIGHTNESS RADIATING TO BACK + TEARING SENSATION = Possible Aortic Dissection
→ Emergency. Keep patient calm, call ambulance.

BLOOD IN VOMIT (hematemesis) or BLACK TARRY STOOL (melena) = GI Bleed
→ Emergency. Do not eat. Keep patient hydrated sips only.

PREGNANCY: SEVERE HEADACHE + VISION CHANGES + SWELLING = Possible Pre-eclampsia
→ Emergency. Risk to mother and baby.

CHILD: PERSISTENT VOMITING + LETHARGY + HIGH FEVER = Possible Serious Infection
→ Emergency pediatric care.

POISONING/OVERDOSE: Bring the container/substance to hospital.
→ Call poison control. Do NOT induce vomiting unless instructed.
`,
    keywords: ["emergency", "heart attack", "stroke", "seizure", "bleeding", "breathing", "chest pain", "anaphylaxis", "overdose", "poisoning", "accident", "injury", "fracture", "burn", "fainting", "unconscious", "choking", "drowning"]
  },

  // ═══════════════════════════════════════════════════════════
  // COMMON DISEASES — India-specific prevalence
  // ═══════════════════════════════════════════════════════════
  diseases: {
    title: "Common Diseases — Symptoms, Diagnosis, Treatment",
    content: `
DIABETES MELLITUS TYPE 2:
- Symptoms: Increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, fatigue, blurred vision, slow wound healing, tingling in hands/feet
- Diagnosis: Fasting blood sugar ≥126 mg/dL, HbA1c ≥6.5%, Random sugar ≥200 mg/dL with symptoms
- Treatment: Metformin (first line), lifestyle modification (diet + exercise), monitor HbA1c every 3 months
- Indian context: Rice-heavy diet increases risk. Recommend portion control, millets, ragi, oats

HYPERTENSION (HIGH BLOOD PRESSURE):
- Symptoms: Usually asymptomatic ("silent killer"). Headaches, dizziness, nosebleeds in severe cases
- Diagnosis: ≥140/90 mmHg on two readings. Confirm with 24-hour ambulatory BP monitoring
- Treatment: Lifestyle (reduce salt <5g/day, exercise, weight loss). Drugs: Amlodipine, Telmisartan, Metoprolol
- Target: <130/80 for most adults

THYROID DISORDERS:
HYPOTHYROIDISM: Fatigue, weight gain, constipation, dry skin, hair fall, depression, menstrual irregularity
- Diagnosis: TSH elevated (>4.5 mIU/L), Free T4 low
- Treatment: Levothyroxine 25-200 mcg/day, empty stomach 30 min before breakfast
HYPERTHYROIDISM: Weight loss, anxiety, tremors, heat intolerance, palpitations, bulging eyes
- Diagnosis: TSH suppressed (<0.1), Free T4 elevated

ANEMIA (common in Indian women):
- Symptoms: Fatigue, weakness, pale skin, dizziness, shortness of breath, brittle nails
- Diagnosis: Hemoglobin <12 g/dL (women), <13 g/dL (men). Check iron studies, B12, folate
- Treatment: Iron supplements (Ferrous fumarate 210mg 2-3x/day), dietary iron (spinach, jaggery, dates, pomegranate), Vitamin C to enhance absorption

MIGRAINE:
- Symptoms: Unilateral throbbing headache, nausea/vomiting, sensitivity to light/sound, aura (visual disturbances) in some
- Diagnosis: Clinical. No test confirms it. Ruled out other causes if: sudden onset, fever, neurological deficit
- Treatment: Acute: Ibuprofen 400mg or Sumatriptan 50mg. Preventive: Propranolol, Amitriptyline

URINARY TRACT INFECTION (UTI):
- Symptoms: Burning urination, frequent urge, cloudy/foul-smelling urine, lower abdominal pain
- Diagnosis: Urine routine + culture. Positive nitrites/leukocytes on dipstick
- Treatment: Nitrofurantoin 100mg 2x/day for 5-7 days, or Norfloxacin 400mg 2x/day. Increase water intake

DENGUE FEVER:
- Symptoms: High fever (104°F), severe headache (retro-orbital), body/muscle pain, joint pain ("breakbone fever"), rash, nausea
- Diagnosis: Dengue NS1 antigen (day 1-5), Dengue IgM/IgG. Platelet count, CBC
- Treatment: NO aspirin/ibuprofen (bleeding risk). Paracetamol only. Hydration. Monitor platelets daily. If platelets <20,000 or bleeding → hospital

MALARIA:
- Symptoms: Cyclical fever (every 48-72 hours), chills/rigors, sweating, headache, vomiting
- Diagnosis: Rapid Diagnostic Test (RDT), Peripheral smear for malarial parasites
- Treatment: Artemisinin-based Combination Therapy (ACT) as per government protocol

TUBERCULOSIS (TB):
- Symptoms: Persistent cough >2 weeks, blood in sputum, night sweats, weight loss, fever
- Diagnosis: Sputum AFB smear, GeneXpert, Chest X-ray
- Treatment: DOTS regimen — 6 months: Isoniazid, Rifampicin, Pyrazinamide, Ethambutol (HRZE)

ASTHMA:
- Symptoms: Wheezing, chest tightness, shortness of breath, cough (worse at night/early morning)
- Diagnosis: Spirometry (FEV1/FVC <0.7), Peak flow variability >20%
- Treatment: Inhalers — Salbutamol (rescue), Budesonide (maintenance). Avoid triggers (dust, smoke, cold air)

GASTROESOPHAGEAL REFLUX DISEASE (GERD):
- Symptoms: Heartburn, acid taste in mouth, chest burning after meals, worse lying down
- Treatment: Lifestyle (elevate head while sleeping, avoid spicy/fried food, lose weight). Drugs: Pantoprazole 40mg before breakfast

DEPRESSION (Mental Health):
- Symptoms: Persistent sadness >2 weeks, loss of interest, sleep changes, appetite changes, fatigue, difficulty concentrating, feelings of worthlessness, suicidal thoughts
- Diagnosis: PHQ-9 questionnaire score ≥10
- Treatment: SSRIs (Sertraline 50mg, Escitalopram 10mg), psychological counseling, regular exercise

PCOS (Polycystic Ovary Syndrome — common in Indian women):
- Symptoms: Irregular periods, excess hair growth (hirsutism), acne, weight gain, difficulty conceiving
- Diagnosis: Ultrasound (polycystic ovaries), elevated testosterone, irregular cycles
- Treatment: Lifestyle (weight loss even 5-10% helps), Metformin, oral contraceptive pills for regulation, Inositol supplements

KIDNEY STONES (Nephrolithiasis):
- Symptoms: Severe flank pain (loin to groin), colicky pain, blood in urine (hematuria), nausea/vomiting, frequent/painful urination
- Diagnosis: CT KUB (most accurate), Ultrasound abdomen, Urine routine (RBCs), Serum calcium/uric acid
- Types: Calcium oxalate (most common 80%), Uric acid, Struvite, Cystine
- Treatment: Small stones (<5mm): Hydrate (3L/day), pain management (Diclofenac/Paracetamol), alpha blockers (Tamsulosin) to help pass. Large stones (>10mm): ESWL (lithotripsy), Ureteroscopy, PCNL
- Prevention: Drink plenty of water, reduce salt, limit oxalate-rich foods (spinach, nuts, chocolate), avoid excess calcium supplements

ARTHRITIS — OSTEOARTHRITIS (OA):
- Symptoms: Joint pain (weight-bearing joints: knee, hip), stiffness <30 min after rest, crepitus (grinding sound), reduced range of motion, swelling
- Diagnosis: Clinical + X-ray (joint space narrowing, osteophytes, subchondral sclerosis)
- Treatment: Weight loss, physiotherapy, Paracetamol (first line) → NSAIDs (Diclofenac) → Intra-articular steroid injection → Joint replacement (severe)
- Indian context: Common in elderly, worse with squatting/floor sitting

ARTHRITIS — RHEUMATOID ARTHRITIS (RA):
- Symptoms: Symmetrical joint swelling (hands, wrists, feet), morning stiffness >30 min, fatigue, joint deformity over time
- Diagnosis: Rheumatoid Factor (RF), Anti-CCP antibodies, ESR/CRP elevated, X-ray (erosions)
- Treatment: DMARDs (Methotrexate 15mg/week + Folic acid), biologics (Adalimumab), steroids short-term
- Refer to Rheumatologist

ALLERGIC RHINITIS (Hay Fever):
- Symptoms: Sneezing, runny nose (clear discharge), nasal congestion, itchy eyes/nose/palate, watery eyes
- Diagnosis: Clinical. Skin prick test or specific IgE for allergen identification
- Treatment: Antihistamines (Cetirizine 10mg, Levocetirizine 5mg), nasal steroid sprays (Fluticasone, Mometasone), avoid allergens, nasal saline wash

URTICARIA (Hives):
- Symptoms: Raised, itchy welts on skin, can be small or large, come and go, angioedema (swelling of lips/eyelids)
- Diagnosis: Clinical. Usually no tests needed unless chronic (>6 weeks) → check thyroid, autoimmunity
- Treatment: Antihistamines (Cetirizine 10mg — may need 2-4x/day), avoid triggers (heat, tight clothes, NSAIDs, certain foods). Chronic: Montelukast, Omalizumab

ECZEMA (Atopic Dermatitis):
- Symptoms: Itchy, dry, red, cracked skin. Common in folds (elbow, behind knee, neck). Worse in winter/dry weather
- Diagnosis: Clinical. Personal/family history of allergies/asthma
- Treatment: Moisturize daily (Emollient creams), mild steroid cream (Hydrocortisone 1%) for flares, avoid soap (use syndet bars), cotton clothes, antihistamines for itching

PSORIASIS:
- Symptoms: Thick, red, scaly patches (silver-white scales). Common: scalp, elbows, knees, lower back. Itchy, can bleed when scratched
- Diagnosis: Clinical. Auspitz sign (pinpoint bleeding when scale removed)
- Treatment: Moisturizers, topical steroids (Betamethasone), Vitamin D analogues (Calcipotriol), Coal tar shampoos (for scalp). Severe: Methotrexate, Phototherapy, Biologics

ACNE (Common in Indian teenagers):
- Symptoms: Whiteheads, blackheads, papules, pustules, nodules. Face, chest, back
- Diagnosis: Clinical grading (mild/moderate/severe)
- Treatment: Mild: Benzoyl peroxide 2.5-5% + topical Retinoid (Adapalene 0.1%). Moderate: Add oral Doxycycline/Minocycline. Severe: Isotretinoin (dermatologist only). Daily face wash with Salicylic acid cleanser. Do NOT pick/squeeze

FUNGAL INFECTIONS (Very common in India — monsoon/humidity):
- Symptoms: Itching, red scaly patches, ring-shaped lesions (tinea corporis), white patches in groin (tinea cruris), foot itching (tinea pedis/athlete's foot)
- Diagnosis: Clinical, KOH mount (skin scraping under microscope)
- Treatment: Topical antifungals (Clotrimazole cream, Terbinafine cream) x 2-4 weeks. Oral antifungals (Fluconazole/Griseofulvin) for extensive/severe. Keep area dry, cotton underwear, avoid sharing towels

SKIN INFECTIONS (Bacterial):
- Impetigo: Honey-colored crusts, common in children. Treatment: Mupirocin cream or oral Flucloxacillin
- Cellulitis: Red, hot, swollen, painful skin. Treatment: Oral Flucloxacillin/Cephalexin. If severe → IV antibiotics
- Boils/Carbuncles: Deep painful lumps with pus. Treatment: Warm compress, drainage if large, oral antibiotics

EYE PROBLEMS — CONJUNCTIVITIS (Pink Eye):
- Symptoms: Red eye, watering, discharge (clear viral, yellow-green bacterial), crusting of eyelids, itching
- Diagnosis: Clinical. Slit lamp exam if persistent
- Treatment: Viral: Self-limiting (7-10 days), artificial tears. Bacterial: Antibiotic drops (Moxifloxacin, Tobramycin). Allergic: Antihistamine drops (Olopatadine). Hygiene: Wash hands, don't share towels/pillows

EYE PROBLEMS — DRY EYE:
- Symptoms: Gritty/sandy feeling, burning, redness, blurred vision (improves with blinking), worse after screen use
- Diagnosis: Schirmer test, Tear break-up time (TBUT)
- Treatment: Preservative-free artificial tears (Carmellose, Hypromellose), 20-20-20 rule (every 20 min look 20 feet away for 20 sec), humidifier, omega-3 supplements, reduce AC exposure

EYE PROBLEMS — COMPUTER VISION SYNDROME:
- Symptoms: Eye strain, headache, blurred vision, dry eyes, neck/shoulder pain after prolonged screen use
- Treatment: 20-20-20 rule, proper screen distance (arm's length), screen brightness matching room, blinking exercises, anti-glare screen, proper sitting posture

EYE PROBLEMS — STYE (Hordeolum):
- Symptoms: Painful red lump on eyelid edge, swollen, tender
- Treatment: Warm compress 10-15 min 3-4x/day (helps drain), do NOT squeeze. Usually resolves in 7-10 days. If persists >2 weeks or vision affected → ophthalmologist

ENT — EAR INFECTION (Acute Otitis Media):
- Symptoms: Ear pain (otalgia), fever, reduced hearing, sometimes discharge
- Diagnosis: Otoscopy (red/bulging eardrum)
- Treatment: Pain relief (Paracetamol/Ibuprofen), antibiotic drops (Ciprofloxacin + Dexamethasone). Severe: Oral antibiotics (Amoxicillin)

ENT — SINUSITIS:
- Symptoms: Facial pain/pressure (forehead, cheeks, around eyes), nasal congestion, thick yellow-green discharge, post-nasal drip, reduced smell
- Diagnosis: Clinical. CT sinuses if chronic. X-ray ( Waters view)
- Treatment: Acute (<2 weeks): Nasal saline wash, nasal steroid spray (Mometasone), decongestant (Xylometazoline 0.1% — max 5 days), antibiotics if bacterial (Amoxicillin-Clavulanate). Chronic (>12 weeks): ENT referral, possible FESS surgery

ENT — TONSILLITIS:
- Symptoms: Sore throat, difficulty swallowing, fever, enlarged tonsils (white/yellow spots), neck lymph node swelling
- Diagnosis: Clinical, Throat swab (for Strep throat — Rapid ASO test)
- Treatment: Viral: Supportive (warm saline gargles, paracetamol, fluids). Bacterial (Strep): Antibiotics (Amoxicillin 5-day course or Azithromycin 3-day). Recurrent: Tonsillectomy (ENT surgeon)

ENT — TINNITUS (Ringing in ears):
- Symptoms: Ringing, buzzing, hissing sound in ears without external source. Can be constant or intermittent
- Diagnosis: Clinical, Audiometry, Tympanometry
- Treatment: Identify cause (earwax, infection, noise exposure, medication). Sound therapy, hearing aids if hearing loss, avoid silence/quiet rooms

GASTRO — IRRITABLE BOWEL SYNDROME (IBS):
- Symptoms: Abdominal cramping, bloating, diarrhea and/or constipation (alternating), mucus in stool, relief after bowel movement
- Diagnosis: Clinical (Rome IV criteria). No alarm features (bleeding, weight loss, anemia)
- Treatment: Dietary (FODMAP diet, increase fiber gradually), stress management, antispasmodics (Mebeverine, Dicyclomine), probiotics, Loperamide for diarrhea-predominant

GASTRO — PEPTIC ULCER DISEASE:
- Symptoms: Burning epigastric pain, worse on empty stomach/night, relieved by antacids, bloating, nausea
- Diagnosis: Upper GI endoscopy (gold standard), H. pylori test (urea breath test/stool antigen)
- Treatment: Proton pump inhibitors (Pantoprazole 40mg x 8 weeks), H. pylori triple therapy (if positive: PPI + Amoxicillin + Clarithromycin x 14 days)

GASTRO — DIARRHEA (Acute):
- Symptoms: Loose/watery stools >3x/day, cramps, urgency, sometimes fever/blood
- Diagnosis: Stool routine, stool culture if persistent
- Treatment: ORS (most important), zinc supplementation (children: 20mg/day x 10-14 days), probiotics, Loperamide (adults only, NOT children), BRAT diet (bananas, rice, apples, toast). Avoid dairy. If bloody diarrhea or >3 days → doctor

HEMORRHOIDS (Piles):
- Symptoms: Painless bleeding during/after bowel movement (bright red blood), prolapse (lump coming out), itching, pain if thrombosed
- Diagnosis: Per-rectal examination, Proctoscopy, Colonoscopy if >40 or alarm symptoms
- Treatment: High-fiber diet, stool softeners (Isabgol/psyllium husk), Sitz baths, topical ointment (Lidocaine + Hydrocortisone suppositories). Grade III-IV: Surgery (MIPH/Laser)

HERNIA (Inguinal/Groin):
- Symptoms: Bulge in groin/scrotum area, worse on standing/coughing, reducible (can push back in), pain/discomfort
- Diagnosis: Clinical examination, Ultrasound
- Treatment: Surgical repair (mesh repair — TEP/TAPP) is the only definitive treatment. Trusses (belt) are temporary. Risk: Incarceration/strangulation if untreated → emergency

GALLSTONES (Cholelithiasis):
- Symptoms: Right upper abdominal pain (biliary colic), worse after fatty meals, radiates to right shoulder, nausea, bloating. Asymptomatic in many
- Diagnosis: Ultrasound abdomen (95% sensitive), LFT may be elevated
- Treatment: Asymptomatic: No treatment needed. Symptomatic: Laparoscopic Cholecystectomy (gold standard). Pain: NSAIDs, antispasmodics

APPENDICITIS:
- Symptoms: Pain starts around umbilicus → moves to right lower abdomen (McBurney's point), nausea, vomiting, low-grade fever, loss of appetite, pain worsens on walking/coughing
- Diagnosis: Clinical (Rovsing's sign, rebound tenderness), CBC (WBC elevated), CT abdomen (most accurate)
- Treatment: Emergency surgery (Appendectomy — laparoscopic). Do NOT give painkillers before diagnosis (masks symptoms). Do NOT eat/drink

THYROID — GOITRE:
- Symptoms: Visible/enlarged neck swelling, difficulty swallowing, hoarse voice, sometimes breathing difficulty
- Diagnosis: Ultrasound neck, Thyroid function tests, FNAC (if nodule)
- Treatment: Depends on cause — Euthyroid goitre may need surgery if large. Toxic goitre: Anti-thyroid drugs, radioactive iodine, surgery

VITAMIN D DEFICIENCY (Very common in India):
- Symptoms: Bone pain (especially back), muscle weakness, fatigue, frequent falls, mood changes
- Diagnosis: 25-OH Vitamin D level. Normal >30 ng/mL. Deficient <20. Severe <10
- Treatment: Severe deficiency: 60,000 IU weekly x 8-12 weeks, then maintenance 1000-2000 IU/day. Take with fatty food for absorption. Calcium supplements alongside. Sunlight 15-20 min/day (arms and face exposed)

VITAMIN B12 DEFICIENCY (Very common in vegetarians):
- Symptoms: Fatigue, weakness, tingling/numbness in hands and feet, memory problems, mood changes, glossitis (smooth tongue)
- Diagnosis: Serum B12 level (<200 pg/mL deficient), MCV elevated (macrocytic anemia)
- Treatment: Oral supplementation (Methylcobalamin 1000mcg/day or weekly). Severe: IM injections. Long-term in vegetarians. Fortified foods (plant milk, nutritional yeast)
`,
    keywords: ["diabetes", "blood pressure", "hypertension", "thyroid", "anemia", "migraine", "uti", "infection", "dengue", "malaria", "tb", "tuberculosis", "asthma", "gerd", "acid reflux", "depression", "pcos", "sugar", "cholesterol", "kidney stone", "kidney stones", "renal stone", "stone", "arthritis", "joint pain", "joint", "knee pain", "back pain", "allergy", "allergies", "allergic", "rhinitis", "hives", "urticaria", "eczema", "dermatitis", "skin", "psoriasis", "acne", "pimple", "pimples", "fungal", "ringworm", "tinea", "eye", "eyes", "conjunctivitis", "pink eye", "dry eye", "stye", "ear", "ear infection", "sinus", "sinusitis", "tonsil", "tonsillitis", "tinnitus", "ringing ears", "ibs", "irritable bowel", "ulcer", "peptic ulcer", "diarrhea", "loose motion", "piles", "hemorrhoids", "hernia", "hernia groin", "gallstone", "gallstones", "appendicitis", "appendix", "vitamin d", "vitamin b12", "b12 deficiency", "goitre", "goiter", "neck swelling", "computer vision", "screen time", "eye strain"]
  },

  // ═══════════════════════════════════════════════════════════
  // COMMON DRUGS — Indian market names + generic
  // ═══════════════════════════════════════════════════════════
  drugs: {
    title: "Common Medications — Dosage, Interactions, Warnings",
    content: `
PARACETAMOL (Crocin, Dolo, Calpol):
- Dose: 500mg-1g every 4-6 hours (max 4g/day adults)
- Used for: Fever, mild-moderate pain
- Warning: Liver damage if overdose. Avoid with alcohol. Do NOT exceed 4g/day

IBUPROFEN (Brufen, Combiflam, Ibufen):
- Dose: 200-400mg every 6-8 hours
- Used for: Pain, inflammation, fever
- Warning: Avoid with stomach ulcers, kidney disease, pregnancy (3rd trimester). Take with food

AMOXICILLIN (Amoxicillin, Mox 500):
- Dose: 250-500mg every 8 hours for 5-7 days
- Used for: Bacterial infections (respiratory, urinary, skin)
- Warning: Complete full course. Allergic reaction possible (rash, swelling). Do NOT use for viral infections

AZITHROMYCIN (Azithral, Zithromax):
- Dose: 500mg day 1, then 250mg x 4 days (3-day or 5-day course)
- Used for: Respiratory infections, STIs
- Warning: Take on empty stomach. Can cause QT prolongation

CETIRIZINE (Cetzine, Alerid):
- Dose: 10mg once daily
- Used for: Allergies, sneezing, runny nose, itching
- Warning: May cause drowsiness. Avoid driving

OMEPRAZOLE/PANTOPRAZOLE (Omez, Pantop):
- Dose: Omeprazole 20mg or Pantoprazole 40mg before breakfast
- Used for: Acidity, GERD, stomach ulcers
- Warning: Long-term use (>8 weeks) may reduce calcium/magnesium absorption

METFORMIN (Glycomet, Gluconorm):
- Dose: Start 500mg with meals, increase to 500mg 2-3x/day
- Used for: Type 2 Diabetes (first-line)
- Warning: Take with food (reduces GI side effects). Avoid if kidney function is poor (eGFR <30). Rare: Lactic acidosis

AMLODIPINE (Amlodac, Amlopin):
- Dose: 5-10mg once daily
- Used for: Hypertension, angina
- Warning: Ankle swelling, dizziness common initially

SERRATIOPEPTIDASE (Serra, Serratio):
- Dose: 10mg twice daily
- Used for: Anti-inflammatory, post-surgical swelling
- Warning: May increase bleeding risk with blood thinners

DICLOFENAC (Voveran, Cataflam):
- Dose: 50mg 2-3x/day with food
- Used for: Pain, inflammation, arthritis
- Warning: GI bleeding risk. Avoid with kidney disease. Use lowest effective dose

DOLO-650: Paracetamol 650mg — same as above for paracetamol
PAN 40 (Pantoprazole 40mg): Same as above for pantoprazole
NEUROBION/Becosules: B-complex vitamins. Generally safe. For fatigue, nerve health
ORS (Oral Rehydration Salts): For dehydration (diarrhea, vomiting, heat). Mix 1 packet in 1L water. Sip frequently

FLUOXACILLIN (Floxacillin, Floxpen):
- Dose: 500mg every 6 hours for 5-7 days
- Used for: Skin infections, cellulitis, boils, bone infections
- Warning: Take on empty stomach

DOXYCYCLINE (Doxylar, Doxynil):
- Dose: 100mg 1-2x/day
- Used for: Acne, respiratory infections, STIs, malaria prophylaxis
- Warning: Avoid in pregnancy, children <8. Take with full glass of water, stay upright 30 min. Sun sensitivity — use sunscreen

CLARITHROMycin (Clarith, Klaricid):
- Dose: 250-500mg every 12 hours for 7-14 days
- Used for: H. pylori (stomach ulcer), respiratory infections
- Warning: Drug interactions. Take with or without food

TERBINAFINE (Terbinafine, Lamisil):
- Dose: 250mg/day x 2-4 weeks (fungal skin), 6 weeks (nails)
- Used for: Fungal infections (ringworm, athlete's foot, nail fungus)
- Warning: Monitor liver function if prolonged use

CEFIXIME (Cefix, Taxim-O):
- Dose: 200mg every 12 hours for 5-10 days
- Used for: UTI, respiratory infections, typhoid
- Warning: Complete full course. May cause diarrhea

NORFLOXACIN (Norflox, Noroxin):
- Dose: 400mg every 12 hours for 3-7 days
- Used for: UTI, diarrhea
- Warning: Avoid in pregnancy. Take on empty stomach. Sun sensitivity

MONTELUKAST (Montair, Montecair):
- Dose: 10mg once daily at bedtime
- Used for: Asthma, allergic rhinitis, exercise-induced bronchospasm
- Warning: Not for acute attacks. For maintenance therapy

LEVOCETIRIZINE (Xyzal, L-Cet):
- Dose: 5mg once daily at bedtime
- Used for: Allergies, urticaria, rhinitis
- Warning: Less sedating than cetirizine. Safe for long-term use in chronic allergies

OMEBEST/OMEE: Omeprazole 20mg — same as above
ASPIRIN (Low-dose 75mg): For heart attack prevention (blood thinner). Take with food. Avoid in children <16 (Reye's syndrome)
WARFARIN/CLOPIDOGREL: Blood thinners. Monitor INR regularly. Avoid extra bleeding risk.
`,
    keywords: ["medicine", "drug", "tablet", "capsule", "dose", "dosage", "paracetamol", "ibuprofen", "antibiotic", "allergy", "cetirizine", "omeprazole", "metformin", "prescription", "medication", "pill", "side effect", "terbinafine", "fluoxacillin", "doxycycline", "ceftriaxone", "azithromycin", "antifungal", "fluconazole"]
  },

  // ═══════════════════════════════════════════════════════════
  // DIAGNOSTIC QUESTIONS — What doctors ask
  // ═══════════════════════════════════════════════════════════
  diagnosticQuestions: {
    title: "Clinical History-Taking — Doctor's Questioning Framework",
    content: `
When a patient describes symptoms, systematically ask about:

CHEST PAIN:
1. Where exactly is the pain? (center, left side, right side)
2. Does it radiate? (to arm, jaw, back?)
3. What makes it worse? (breathing, movement, eating, lying down?)
4. What makes it better? (rest, antacids, position change?)
5. When did it start? How long does each episode last?
6. Any sweating, nausea, breathlessness with it?
7. Any history of diabetes, hypertension, smoking?
8. Any family history of heart disease?

HEADACHE:
1. Where is the pain? (front, back, one side, all over?)
2. Is it throbbing, pressing, or stabbing?
3. When did it start? How long has it lasted?
4. Any triggers? (stress, screens, food, sleep changes?)
5. Any nausea, vomiting, light sensitivity?
6. Any visual changes before the headache? (aura)
7. Any fever, stiff neck, or confusion?
8. Any recent head injury?

ABDOMINAL PAIN:
1. Where exactly? (upper, lower, right, left?)
2. Is it constant or cramping/intermittent?
3. Relation to meals? (before/after eating?)
4. Any vomiting? What color? (blood = emergency)
5. Bowel movements? (constipation, diarrhea, blood in stool?)
6. Last menstrual period (for women)?
7. Any burning sensation? (ulcer/acid)
8. Any fever?

FEVER:
1. How high? How long?
2. Pattern? (continuous, intermittent, comes and goes?)
3. Any chills/rigors (shaking)?
4. Any rash?
5. Any cough, sore throat, runny nose?
6. Any pain while urinating?
7. Any travel history? (malaria zone?)
8. Any body pain, headache, joint pain?
9. Any recent surgery or hospitalization?

JOINT PAIN:
1. Which joints? (symmetrical = rheumatoid, large joints = osteoarthritis)
2. Is it swollen, red, hot?
3. Morning stiffness? How long does it last?
4. Better or worse with movement?
5. Any rash, eye dryness, mouth ulcers? (autoimmune)

SKIN RASH:
1. When did it start?
2. Any new soap, detergent, jewelry, food, medicine?
3. Is it itchy, painful, or both?
4. Where did it start? Is it spreading?
5. Any fever with it?
6. Any blisters, pus, or oozing?

BACK PAIN:
1. Where exactly? (lower back, upper back, neck?)
2. Does it radiate to legs/buttocks? (sciatica)
3. Worse with sitting, standing, bending?
4. Any trauma/ injury?
5. Any morning stiffness?
6. Any numbness/tingling in legs?
7. Any bladder/bowel changes? (cauda equina = emergency)

KIDNEY STONE PAIN:
1. Where is the pain? (flank, lower abdomen, groin?)
2. Is it colicky (comes and goes in waves)?
3. Any blood in urine?
4. Any burning during urination?
5. Any nausea/vomiting?
6. Any previous stones?
7. How much water do you drink daily?

SKIN / DERMATOLOGY:
1. When did it start?
2. Is it itchy, painful, or both?
3. Any new soap, detergent, jewelry, food, medicine?
4. Where did it start? Is it spreading?
5. Any fever with it?
6. Any blisters, pus, or oozing?
7. Has it been treated before? What worked/didn't?
8. Is it worse in certain seasons?

EYE PROBLEMS:
1. Which eye? Both or one?
2. Redness, pain, discharge, blurred vision?
3. How long has this been going on?
4. Any trauma or foreign body?
5. Screen time hours per day?
6. Any contact lens use?
7. Any recent illness?

GENERAL HISTORY FRAMEWORK (SOCRATES for pain):
S - Site: Where?
O - Onset: When? Sudden or gradual?
C - Character: What type of pain? (sharp, dull, burning)
R - Radiation: Does it spread anywhere?
A - Associated symptoms: What else?
T - Timing: Constant or intermittent? How long?
E - Exacerbating/relieving factors: What makes it better/worse?
S - Severity: Rate 1-10

ALWAYS ASK:
- Any medications currently taking?
- Any allergies?
- Any past medical history? (diabetes, hypertension, asthma, TB, surgeries)
- Family history? (heart disease, diabetes, cancer)
- Smoking/alcohol history?
- For women: Last menstrual period, any possibility of pregnancy?
`,
    keywords: ["diagnosis", "examination", "check", "what do i have", "what's wrong", "analyse", "analyze", "symptoms", "history"]
  },

  // ═══════════════════════════════════════════════════════════
  // REPORT INTERPRETATION — Lab tests, imaging, prescriptions
  // ═══════════════════════════════════════════════════════════
  reportInterpretation: {
    title: "Medical Report Interpretation Guide",
    content: `
BLOOD TESTS — COMPLETE BLOOD COUNT (CBC):
Hemoglobin: Normal 12-16 g/dL (women), 13-17 g/dL (men). Low = anemia. High = dehydration, polycythemia
WBC Count: Normal 4,000-11,000/μL. High = infection, leukemia. Low = immune suppression
Platelets: Normal 1,50,000-4,00,000/μL. Low = dengue, bone marrow issues. High = infection, inflammation
Neutrophils: Normal 40-70%. High = bacterial infection. Low = viral, drug reaction
Lymphocytes: Normal 20-40%. High = viral infection, chronic infection
Eosinophils: Normal 1-6%. High = allergy, parasitic infection

LIVER FUNCTION TEST (LFT):
SGOT (AST): Normal 5-40 U/L. High = liver damage, heart attack, muscle injury
SGPT (ALT): Normal 7-56 U/L. High = liver damage (more specific to liver than SGOT)
ALP: Normal 44-147 U/L. High = liver/bone disease
Bilirubin Total: Normal 0.1-1.2 mg/dL. High = jaundice
Albumin: Normal 3.5-5.0 g/dL. Low = liver disease, malnutrition, kidney disease

KIDNEY FUNCTION TEST (KFT/RFT):
Blood Urea: Normal 15-40 mg/dL. High = kidney disease, dehydration
Serum Creatinine: Normal 0.7-1.3 mg/dL (men), 0.6-1.1 mg/dL (women). High = kidney disease
eGFR: Normal >90 mL/min. <60 = chronic kidney disease. <15 = kidney failure
Uric Acid: Normal 3.5-7.2 mg/dL (men), 2.6-6.0 mg/dL (women). High = gout, kidney stones

BLOOD SUGAR:
Fasting: Normal <100 mg/dL. Pre-diabetes 100-125. Diabetes ≥126
Post-prandial (2hr): Normal <140. Pre-diabetes 140-199. Diabetes ≥200
HbA1c: Normal <5.7%. Pre-diabetes 5.7-6.4%. Diabetes ≥6.5%

LIPID PROFILE:
Total Cholesterol: Desirable <200 mg/dL
LDL (Bad): Optimal <100, Near optimal 100-129, High ≥160
HDL (Good): >40 (men), >50 (women). Higher is better
Triglycerides: Normal <150, Borderline 150-199, High ≥200
VLDL: Normal 5-40 mg/dL

THYROID:
TSH: Normal 0.4-4.0 mIU/L. High = hypothyroidism. Low = hyperthyroidism
Free T4: Normal 0.8-1.8 ng/dL

VITAMIN D:
Normal: >30 ng/mL. Deficient: <20. Severe: <10
Vitamin B12: Normal: 200-900 pg/mL. Deficient: <200

URINE ROUTINE:
pH: Normal 4.5-8.0
Sugar: Should be negative. Positive = diabetes
Protein: Should be negative. Positive = kidney disease, UTI
Leukocytes: Negative. Positive = UTI/infection
Nitrites: Negative. Positive = bacterial UTI
Blood: Should be negative. Positive = UTI, stones, kidney disease
Crystals: May indicate kidney stones (calcium oxalate, uric acid)

CHEST X-RAY INTERPRETATION:
- Clear lung fields = normal
- Consolidation (white patch) = pneumonia
- Hyperinflation = COPD/asthma
- Pleural effusion (blunted costophrenic angle) = fluid around lung
- Cardiomegaly (heart >50% of chest width) = heart failure
- TB: Upper lobe infiltrates, cavitation, lymph node enlargement

ECG INTERPRETATION:
- Normal sinus rhythm: Regular, 60-100 bpm, P wave before every QRS
- Tachycardia: Rate >100. Causes: fever, anxiety, anemia, thyrotoxicosis
- Bradycardia: Rate <60. Causes: heart block, medications, athletes
- ST elevation: Possible heart attack (MI)
- ST depression: Ischemia
- Atrial fibrillation: Irregularly irregular, no P waves

BLOOD PRESSURE INTERPRETATION:
- Normal: <120/80
- Elevated: 120-129/<80
- Stage 1 HTN: 130-139/80-89
- Stage 2 HTN: ≥140/90
- Hypertensive Crisis: >180/120 → seek emergency care
`,
    keywords: ["report", "test", "results", "blood test", "cbc", "lft", "kft", "sugar", "thyroid", "cholesterol", "ecg", "x-ray", "xray", "scan", "mri", "ultrasound", "urine", "hemoglobin", "creatinine", "sgot", "sgpt", "tsh", "vitamin d", "vitamin b12", "b12", "urea", "uric acid", "lipid"]
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN DIET & LIFESTYLE
  // ═══════════════════════════════════════════════════════════
  indianHealth: {
    title: "India-Specific Health Guidance",
    content: `
COMMON INDIAN HEALTH CONCERNS:
- Iron deficiency anemia (especially women): Include jaggery, spinach, dates, pomegranate, beetroot
- Vitamin D deficiency (indoor lifestyle): Sunlight 15-20 min/day, supplements (60K IU weekly if deficient)
- Vitamin B12 deficiency (vegetarians): Consider supplements, fortified foods
- Diabetes (rice-heavy diet): Replace white rice with brown rice, millets (ragi, jowar, bajra), quinoa
- Hypertension (high salt/pickles): Reduce salt to <5g/day, limit pickles, papad, chips

INDIAN FOOD MEDICINE:
- Turmeric (haldi): Anti-inflammatory. Add to warm milk at night
- Ginger (adrak): Nausea, cold, digestion. Fresh ginger tea
- Tulsi (holy basil): Immunity, respiratory. Chewing leaves or tea
- Ajwain (carom seeds): Bloating, gas, indigestion
- Methi (fenugreek): Blood sugar control. Soak seeds overnight, eat in morning
- Jeera (cumin): Digestion, bloating. Jeera water (boil, strain, drink)
- Dhania (coriander): Cooling, digestive. Fresh coriander chutney
- Elaichi (cardamom): Bloating, bad breath, heartburn

INDIAN MONSOON HEALTH:
- Waterborne diseases peak: Diarrhea, typhoid, hepatitis A, cholera
- Always drink boiled/filtered water
- Mosquito-borne: Dengue, malaria, chikungunya — use repellent, eliminate stagnant water
- Food hygiene critical: Avoid street food during monsoon

HEAT STROKE PREVENTION (Indian summers):
- Drink 3-4 liters water daily
- ORS when sweating heavily
- Avoid outdoor 12pm-4pm
- Wear light cotton clothes
- Signs: Body temp >40°C, confusion, no sweating → emergency

AIR POLLUTION (Indian cities):
- AQI >200: Wear N95 mask outdoors, use air purifier indoors
- Common issues: Asthma exacerbation, COPD, respiratory infections
- Steam inhalation daily, stay hydrated
`,
    keywords: ["diet", "food", "nutrition", "indian", "vegetarian", "veg", "weight", "exercise", "lifestyle", "home remedy", "gharelu", "monsoon", "summer", "pollution", "ayurveda"]
  },

  // ═══════════════════════════════════════════════════════════
  // MENTAL HEALTH
  // ═══════════════════════════════════════════════════════════
  mentalHealth: {
    title: "Mental Health — Recognition and Support",
    content: `
DEPRESSION:
- Screening: PHQ-9 (Patient Health Questionnaire). Score ≥10 = moderate depression
- Symptoms (≥5 for ≥2 weeks): Sad mood, loss of interest, weight changes, sleep changes, fatigue, worthlessness, difficulty concentrating, psychomotor changes, suicidal thoughts
- Treatment: Exercise (30 min/day equivalent to antidepressant), therapy (CBT), medication (SSRIs — Sertraline, Escitalopram)
- Suicidal thoughts → National Suicide Prevention Helpline: 9152987821 (iCall), Vandrevala Foundation: 1860-2662-345

ANXIETY DISORDERS:
- Generalized Anxiety: Excessive worry >6 months, restlessness, fatigue, difficulty concentrating, muscle tension, sleep problems
- Panic Attacks: Sudden intense fear, chest pain, palpitations, sweating, trembling, fear of dying
- Treatment: Deep breathing (4-7-8 technique), progressive muscle relaxation, therapy, SSRIs

INSOMNIA:
- Poor sleep hygiene: Screens before bed, irregular schedule, caffeine after 2pm
- Sleep hygiene: Fixed bedtime, dark room, no screens 1hr before bed, no caffeine after 2pm, cool room
- CBT-I (Cognitive Behavioral Therapy for Insomnia) is first-line treatment
- Avoid long-term sleeping pills (Zolpidem, Alprazolam)

STRESS MANAGEMENT:
- 4-7-8 Breathing: Inhale 4 sec, hold 7 sec, exhale 8 sec. Repeat 4 times
- Progressive muscle relaxation: Tense each muscle group 5 sec, release
- Regular exercise (even walking 20 min/day)
- Social connection
- Journaling
- Limit news/social media

CRISIS RESOURCES (India):
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345 (24/7)
- AASRA: 9820466726
- National Mental Health Helpline: 080-46110007
`,
    keywords: ["mental health", "depression", "anxiety", "stress", "sleep", "insomnia", "panic", "suicide", "sad", "lonely", "overthinking", "cant sleep", "mood"]
  }
};

/**
 * Search the knowledge base for relevant entries.
 * Returns matching content blocks ranked by keyword relevance.
 */
function searchKnowledge(query) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const results = [];

  for (const [key, entry] of Object.entries(knowledgeBase)) {
    const keywordMatches = entry.keywords.filter(kw =>
      queryLower.includes(kw) || queryWords.some(w => kw.includes(w))
    );

    if (keywordMatches.length > 0) {
      results.push({
        key,
        title: entry.title,
        content: entry.content,
        relevance: keywordMatches.length,
        matchedKeywords: keywordMatches,
      });
    }
  }

  // Sort by relevance (most keyword matches first)
  results.sort((a, b) => b.relevance - a.relevance);

  // Return top 3 most relevant entries
  return results.slice(0, 3);
}

/**
 * Build context string from knowledge base search results.
 */
function buildMedicalContext(query) {
  const results = searchKnowledge(query);
  if (results.length === 0) return '';

  const contextParts = results.map(r =>
    `--- ${r.title} ---\n${r.content.trim()}`
  );

  return `\n\nRELEVANT MEDICAL KNOWLEDGE:\n${contextParts.join('\n\n')}\n`;
}

module.exports = { knowledgeBase, searchKnowledge, buildMedicalContext };
