<template>
  <header class="w-full border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 8v8"></path>
            <path d="M8 12h8"></path>
          </svg>
        </div>
        <span class="text-xl font-bold text-white tracking-tight">TalkBridge</span>
      </NuxtLink>

      <div class="flex items-center gap-6">
        <NuxtLink to="/dashboard" class="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/" class="text-sm font-medium px-4 py-2 bg-[#1f1f1f] text-gray-200 hover:bg-[#2a2a2a] hover:text-white rounded-lg transition-colors border border-gray-800">
          New Room
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>
