$base = "http://localhost:8080"
$ok = 0; $fail = 0

function T($lbl, $method, $url, $body=$null, $token=$null, $exp=200) {
    $h = @{}
    if ($token) { $h["Authorization"] = "Bearer $token" }
    if ($body)  { $h["Content-Type"]  = "application/json" }
    try {
        $p = @{ Method=$method; Uri=$url; Headers=$h; ErrorAction="Stop" }
        if ($body) { $p["Body"] = $body }
        Invoke-RestMethod @p | Out-Null
        if ($exp -eq 200) { Write-Host "[OK]  $lbl => 200" -ForegroundColor Green; $script:ok++ }
        else              { Write-Host "[FAIL] $lbl => 200 (exp $exp)" -ForegroundColor Red; $script:fail++ }
    } catch {
        $c = $_.Exception.Response.StatusCode.value__
        if ($c -eq $exp) { Write-Host "[OK]  $lbl => $c" -ForegroundColor Green; $script:ok++ }
        else             { Write-Host "[FAIL] $lbl => $c (exp $exp)" -ForegroundColor Red; $script:fail++ }
    }
}

# ─── GET TOKENS ──────────────────────────────────────────────────────────────
$ar = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@recruitment.local","password":"Admin@12345"}'
$TA = $ar.token
$rr = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body '{"email":"recruiter1@recruitment.local","password":"Password@123"}'
$TR = $rr.token
$cr = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -ContentType "application/json" -Body '{"email":"candidate3@recruitment.local","password":"Password@123"}'
$TC = $cr.token
Write-Host "Tokens OK: Admin=$($TA.Length)c  Recruiter=$($TR.Length)c  Candidate=$($TC.Length)c" -ForegroundColor Yellow

# ─── 1. AUTH ─────────────────────────────────────────────────────────────────
Write-Host "`n=== 1. AUTH ===" -ForegroundColor Cyan
T "1.1  Ping"              "GET"  "$base/api/auth/ping"
T "1.2  Login Admin"       "POST" "$base/api/auth/login"    '{"email":"admin@recruitment.local","password":"Admin@12345"}'
T "1.3  Login Recruiter"   "POST" "$base/api/auth/login"    '{"email":"recruiter1@recruitment.local","password":"Password@123"}'
T "1.4  Login Candidate"   "POST" "$base/api/auth/login"    '{"email":"candidate3@recruitment.local","password":"Password@123"}'
T "1.5  Bad password"      "POST" "$base/api/auth/login"    '{"email":"admin@recruitment.local","password":"mauvais"}'  -exp 401
T "1.6  Unknown email"     "POST" "$base/api/auth/login"    '{"email":"inconnu@test.com","password":"Password@123"}'    -exp 401
$uniqueEmail = "test$(Get-Date -Format 'HHmmss')@test.com"
T "1.7  Register new"      "POST" "$base/api/auth/register" "{`"email`":`"$uniqueEmail`",`"password`":`"Password@123`",`"firstName`":`"N`",`"lastName`":`"T`",`"department`":`"IT`",`"jobTitle`":`"Dev`"}"
T "1.8  Duplicate email"   "POST" "$base/api/auth/register" '{"email":"candidate3@recruitment.local","password":"Password@123","firstName":"T","lastName":"T"}' -exp 400
T "1.9  Short password"    "POST" "$base/api/auth/register" '{"email":"t99@test.com","password":"123","firstName":"T","lastName":"T"}' -exp 400
T "1.10 No token"          "GET"  "$base/api/users/me"      -exp 401

# ─── 2. USER PROFILE ─────────────────────────────────────────────────────────
Write-Host "`n=== 2. USER PROFILE ===" -ForegroundColor Cyan
T "2.1  My profile (candidate)" "GET" "$base/api/users/me" -token $TC
T "2.2  My profile (admin)"     "GET" "$base/api/users/me" -token $TA

# ─── 3. ADMIN USERS ──────────────────────────────────────────────────────────
Write-Host "`n=== 3. ADMIN USERS ===" -ForegroundColor Cyan
T "3.1  List users"            "GET"    "$base/api/admin/users"                    -token $TA
T "3.2  Paginated users"       "GET"    "$base/api/admin/users?page=0&size=3"      -token $TA
T "3.3  Get user 1"            "GET"    "$base/api/admin/users/1"                  -token $TA
T "3.4  User not found 9999"   "GET"    "$base/api/admin/users/9999"               -token $TA -exp 404
T "3.5  Disable user 5"        "PATCH"  "$base/api/admin/users/5?enabled=false"    -token $TA
T "3.6  Enable user 5"         "PATCH"  "$base/api/admin/users/5?enabled=true"     -token $TA
T "3.7  Assign RECRUITER role" "POST"   "$base/api/admin/users/5/roles/ROLE_RECRUITER" -token $TA
T "3.8  Remove RECRUITER role" "DELETE" "$base/api/admin/users/5/roles/ROLE_RECRUITER" -token $TA
T "3.9  Candidate -> 403"      "GET"    "$base/api/admin/users"                    -token $TC -exp 403

# ─── 4. JOB OFFERS ───────────────────────────────────────────────────────────
Write-Host "`n=== 4. JOB OFFERS ===" -ForegroundColor Cyan
T "4.1  List all offers"       "GET" "$base/api/offers"                      -token $TC
T "4.2  Filter OPEN"           "GET" "$base/api/offers?status=OPEN"          -token $TC
T "4.3  Filter dept=IT"        "GET" "$base/api/offers?department=IT"        -token $TC
T "4.4  Keyword=Angular"       "GET" "$base/api/offers?keyword=Angular"      -token $TC
T "4.5  Combined filters"      "GET" "$base/api/offers?status=OPEN&department=IT&keyword=java" -token $TC
T "4.6  Offer detail id=1"     "GET" "$base/api/offers/1"                    -token $TC
T "4.7  Offer not found 9999"  "GET" "$base/api/offers/9999"                 -token $TC -exp 404
T "4.8  Create offer"          "POST" "$base/api/offers" '{"title":"Data Scientist","description":"Nous cherchons un Data Scientist.","department":"IT","location":"Paris","contractType":"CDI","requiredSkills":"Python,ML","status":"OPEN"}' -token $TR
T "4.9  Create offer no title" "POST" "$base/api/offers" '{"title":"","description":"desc"}' -token $TR -exp 400
T "4.10 Update offer 1"        "PUT"  "$base/api/offers/1" '{"title":"Dev Angular Senior (MAJ)","description":"MAJ","department":"IT","location":"Toulouse","contractType":"CDI","requiredSkills":"Angular","status":"OPEN"}' -token $TR
T "4.11 Close offer 1"         "PUT"  "$base/api/offers/1" '{"title":"Dev Angular Senior","description":"Ferme","department":"IT","location":"Toulouse","contractType":"CDI","requiredSkills":"Angular","status":"CLOSED"}' -token $TR

# Get the new offer id (find by title)
$offers = Invoke-RestMethod -Uri "$base/api/offers" -Headers @{Authorization="Bearer $TR"}
$newOfferId = ($offers.content | Where-Object { $_.title -eq "Data Scientist" } | Select-Object -First 1).id
if ($newOfferId) {
    T "4.12 Delete offer (new)" "DELETE" "$base/api/offers/$newOfferId" -token $TR
} else {
    Write-Host "[SKIP] 4.12 Delete offer (id not found)" -ForegroundColor Yellow
}
T "4.13 Candidate create -> 403" "POST" "$base/api/offers" '{"title":"Test","description":"Test"}' -token $TC -exp 403

# ─── 5. APPLICATIONS ─────────────────────────────────────────────────────────
Write-Host "`n=== 5. APPLICATIONS ===" -ForegroundColor Cyan
# candidate3 already applied to offer 1 & 2 (seed data), use offer 3 (Chef de projet IT)
if (-not $alreadyApplied2) {
    # Need a real file - create a small dummy PDF for testing
    $pdfBytes = [System.Text.Encoding]::ASCII.GetBytes("%PDF-1.4 test cv file")
    $tmpFile = "$env:TEMP\test_cv.pdf"
    [System.IO.File]::WriteAllBytes($tmpFile, $pdfBytes)

    # Use HttpClient for multipart
    Add-Type -AssemblyName System.Net.Http
    $client = New-Object System.Net.Http.HttpClient
    $client.DefaultRequestHeaders.Add("Authorization", "Bearer $TC")
    $form = New-Object System.Net.Http.MultipartFormDataContent
    $form.Add((New-Object System.Net.Http.StringContent("3")), "offerId")
    $form.Add((New-Object System.Net.Http.StringContent("Je suis motivé pour le poste de chef de projet")), "coverLetter")
    $fileStream = [System.IO.File]::OpenRead($tmpFile)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/pdf")
    $form.Add($fileContent, "cv", "test_cv.pdf")
    $resp5 = $client.PostAsync("$base/api/applications", $form).Result
    $fileStream.Close(); $client.Dispose()
    if ([int]$resp5.StatusCode -eq 200) { Write-Host "[OK]  5.1  Submit application => 200" -ForegroundColor Green; $script:ok++ }
    else { Write-Host "[FAIL] 5.1  Submit application => $([int]$resp5.StatusCode)" -ForegroundColor Red; $script:fail++ }
} else {
    Write-Host "[SKIP] 5.1  Submit application (already applied to offer 3)" -ForegroundColor Yellow
}

# 5.2 duplicate: candidate3 already applied to offer 1 from seed — send as multipart
Add-Type -AssemblyName System.Net.Http
$client2 = New-Object System.Net.Http.HttpClient
$client2.DefaultRequestHeaders.Add("Authorization", "Bearer $TC")
$form2 = New-Object System.Net.Http.MultipartFormDataContent
$form2.Add((New-Object System.Net.Http.StringContent("1")), "offerId")
$form2.Add((New-Object System.Net.Http.StringContent("Tentative double")), "coverLetter")
$pdfBytes2 = [System.Text.Encoding]::ASCII.GetBytes("%PDF-1.4 dummy")
$tmpFile2 = "$env:TEMP\test_cv2.pdf"
[System.IO.File]::WriteAllBytes($tmpFile2, $pdfBytes2)
$fs2 = [System.IO.File]::OpenRead($tmpFile2)
$fc2 = New-Object System.Net.Http.StreamContent($fs2)
$fc2.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/pdf")
$form2.Add($fc2, "cv", "test_cv2.pdf")
$resp52 = $client2.PostAsync("$base/api/applications", $form2).Result
$fs2.Close(); $client2.Dispose()
$code52 = [int]$resp52.StatusCode
if ($code52 -eq 400) { Write-Host "[OK]  5.2  Duplicate apply => 400" -ForegroundColor Green; $script:ok++ }
else { Write-Host "[FAIL] 5.2  Duplicate apply => $code52 (exp 400)" -ForegroundColor Red; $script:fail++ }
T "5.6  My applications"         "GET"  "$base/api/applications/me"              -token $TC
T "5.7  My apps paginated"       "GET"  "$base/api/applications/me?page=0&size=5" -token $TC
T "5.8  Apps by offer 1"         "GET"  "$base/api/applications/by-offer/1"      -token $TR
T "5.9  App detail id=1"         "GET"  "$base/api/applications/1"               -token $TR
T "5.10 Status UNDER_REVIEW"     "PATCH" "$base/api/applications/2/status" '{"status":"UNDER_REVIEW"}' -token $TR
T "5.11 Status SHORTLISTED"      "PATCH" "$base/api/applications/2/status" '{"status":"SHORTLISTED"}'  -token $TR
T "5.12 Status REJECTED"         "PATCH" "$base/api/applications/5/status" '{"status":"REJECTED"}'     -token $TR
T "5.14 Withdraw other -> 400"   "DELETE" "$base/api/applications/3"             -token $TC -exp 400
T "5.15 Candidate change status -> 403" "PATCH" "$base/api/applications/2/status" '{"status":"ACCEPTED"}' -token $TC -exp 403

# ─── 6. INTERVIEWS ───────────────────────────────────────────────────────────
Write-Host "`n=== 6. INTERVIEWS ===" -ForegroundColor Cyan
T "6.1  Schedule ON_SITE"        "POST" "$base/api/interviews" '{"applicationId":3,"scheduledAt":"2026-05-10T10:00:00","location":"Salle A","mode":"ON_SITE","notes":"Tech interview"}' -token $TR
T "6.2  Schedule VIDEO"          "POST" "$base/api/interviews" '{"applicationId":4,"scheduledAt":"2026-05-12T14:30:00","location":"Google Meet","mode":"VIDEO","notes":"Lien Meet"}' -token $TR
T "6.3  Schedule PHONE"          "POST" "$base/api/interviews" '{"applicationId":6,"scheduledAt":"2026-05-08T09:00:00","mode":"PHONE","notes":"Premier contact"}' -token $TR
T "6.4  App not found -> 404"    "POST" "$base/api/interviews" '{"applicationId":9999,"scheduledAt":"2026-05-10T10:00:00","mode":"ON_SITE"}' -token $TR -exp 404
T "6.5  By application id=1"     "GET"  "$base/api/interviews/by-application/1"  -token $TR
T "6.6  Status DONE"             "PATCH" "$base/api/interviews/1/status?status=DONE"      -token $TR
T "6.7  Status CANCELLED"        "PATCH" "$base/api/interviews/2/status?status=CANCELLED" -token $TR
T "6.8  Delete interview 3"      "DELETE" "$base/api/interviews/3"               -token $TR
T "6.9  Candidate schedule -> 403" "POST" "$base/api/interviews" '{"applicationId":1,"scheduledAt":"2026-05-10T10:00:00","mode":"ON_SITE"}' -token $TC -exp 403

# ─── 7. EVALUATIONS ──────────────────────────────────────────────────────────
Write-Host "`n=== 7. EVALUATIONS ===" -ForegroundColor Cyan
T "7.1  HIRE decision"           "POST" "$base/api/evaluations" '{"applicationId":3,"score":85,"comments":"Excellent","decision":"HIRE"}' -token $TR
T "7.2  REJECT decision"         "POST" "$base/api/evaluations" '{"applicationId":4,"score":40,"comments":"Profil insuffisant","decision":"REJECT"}' -token $TR
T "7.3  HOLD decision"           "POST" "$base/api/evaluations" '{"applicationId":6,"score":70,"comments":"En attente","decision":"HOLD"}' -token $TR
T "7.4  Score > 100 -> 400"      "POST" "$base/api/evaluations" '{"applicationId":2,"score":150,"comments":"Test","decision":"HIRE"}' -token $TR -exp 400
T "7.5  No applicationId -> 400" "POST" "$base/api/evaluations" '{"score":80,"comments":"Test","decision":"HIRE"}' -token $TR -exp 400
T "7.6  Evals by application 4"  "GET"  "$base/api/evaluations/by-application/4"  -token $TR
T "7.7  Candidate evals -> 403"  "GET"  "$base/api/evaluations/by-application/1"  -token $TC -exp 403

# ─── 8. NOTIFICATIONS ────────────────────────────────────────────────────────
Write-Host "`n=== 8. NOTIFICATIONS ===" -ForegroundColor Cyan
T "8.1  My notifications"        "GET"   "$base/api/notifications"                -token $TC
T "8.2  Notifications paginated" "GET"   "$base/api/notifications?page=0&size=5"  -token $TC
T "8.3  Unread count"            "GET"   "$base/api/notifications/unread-count"   -token $TC
# 8.4: get the first notification ID belonging to candidate3 dynamically
$myNotifs = try { Invoke-RestMethod -Uri "$base/api/notifications" -Headers @{Authorization="Bearer $TC"} } catch { $null }
$firstNotifId = if ($myNotifs -and $myNotifs.content -and $myNotifs.content.Count -gt 0) { $myNotifs.content[0].id } else { $null }
if ($firstNotifId) {
    T "8.4  Mark notif as read" "PATCH" "$base/api/notifications/$firstNotifId/read" -token $TC
} else {
    Write-Host "[SKIP] 8.4  Mark notif as read (no notifications found for candidate)" -ForegroundColor Yellow
}
T "8.5  Mark other user notif -> 404" "PATCH" "$base/api/notifications/999/read"  -token $TC -exp 404
T "8.6  Unread count after read" "GET"   "$base/api/notifications/unread-count"   -token $TC

# ─── 9. SWAGGER / ACTUATOR ───────────────────────────────────────────────────
Write-Host "`n=== 9. SWAGGER / ACTUATOR ===" -ForegroundColor Cyan
T "9.1  Swagger UI"              "GET" "$base/swagger-ui.html"
T "9.2  API Docs JSON"           "GET" "$base/v3/api-docs"
T "9.3  Actuator health"         "GET" "$base/actuator/health"

# ─── SUMMARY ─────────────────────────────────────────────────────────────────
Write-Host "`n================================================" -ForegroundColor White
Write-Host "  TOTAL: $($ok+$fail) tests | OK: $ok | FAIL: $fail" -ForegroundColor $(if ($fail -eq 0) {"Green"} else {"Yellow"})
Write-Host "================================================" -ForegroundColor White
