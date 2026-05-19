package com.recruitment.dto.cv;

import java.util.List;

public record CvAnalysisResponse(
    String name,
    int score,
    String decision,
    List<String> skills,
    String justification
) {}
