<?php
// Universal redirect to the SPA admin panel
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$cleanBase = preg_replace('#/myadmin(/.*)?$#i', '', $requestUri);
$target = ($cleanBase === '' ? '' : $cleanBase) . '/#/myadmin';

header("Location: " . $target, true, 302);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Redirecting to Admin Panel...</title>
    <script>
        window.location.replace("<?php echo htmlspecialchars($target, ENT_QUOTES, 'UTF-8'); ?>");
    </script>
</head>
<body>
    <p>Redirecting to Admin Panel... <a href="<?php echo htmlspecialchars($target, ENT_QUOTES, 'UTF-8'); ?>">Click here if not redirected</a>.</p>
</body>
</html>
