<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
    $message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email address'
        ]);
        exit;
    }

    // Email details
    $to = "zzain.abbas@hotmail.com";
    $email_subject = "Portfolio Contact: $subject";
    
    // Create email headers
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Compose HTML email
    $email_body = "
        <html>
        <body>
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong></p>
            <p>$message</p>
        </body>
        </html>
    ";

    // Attempt to send email
    try {
        if (mail($to, $email_subject, $email_body, $headers)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Thank you! Your message has been sent successfully.'
            ]);
        } else {
            throw new Exception('Failed to send email');
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to send message. Please try again later.'
        ]);
        
        // Log the error (optional)
        error_log("Email sending failed: " . $e->getMessage());
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}
?>