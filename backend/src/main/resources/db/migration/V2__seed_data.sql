-- V2: seed data for development & demonstration

-- ============================================================
-- USERS (passwords are BCrypt of "Password@123")
-- BCrypt hash: $2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO
-- ============================================================
INSERT INTO users (email, password_hash, first_name, last_name, department, job_title, enabled)
VALUES
  ('recruiter1@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Sophie',   'Martin',    'RH',          'Responsable RH',        true),
  ('recruiter2@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Thomas',   'Dubois',    'IT',          'Lead Recruteur IT',     true),
  ('candidate1@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Jean',     'Dupont',    'Marketing',   'Chef de projet',        true),
  ('candidate2@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Marie',    'Leclerc',   'Finance',     'Analyste financière',   true),
  ('candidate3@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Ahmed',    'Benali',    'IT',          'Développeur Java',      true),
  ('candidate4@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Camille',  'Petit',     'IT',          'Développeuse Frontend', true),
  ('candidate5@recruitment.local', '$2a$10$PCsFY.o5lLCFZraDf5xBQOA9Q0uuSioJsKpkvFEnuUBC9GijOJtLO', 'Nicolas',  'Bernard',   'Logistique',  'Responsable logistique',true);

-- ============================================================
-- USER ROLES
-- ============================================================
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'recruiter1@recruitment.local' AND r.name = 'ROLE_RECRUITER';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'recruiter2@recruitment.local' AND r.name = 'ROLE_RECRUITER';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email IN (
  'candidate1@recruitment.local',
  'candidate2@recruitment.local',
  'candidate3@recruitment.local',
  'candidate4@recruitment.local',
  'candidate5@recruitment.local'
) AND r.name = 'ROLE_CANDIDATE';

-- ============================================================
-- JOB OFFERS
-- ============================================================
INSERT INTO job_offers (title, description, department, location, contract_type, required_skills, status, created_by, closes_at)
VALUES
  (
    'Développeur Angular Senior',
    'Nous recherchons un développeur Angular expérimenté pour rejoindre notre équipe produit. Vous serez responsable du développement de nouvelles fonctionnalités et de la maintenance de nos applications web.',
    'IT', 'Toulouse', 'CDI',
    'Angular, TypeScript, RxJS, HTML/CSS, REST API, Git',
    'OPEN',
    (SELECT id FROM users WHERE email = 'recruiter2@recruitment.local'),
    NOW() + INTERVAL '30 days'
  ),
  (
    'Développeur Java / Spring Boot',
    'Poste de développeur back-end Java dans une équipe Agile dynamique. Vous concevrez et développerez des APIs REST robustes.',
    'IT', 'Paris', 'CDI',
    'Java 17+, Spring Boot, JPA/Hibernate, PostgreSQL, Maven, Agile',
    'OPEN',
    (SELECT id FROM users WHERE email = 'recruiter2@recruitment.local'),
    NOW() + INTERVAL '25 days'
  ),
  (
    'Chef de projet IT',
    'Pilotage de projets informatiques en mode Scrum, coordination des équipes et suivi des livrables. Expérience minimum 3 ans souhaitée.',
    'IT', 'Lyon', 'CDI',
    'Gestion de projet, Scrum, MS Project, Communication, Leadership',
    'OPEN',
    (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
    NOW() + INTERVAL '20 days'
  ),
  (
    'Analyste Financier Senior',
    'Analyse des indicateurs financiers, production de reportings et support à la direction financière.',
    'Finance', 'Paris', 'CDI',
    'Excel avancé, SQL, SAP, Analyse financière, Comptabilité',
    'OPEN',
    (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
    NOW() + INTERVAL '15 days'
  ),
  (
    'Responsable Marketing Digital',
    'Définition et exécution de la stratégie marketing digital, gestion des campagnes SEO/SEA et réseaux sociaux.',
    'Marketing', 'Bordeaux', 'CDI',
    'SEO, Google Ads, Analytics, Content Marketing, CRM, Hubspot',
    'OPEN',
    (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
    NOW() + INTERVAL '10 days'
  ),
  (
    'Développeur Full Stack React/Node',
    'Développement d''applications web modernes avec React et Node.js dans un contexte startup innovant.',
    'IT', 'Toulouse', 'CDD',
    'React, Node.js, TypeScript, MongoDB, AWS, Docker',
    'CLOSED',
    (SELECT id FROM users WHERE email = 'recruiter2@recruitment.local'),
    NOW() - INTERVAL '5 days'
  );

-- ============================================================
-- APPLICATIONS
-- ============================================================
-- candidate3 (Ahmed, dev Java) → Offre Dev Angular + Offre Java
INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Développeur Angular Senior'),
  (SELECT id FROM users WHERE email = 'candidate3@recruitment.local'),
  'Bonjour, fort de 5 ans d''expérience en développement Java et ayant travaillé sur des projets Angular en entreprise, je souhaite rejoindre votre équipe IT.',
  'CV_Ahmed_Benali.pdf', 72.50, 'SHORTLISTED';

INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Développeur Java / Spring Boot'),
  (SELECT id FROM users WHERE email = 'candidate3@recruitment.local'),
  'Développeur Java senior avec une maîtrise de Spring Boot et une expérience confirmée en architecture microservices, je suis très motivé par ce poste.',
  'CV_Ahmed_Benali.pdf', 91.00, 'INTERVIEW_SCHEDULED';

-- candidate4 (Camille, dev Frontend) → Offre Angular
INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Développeur Angular Senior'),
  (SELECT id FROM users WHERE email = 'candidate4@recruitment.local'),
  'Développeuse frontend passionnée avec 3 ans d''expérience Angular, je souhaite évoluer dans un environnement challengeant.',
  'CV_Camille_Petit.pdf', 88.00, 'INTERVIEW_SCHEDULED';

-- candidate1 (Jean, Chef de projet) → Offre Chef de projet
INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Chef de projet IT'),
  (SELECT id FROM users WHERE email = 'candidate1@recruitment.local'),
  'Avec 4 ans d''expérience en gestion de projets IT et une certification PMP, je suis convaincu de pouvoir apporter une réelle valeur ajoutée.',
  'CV_Jean_Dupont.pdf', 85.50, 'ACCEPTED';

-- candidate2 (Marie, Finance) → Offre Analyste Financier
INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Analyste Financier Senior'),
  (SELECT id FROM users WHERE email = 'candidate2@recruitment.local'),
  'Analyste financière avec 6 ans d''expérience dans des grands groupes, maîtrisant SAP et la production de reportings consolidés.',
  'CV_Marie_Leclerc.pdf', 94.00, 'ACCEPTED';

-- candidate5 (Nicolas, Logistique) → Offre Marketing (rejeté)
INSERT INTO applications (offer_id, candidate_id, cover_letter, cv_file_name, matching_score, status)
SELECT
  (SELECT id FROM job_offers WHERE title = 'Responsable Marketing Digital'),
  (SELECT id FROM users WHERE email = 'candidate5@recruitment.local'),
  'Je souhaite me reconvertir dans le marketing digital et je suis très motivé pour apprendre rapidement.',
  'CV_Nicolas_Bernard.pdf', 31.00, 'REJECTED';

-- ============================================================
-- INTERVIEWS
-- ============================================================
INSERT INTO interviews (application_id, scheduled_at, location, mode, notes, status)
SELECT
  a.id,
  NOW() + INTERVAL '3 days',
  'Salle de conférence A - Siège Toulouse',
  'ON_SITE',
  'Entretien technique RH + Lead Dev. Préparer exercice live coding Angular.',
  'SCHEDULED'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate4@recruitment.local' AND o.title = 'Développeur Angular Senior';

INSERT INTO interviews (application_id, scheduled_at, location, mode, notes, status)
SELECT
  a.id,
  NOW() + INTERVAL '2 days',
  'Google Meet',
  'VIDEO',
  'Premier entretien de qualification. Vérification des compétences Spring Boot et JPA.',
  'SCHEDULED'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate3@recruitment.local' AND o.title = 'Développeur Java / Spring Boot';

INSERT INTO interviews (application_id, scheduled_at, location, mode, notes, status)
SELECT
  a.id,
  NOW() - INTERVAL '5 days',
  'Salle B2',
  'ON_SITE',
  'Entretien final avec DRH.',
  'DONE'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate1@recruitment.local' AND o.title = 'Chef de projet IT';

INSERT INTO interviews (application_id, scheduled_at, location, mode, notes, status)
SELECT
  a.id,
  NOW() - INTERVAL '7 days',
  'Teams',
  'VIDEO',
  'Entretien Direction Financière.',
  'DONE'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate2@recruitment.local' AND o.title = 'Analyste Financier Senior';

-- ============================================================
-- EVALUATIONS
-- ============================================================
INSERT INTO evaluations (application_id, evaluator_id, score, comments, decision)
SELECT
  a.id,
  (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
  88,
  'Excellent profil. Très bonne maîtrise des outils projet, communication claire et leadership démontré.',
  'HIRE'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate1@recruitment.local' AND o.title = 'Chef de projet IT';

INSERT INTO evaluations (application_id, evaluator_id, score, comments, decision)
SELECT
  a.id,
  (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
  95,
  'Profil exceptionnel. Maîtrise parfaite de SAP et excellente culture financière. Recommandé fortement.',
  'HIRE'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate2@recruitment.local' AND o.title = 'Analyste Financier Senior';

INSERT INTO evaluations (application_id, evaluator_id, score, comments, decision)
SELECT
  a.id,
  (SELECT id FROM users WHERE email = 'recruiter1@recruitment.local'),
  28,
  'Profil trop éloigné du poste. Pas d''expérience marketing digitale réelle.',
  'REJECT'
FROM applications a
JOIN users c ON a.candidate_id = c.id
JOIN job_offers o ON a.offer_id = o.id
WHERE c.email = 'candidate5@recruitment.local' AND o.title = 'Responsable Marketing Digital';

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Candidature reçue',
  'Votre candidature pour « Développeur Angular Senior » a bien été reçue.',
  'APPLICATION_SUBMITTED', false
FROM users WHERE email = 'candidate4@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Entretien planifié',
  'Un entretien est planifié dans 3 jours pour le poste « Développeur Angular Senior ».',
  'INTERVIEW_SCHEDULED', false
FROM users WHERE email = 'candidate4@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Candidature reçue',
  'Votre candidature pour « Développeur Java / Spring Boot » a bien été reçue.',
  'APPLICATION_SUBMITTED', true
FROM users WHERE email = 'candidate3@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Entretien planifié',
  'Un entretien vidéo est planifié dans 2 jours pour le poste « Développeur Java / Spring Boot ».',
  'INTERVIEW_SCHEDULED', false
FROM users WHERE email = 'candidate3@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Félicitations ! Candidature acceptée',
  'Nous avons le plaisir de vous informer que votre candidature pour « Chef de projet IT » a été retenue.',
  'APPLICATION_STATUS', false
FROM users WHERE email = 'candidate1@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Félicitations ! Candidature acceptée',
  'Votre candidature pour « Analyste Financier Senior » a été acceptée. Bienvenue dans l''équipe !',
  'APPLICATION_STATUS', false
FROM users WHERE email = 'candidate2@recruitment.local';

INSERT INTO notifications (user_id, title, message, type, read_flag)
SELECT id, 'Candidature non retenue',
  'Nous avons bien étudié votre candidature pour « Responsable Marketing Digital » mais ne pouvons pas y donner suite.',
  'APPLICATION_STATUS', true
FROM users WHERE email = 'candidate5@recruitment.local';
