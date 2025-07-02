<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    $to = "zzain.abbas@hotmail.com"; // Replace with your email address
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $body = "Name: $name\nEmail: $email\n\nSubject: $subject\n\nMessage:\n$message";

    if (mail($to, $subject, $body, $headers)) {
        echo "<p style='color: green;'>Message sent successfully!</p>";
    } else {
        echo "<p style='color: red;'>Failed to send the message. Please check your server configuration.</p>";
        error_log("Mail function failed. Check server configuration.");
    }
    echo "<a href='index.html'>Go back</a>";
}
?>