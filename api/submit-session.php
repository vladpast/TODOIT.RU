<?php
/**
 * API: Заявка на стратегическую сессию в Telegram
 */

// Заголовки для CORS и JSON
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Получение данных
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Валидация обязательных полей
$required = ['name', 'company', 'email', 'phone'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: $field"]);
        exit;
    }
}

$name = trim($data['name']);
$company = trim($data['company']);
$email = trim($data['email']);
$phone = trim($data['phone']);
$role = isset($data['role']) ? trim($data['role']) : '';
$interest = isset($data['interest']) ? trim($data['interest']) : '';
$comment = isset($data['comment']) ? trim($data['comment']) : '';
$source = isset($data['source']) ? trim($data['source']) : 'direct';
$timestamp = isset($data['timestamp']) ? $data['timestamp'] : date('Y-m-d H:i:s');

// Telegram настройки
$token = '8411883305:AAF-NcMWZxqlT4qAHxd8YKiowJ2xy1bqr2k';
$chatId = '-1005207209023';

// Карточки дляselect полей
$roleTexts = [
    'owner' => 'Собственник бизнеса',
    'ceo' => 'CEO / Генеральный директор',
    'cio' => 'CIO / ИТ-директор',
    'cfo' => 'CFO / Финансовый директор',
    'investor' => 'Инвестор',
    'board' => 'Член Совета директоров',
    'other' => 'Другое'
];

$interestTexts = [
    'itdue' => 'IT Due Diligence (оценка для сделки)',
    'advisory' => 'Стратегическое консультирование',
    'crisis' => 'Антикризисное управление ИТ',
    'governance' => 'Architecture & Governance',
    'other' => 'Другое'
];

// Формирование сообщения
$message = "🎯 *Новая заявка: Стратегическая сессия*\n";
$message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$message .= "🕐 *Дата:* $timestamp\n\n";

$message .= "👤 *Заявитель:*\n";
$message .= "• Имя: $name\n";
$message .= "• Компания: $company\n";
$message .= "• Email: $email\n";
$message .= "• Телефон: $phone\n";

if ($role) {
    $roleText = $roleTexts[$role] ?? $role;
    $message .= "• Роль: $roleText\n";
}

if ($interest) {
    $interestText = $interestTexts[$interest] ?? $interest;
    $message .= "• Интерес: $interestText\n";
}

if ($comment) {
    $message .= "\n📝 *Комментарий:*\n$comment\n";
}

$message .= "\n📍 *Источник:* $source\n";

// Отправка в Telegram
$url = "https://api.telegram.org/bot$token/sendMessage";
$postData = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'Markdown'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result && $result['ok']) {
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно отправлена в Telegram'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка отправки в Telegram',
        'details' => $result
    ]);
}
