package com.recruitment.service;

import com.recruitment.dto.cv.CvAnalysisRequest;
import com.recruitment.dto.cv.CvAnalysisResponse;
import com.recruitment.entity.Application;
import com.recruitment.exception.BusinessException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CvAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;
    private final CvTextExtractorService cvTextExtractorService;

    /**
     * Pool of known technical skills for keyword extraction.
     * Organized by category for maintainability.
     */
    private static final Set<String> KNOWN_SKILLS = Set.of(
        // Programming languages
        "java", "python", "javascript", "typescript", "c++", "c#", "php", "ruby",
        "go", "golang", "rust", "kotlin", "swift", "scala", "r", "matlab", "perl",
        "dart", "lua", "groovy", "vba", "assembly", "objective-c", "fortran",

        // Frontend
        "angular", "react", "vue", "vue.js", "react.js", "next.js", "nuxt.js",
        "svelte", "html", "css", "sass", "scss", "less", "tailwind", "bootstrap",
        "jquery", "webpack", "vite", "redux", "ngrx", "rxjs",

        // Backend & Frameworks
        "spring", "spring boot", "spring security", "spring data", "hibernate",
        "jpa", "node.js", "express", "express.js", "nestjs", "django", "flask",
        "fastapi", "laravel", "symfony", "rails", "ruby on rails", "asp.net",
        ".net", ".net core", "quarkus", "micronaut",

        // Databases
        "sql", "mysql", "postgresql", "postgres", "oracle", "mongodb", "redis",
        "elasticsearch", "cassandra", "dynamodb", "sqlite", "mariadb", "neo4j",
        "couchdb", "firebase", "supabase", "h2",

        // DevOps & Cloud
        "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "google cloud",
        "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "ci/cd",
        "nginx", "apache", "linux", "bash", "shell", "powershell",

        // Data & AI/ML
        "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
        "scikit-learn", "pandas", "numpy", "spark", "hadoop", "kafka",
        "data science", "big data", "power bi", "tableau", "etl",

        // Tools & Practices
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "agile", "scrum", "kanban", "tdd", "bdd", "devops", "microservices",
        "rest", "restful", "graphql", "grpc", "soap", "websocket",
        "maven", "gradle", "npm", "yarn", "pip",

        // Security
        "oauth", "oauth2", "jwt", "ssl", "tls", "keycloak", "ldap",

        // Mobile
        "android", "ios", "flutter", "react native", "ionic", "xamarin",

        // Testing
        "junit", "mockito", "selenium", "cypress", "jest", "mocha",
        "postman", "sonarqube", "jacoco",

        // Other
        "uml", "design patterns", "solid", "clean architecture",
        "api", "swagger", "openapi", "lombok", "flyway", "liquibase"
    );

    /** Multi-word skills sorted by length desc so longer matches are tried first. */
    private static final List<String> MULTI_WORD_SKILLS;
    private static final Set<String> SINGLE_WORD_SKILLS;

    static {
        MULTI_WORD_SKILLS = KNOWN_SKILLS.stream()
            .filter(s -> s.contains(" ") || s.contains(".") || s.contains("/"))
            .sorted(Comparator.comparingInt(String::length).reversed())
            .toList();
        SINGLE_WORD_SKILLS = KNOWN_SKILLS.stream()
            .filter(s -> !s.contains(" ") && !s.contains(".") && !s.contains("/"))
            .collect(Collectors.toSet());
    }

    public CvAnalysisResponse analyze(CvAnalysisRequest request) {
        String cvLower = request.cvText().toLowerCase();
        String jobLower = request.jobDescription().toLowerCase();

        String name = extractName(request.cvText());
        List<String> cvSkills = extractSkills(cvLower);
        List<String> jobSkills = extractSkills(jobLower);

        log.debug("CV skills detected: {}", cvSkills);
        log.debug("Job skills required: {}", jobSkills);

        int score = calculateScore(cvSkills, jobSkills);
        String decision = score >= 70 ? "ACCEPTED" : "REJECTED";
        String justification = buildJustification(cvSkills, jobSkills, score);

        return new CvAnalysisResponse(name, score, decision, cvSkills, justification);
    }

    /**
     * Extracts a candidate name from the first non-empty lines of the CV.
     * Heuristic: the first line that looks like a proper name (2-4 capitalized words).
     */
    String extractName(String cvText) {
        String[] lines = cvText.split("\\r?\\n");
        Pattern namePattern = Pattern.compile("^([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ]+(?:\\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ]+){1,3})$");

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            Matcher matcher = namePattern.matcher(trimmed);
            if (matcher.matches()) {
                return matcher.group(1);
            }
            // Also try: line is short (<60 chars) and mostly capitalized words
            if (trimmed.length() < 60 && !trimmed.contains("@") && !trimmed.contains(":")) {
                String[] words = trimmed.split("\\s+");
                if (words.length >= 2 && words.length <= 4) {
                    boolean allCapitalized = Arrays.stream(words)
                        .allMatch(w -> w.length() > 1 && Character.isUpperCase(w.charAt(0)));
                    if (allCapitalized) {
                        return trimmed;
                    }
                }
            }
        }
        return "Unknown";
    }

    /**
     * Extracts skills from text using the known skills dictionary.
     * Handles multi-word skills (e.g., "spring boot", "machine learning") first,
     * then single-word skills with word-boundary matching.
     */
    List<String> extractSkills(String text) {
        Set<String> found = new LinkedHashSet<>();
        String remaining = text;

        // First pass: multi-word / dotted skills
        for (String skill : MULTI_WORD_SKILLS) {
            if (remaining.contains(skill)) {
                found.add(skill);
                remaining = remaining.replace(skill, " "); // avoid partial re-match
            }
        }

        // Second pass: single-word skills with word boundaries
        for (String skill : SINGLE_WORD_SKILLS) {
            // Skip very short skills (e.g. "r") — too many false positives
            if (skill.length() < 2) continue;
            Pattern p = Pattern.compile("\\b" + Pattern.quote(skill) + "\\b");
            if (p.matcher(remaining).find()) {
                found.add(skill);
            }
        }

        return new ArrayList<>(found);
    }

    /**
     * Calculates a matching score (0–100) based on how many required job skills
     * are present in the candidate's CV.
     */
    int calculateScore(List<String> cvSkills, List<String> jobSkills) {
        if (jobSkills.isEmpty()) {
            return cvSkills.isEmpty() ? 0 : 50;
        }

        Set<String> cvSkillSet = new HashSet<>(cvSkills);
        long matched = jobSkills.stream().filter(cvSkillSet::contains).count();

        return (int) Math.round((double) matched / jobSkills.size() * 100);
    }

    /**
     * Builds a human-readable justification explaining the score.
     */
    String buildJustification(List<String> cvSkills, List<String> jobSkills, int score) {
        if (jobSkills.isEmpty()) {
            return "Aucune compétence spécifique détectée dans l'offre d'emploi. Évaluation manuelle recommandée.";
        }

        Set<String> cvSkillSet = new HashSet<>(cvSkills);

        List<String> matched = jobSkills.stream()
            .filter(cvSkillSet::contains)
            .toList();

        List<String> missing = jobSkills.stream()
            .filter(s -> !cvSkillSet.contains(s))
            .toList();

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Score de compatibilité : %d/100. ", score));
        sb.append(String.format("%d/%d compétences requises trouvées dans le CV. ", matched.size(), jobSkills.size()));

        if (!matched.isEmpty()) {
            sb.append("Compétences correspondantes : ").append(String.join(", ", matched)).append(". ");
        }
        if (!missing.isEmpty()) {
            sb.append("Compétences manquantes : ").append(String.join(", ", missing)).append(".");
        }

        return sb.toString();
    }

    /**
     * Analyze the CV already uploaded for a given application.
     * Reads the file from storage, extracts text, and compares with the job offer.
     */
    @Transactional(readOnly = true)
    public CvAnalysisResponse analyzeApplication(Long applicationId) throws IOException {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("Application " + applicationId + " not found"));

        if (app.getCvFilePath() == null) {
            throw new BusinessException("Aucun CV attaché à cette candidature.");
        }

        // Build job description from offer fields
        var offer = app.getOffer();
        StringBuilder jobDesc = new StringBuilder();
        jobDesc.append(offer.getTitle()).append("\n");
        if (offer.getDescription() != null) jobDesc.append(offer.getDescription()).append("\n");
        if (offer.getRequiredSkills() != null) jobDesc.append(offer.getRequiredSkills());

        // Extract text from stored CV file
        Path cvPath = fileStorageService.loadCvPath(app.getCvFilePath());
        String cvText = cvTextExtractorService.extractFromPath(cvPath, app.getCvFileName());

        CvAnalysisRequest request = new CvAnalysisRequest(cvText, jobDesc.toString());
        return analyze(request);
    }
}
