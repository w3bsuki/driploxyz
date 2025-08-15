<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Driplo - Mobile Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 10px; }
        .button:hover { background: #0056b3; }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .title { font-size: 20px; }
            .grid { grid-template-columns: 1fr; gap: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🔥 DRIPLO</div>
            <div class="subtitle">Buy & Sell Clothes - Mobile Working!</div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>✅ Mobile Test Success</h3>
                <p>If you can see this page, mobile is working!</p>
                <a href="/emergency" class="button">Go to Emergency Page</a>
            </div>
            
            <div class="card">
                <h3>🛒 Start Shopping</h3>
                <p>Browse amazing fashion finds from our community.</p>
                <a href="/search" class="button">Browse Products</a>
            </div>
            
            <div class="card">
                <h3>💰 Start Selling</h3>
                <p>Turn your wardrobe into cash quickly and easily.</p>
                <a href="/sell" class="button">Sell Now</a>
            </div>
            
            <div class="card">
                <h3>👤 Account</h3>
                <p>Login or create your account to get started.</p>
                <a href="/login" class="button">Login</a>
            </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Mobile UA: <span id="ua"></span></p>
            <p>Screen: <span id="screen"></span></p>
        </div>
    </div>
    
    <script>
        document.getElementById('ua').textContent = navigator.userAgent;
        document.getElementById('screen').textContent = screen.width + 'x' + screen.height;
    </script>
</body>
</html>