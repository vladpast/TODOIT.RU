<?php
/**
 * API: Отправка результатов диагностики в Telegram
 */

// Заголовки для CORS и JSON
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
$required = ['answers', 'score', 'risk_level'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: $field"]);
        exit;
    }
}

$contact = isset($data['contact']) ? $data['contact'] : [];
$answers = $data['answers'];
$score = $data['score'];
$riskLevel = $data['risk_level'];
$timestamp = isset($data['timestamp']) ? $data['timestamp'] : date('Y-m-d H:i:s');

// Telegram настройки
$token = '8411883305:AAF-NcMWZxqlT4qAHxd8YKiowJ2xy1bqr2k';
$chatId = '8411883305';

// Формирование сообщения
$message = "📋 *Новая заявка: Стратегическая диагностика ИТ*\n";
$message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$message .= "🕐 *Дата:* $timestamp\n\n";

if ($contact) {
    $message .= "👤 *Контактные данные:*\n";
    $message .= "• Имя: " . ($contact['name'] ?? 'не указано') . "\n";
    $message .= "• Телефон: " . ($contact['phone'] ?? 'не указан') . "\n\n";
}

$emoji = ['low' => '✅', 'medium' => '⚠️', 'high' => '🚨'];
$riskEmoji = $emoji[$riskLevel] ?? '❓';
$message .= "📊 *Результаты диагностики:*\n";
$message .= "• Уровень риска: $riskEmoji $riskLevel\n";
$message .= "• Баллы: $score / 22\n\n";

$message .= "📝 *Ответы на вопросы:*\n";
$answerTexts = [
    'yes' => '✅ Да',
    'partial' => '⚠️ Частично',
    'no' => '❌ Нет'
];
foreach ($answers as $i => $answer) {
    $num = $i + 1;
    $ans = $answer['answer'];
    $ansText = $answerTexts[$ans] ?? $ans;
    $message .= "$num. $ansText\n";
}

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
        'message' => 'Данные успешно отправлены в Telegram'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка отправки в Telegram',
        'details' => $result
    ]);
}
