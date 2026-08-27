<template>
  <div class="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans">
    <AppHeader />
    
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-[#1f1f1f]">
        <div>
          <h1 class="text-3xl font-bold tracking-tight mb-2">My Rooms</h1>
          <p class="text-gray-400">Your recent TalkBridge active sessions.</p>
        </div>
        <NuxtLink to="/" class="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] transition-all">
          Create New Room
        </NuxtLink>
      </div>

      <div v-if="history.length === 0" class="text-center py-32 bg-[#141414] border border-[#1f1f1f] rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-xl font-medium text-gray-300 mb-1">No Rooms Yet</h3>
        <p class="text-gray-500">You haven't joined or created any rooms recently.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="room in history" :key="room.code + room.date" class="bg-[#141414] border border-[#1f1f1f] rounded-2xl p-6 hover:border-violet-500/50 transition duration-300 group flex flex-col justify-between h-48">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 bg-[#1f1f1f] text-gray-300 rounded-full text-xs font-mono tracking-wider">{{ room.code }}</span>
              <span class="text-xs text-gray-500">{{ new Date(room.date).toLocaleDateString() }}</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Room {{ room.code }}</h3>
          </div>
          <button @click="rejoin(room.code)" class="w-full py-3 bg-[#1f1f1f] group-hover:bg-violet-600 group-hover:text-white text-gray-300 rounded-xl font-medium transition-colors">
            Rejoin Room
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const history = ref([]);

onMounted(() => {
  const saved = localStorage.getItem('talkbridge_history');
  if (saved) {
    history.value = JSON.parse(saved);
  }
});

const rejoin = (code) => {
  // We need to trigger the Join Profile setup, but since we are on dashboard without modals, we bring them to index to join properly
  // Since index handles the join flow, passing the code as a hash or parameter is easiest, but keeping it simple: just go to index.
  // Actually, we can push them to room Directly if they supply a name. To handle setup logic cleanly, let's just go home and prepopulate.
  navigator.clipboard.writeText(code);
  alert(`Code ${code} copied! Join from the home page.`);
  router.push('/');
};
</script>
