<?php

$host = "localhost";
$port = "5432";
$dbname = "notes";
$user = "postgres";
$password = "";

function makeHttpRequest($url, $method = "GET", $data = null) {
    $options = [
        "http" => [
            "method" => $method,
            "header" => "Content-Type: application/json",
            "content" => json_encode($data),
        ],
    ];
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    return $result;
}

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname;user=$user;password=$password");
} catch (PDOException $e) {
    die("Ошибка подключения к базе данных: " . $e->getMessage());
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $pdo->query("SELECT * FROM notes");
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $statsUrl = "http://localhost:8001/stats";
    $statsResponse = makeHttpRequest($statsUrl);
    $stats = json_decode($statsResponse, true);

    //$stmt = $pdo->prepare("DELETE FROM notes");
    //$stmt->execute();
    //$resetStatsUrl = "http://localhost:8001/stats/reset";
    //$resetStatsResponse = makeHttpRequest($resetStatsUrl, "POST");
    //echo $resetStatsResponse;

    $response = ["stats" => $stats, "notes" => $notes];
    echo json_encode($response);
} elseif ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $text = $data["text"];
    if ($text) {
        $stmt = $pdo->prepare("INSERT INTO notes (text) VALUES (:text)");
        $stmt->bindParam(":text", $text);
        $stmt->execute();
        $newNoteId = $pdo->lastInsertId();

        $incrementStatsUrl = "http://localhost:8001/stats/increment";
        $incrementStatsResponse = makeHttpRequest($incrementStatsUrl, "POST");

        $newNote = ["id" => $newNoteId, "text" => $text];
        echo json_encode($newNote);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Пожалуйста, введите текст заметки."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Метод не поддерживается"]);
}

?>