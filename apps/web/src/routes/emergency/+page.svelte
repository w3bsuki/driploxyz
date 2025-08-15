<!-- Emergency minimal homepage -->
<svelte:head>
  <title>Driplo - Buy & Sell Clothes</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">🔥 DRIPLO</h1>
        <div class="flex gap-4">
          <a href="/login" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Login</a>
          <a href="/signup" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Sign Up</a>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold text-gray-900 mb-4">Buy & Sell Clothes Online</h2>
      <p class="text-xl text-gray-600">Your marketplace for fashion</p>
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-4">Start Selling</h3>
        <p class="text-gray-600 mb-4">Turn your wardrobe into cash. List your clothes quickly and easily.</p>
        <a href="/sell" class="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Start Selling
        </a>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-4">Start Shopping</h3>
        <p class="text-gray-600 mb-4">Discover amazing fashion finds from our community.</p>
        <a href="/search" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Browse Products
        </a>
      </div>
    </div>
  </main>
</div>