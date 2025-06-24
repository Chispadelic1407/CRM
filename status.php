<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
$envFile = file_get_contents('../../crm-twilio/.env');
$env = [];
foreach (explode("\n", $envFile) as $line) {
    if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

$response = [
    'status' => 'running',
    'message' => 'CRM Twilio Server is running via PHP',
    'timestamp' => date('c'),
    'environment' => [
        'phpVersion' => phpversion(),
        'platform' => php_uname('s'),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
    ],
    'configuration' => [
        'twilioConfigured' => !empty($env['TWILIO_ACCOUNT_SID']) && !empty($env['TWILIO_AUTH_TOKEN']),
        'geminiConfigured' => !empty($env['GEMINI_API_KEY']),
        'databaseConfigured' => !empty($env['DB_HOST']) && !empty($env['DB_USER']),
        'voiceWebhookUrl' => $env['VOICE_WEBHOOK_URL'] ?? ''
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
