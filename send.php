<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'POST only']);
  exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$company = trim($_POST['company'] ?? '');
$budget  = trim($_POST['budget'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$name || !$email || !$message) {
  echo json_encode(['ok' => false, 'error' => 'Name, email, and message are required']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok' => false, 'error' => 'Invalid email address']);
  exit;
}

// ─── RECIPIENT ────────────────────────────────
$to_email = 'dublin@ad18pictures.com';
// ──────────────────────────────────────────────

$subject = "New enquiry from $name — $company";

$body = "
<html>
<body style='font-family:Inter,sans-serif;background:#f5f5f5;padding:32px'>
  <div style='max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px'>
    <h2 style='margin:0 0 24px;font-size:22px'>New Contact Enquiry</h2>
    <table style='width:100%;border-collapse:collapse'>
      <tr><td style='padding:8px 0;color:#888;width:100px'><strong>Name</strong></td><td>$name</td></tr>
      <tr><td style='padding:8px 0;color:#888'><strong>Email</strong></td><td><a href='mailto:$email'>$email</a></td></tr>
      <tr><td style='padding:8px 0;color:#888'><strong>Company</strong></td><td>$company</td></tr>
      <tr><td style='padding:8px 0;color:#888'><strong>Budget</strong></td><td>$budget</td></tr>
    </table>
    <hr style='border:none;border-top:1px solid #eee;margin:24px 0'>
    <h3 style='margin:0 0 8px;font-size:15px'>Message</h3>
    <p style='color:#444;line-height:1.7'>$message</p>
  </div>
</body>
</html>
";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: AD18Pictures <noreply@ad18pictures.com>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";

$ok = mail($to_email, $subject, $body, $headers);

// Fallback: log to file if mail fails
if (!$ok) {
  $log = fopen(__DIR__ . '/submissions.log', 'a');
  if ($log) {
    $entry = date('Y-m-d H:i:s') . " | $name | $email | $company | $budget | " . str_replace("\n", ' ', $message) . "\n";
    fwrite($log, $entry);
    fclose($log);
    $ok = true;
  }
}

echo json_encode(['ok' => $ok]);
