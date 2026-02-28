<template>
  <div class="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-zinc-800 text-zinc-200 font-mono pb-20 relative">
    
    <div v-if="notification.show" 
         class="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-[pop_0.2s_ease-out] flex items-center gap-3 w-max max-w-[90vw]"
         :class="notification.type === 'success' ? 'bg-green-500 border-green-900 text-black' : 'bg-red-700 border-red-950 text-white'">
      <span class="text-2xl">{{ notification.type === 'success' ? '✅' : '❌' }}</span>
      <span class="font-black text-sm md:text-base uppercase tracking-widest">{{ notification.message }}</span>
    </div>

    <nav class="border-b-4 border-red-700 bg-zinc-900 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-4xl md:text-5xl text-white tracking-widest drop-shadow-[4px_4px_0px_rgba(220,38,38,1)] uppercase cursor-pointer" style="font-family: 'Anton', sans-serif;" @click="goToHome">
          G-EVENTS
        </h1>
        
        <button v-if="currentView === 'list'" @click="currentView = 'create'" 
                class="bg-red-700 text-white font-black px-6 py-2 uppercase tracking-widest border border-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          + DROP EVENT
        </button>
        <button v-else @click="goToHome" 
                class="bg-zinc-800 text-zinc-300 font-black px-6 py-2 uppercase tracking-widest border border-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          BACK TO HOOD
        </button>
      </div>
    </nav>

    <main v-if="currentView === 'list'" class="max-w-6xl mx-auto px-6 mt-10">
      <div class="flex items-end justify-between mb-8">
        <h2 class="text-2xl font-bold text-zinc-400 uppercase tracking-widest border-l-4 border-red-600 pl-4">
          Ongoing Missions
        </h2>
        <button @click="fetchEvents" class="text-zinc-500 hover:text-white underline text-sm uppercase font-bold tracking-widest">Refresh</button>
      </div>

      <div v-if="isLoadingEvents" class="text-center text-zinc-500 py-20 font-bold uppercase animate-pulse">
        SCANNING AREA...
      </div>
      <div v-else-if="events.length === 0" class="text-center py-20 border-2 border-dashed border-zinc-800 text-zinc-600 uppercase font-bold text-xl">
        NO EVENTS DROPPED YET. BE THE FIRST.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="event in events" :key="event.id" 
             class="bg-zinc-900 border border-zinc-700 p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(220,38,38,0.7)] hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 transition-all group relative overflow-hidden">
          
          <div class="absolute -right-4 -top-4 text-6xl text-zinc-800 opacity-10 font-black rotate-12 select-none pointer-events-none">
            G-EVT
          </div>

          <button @click="openManageModal(event)" title="จัดการงานนี้ (เฉพาะหัวตี้)"
                  class="absolute top-4 right-4 z-20 text-zinc-500 hover:text-red-500 text-xl transition-colors bg-zinc-950/50 p-2 rounded-sm border border-zinc-800 hover:border-red-500">
            👁️
          </button>

          <div class="relative z-10 cursor-pointer" @click="viewEventDetail(event.id)">
            <div class="text-xs text-red-500 font-bold mb-2 uppercase tracking-widest">{{ formatDate(event.event_time) }}</div>
            <h3 class="text-2xl font-black text-white uppercase mb-4 group-hover:text-red-500 hover:underline transition-colors line-clamp-2" title="คลิกเพื่อดูรายชื่อคนไป">
              {{ event.name }}
            </h3>
            
            <div class="space-y-2 text-sm text-zinc-400 mb-6 font-bold">
              <p class="flex items-center gap-2">📍 <span class="truncate">{{ event.location }}</span></p>
              <p class="flex items-center gap-2">👥 <span>{{ event.max_people ? `Max ${event.max_people} Crew` : 'Unlimited Crew' }}</span></p>
            </div>
          </div>

          <button @click="openJoinModal(event)" 
                  class="w-full relative z-10 bg-zinc-100 text-zinc-900 font-black py-3 uppercase tracking-widest border border-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
            JOIN MISSION
          </button>
        </div>
      </div>
    </main>

    <main v-if="currentView === 'create'" class="max-w-md mx-auto px-4 mt-10">
      <div class="bg-zinc-900 border-2 border-zinc-700 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] w-full p-8 relative overflow-hidden transition-all duration-300 hover:shadow-[12px_12px_0px_0px_rgba(220,38,38,1)]">
        <h1 class="text-3xl font-black text-center mb-8 tracking-tighter uppercase text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"> DROP EVENT </h1>
        <form @submit.prevent="submitEvent" class="space-y-5 relative z-10">
          <div><label class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Event Name / ชื่องาน</label><input v-model="form.name" type="text" required class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"></div>
          <div><label class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Date & Time / เวลานัด</label><input v-model="form.event_time" type="datetime-local" required class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none [color-scheme:dark]"></div>
          <div><label class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Location / พิกัด</label><input v-model="form.location" type="text" required class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"></div>
          <div><label class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Crew Size / จำนวนคน (Max)</label><input v-model="form.max_people" type="number" min="1" placeholder="ไม่จำกัดปล่อยว่าง" class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"></div>
          <div><label class="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Leader PIN / รหัสหัวดี</label><input v-model="form.manage_pin" type="text" maxlength="6" required placeholder="ใส่รหัสลับ 6 หลัก" class="w-full bg-zinc-950 border border-red-900 text-red-500 px-4 py-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors placeholder-red-900/50 text-center tracking-[0.5em] font-bold" /></div>
          <div><label class="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Money Drop / อัปโหลด QR รับเงิน</label><input type="file" accept="image/*" @change="handleFileUpload" class="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer bg-zinc-950 border border-zinc-700"></div>
          <button type="submit" :disabled="isCreating" class="w-full mt-8 bg-red-700 text-white font-black text-lg py-4 px-4 uppercase tracking-[0.2em] border border-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isCreating ? 'LOADING...' : 'CREATE SQUAD' }}
          </button>
        </form>
      </div>
    </main>

    <main v-if="currentView === 'detail' && activeEvent" class="max-w-4xl mx-auto px-6 mt-10">
      <div class="bg-zinc-900 border-2 border-zinc-700 p-8 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
        
        <div class="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-zinc-800 pb-6 mb-6">
          <div>
            <div class="text-red-500 font-bold tracking-widest uppercase mb-1">{{ formatDate(activeEvent.event_time) }}</div>
            <h1 class="text-4xl font-black text-white uppercase">{{ activeEvent.name }}</h1>
            <p class="text-zinc-400 mt-2 font-bold">📍 {{ activeEvent.location }}</p>
          </div>
          <div class="bg-zinc-950 border border-zinc-800 p-4 text-center min-w-[150px]">
            <p class="text-xs text-zinc-500 uppercase font-bold tracking-widest">Crew Status</p>
            <p class="text-3xl font-black text-white">{{ activeEvent.participants?.length || 0 }} <span class="text-lg text-zinc-600">/ {{ activeEvent.max_people || '∞' }}</span></p>
          </div>
        </div>

        <div v-if="activeEvent.qr_image_url" class="mb-8 p-6 bg-zinc-950 border-2 border-dashed border-red-900 text-center">
          <h3 class="text-red-500 font-black tracking-[0.2em] uppercase mb-4 text-xl">💰 SCAN TO PAY / สแกนจ่ายเงิน</h3>
          <img :src="activeEvent.qr_image_url" class="mx-auto max-w-[250px] border-4 border-zinc-800 hover:scale-105 transition-transform" alt="QR Code รับเงิน">
        </div>

        <h2 class="text-2xl font-black text-zinc-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          {{ isManageMode ? '👑 LEADER DASHBOARD' : '📋 CREW ROSTER' }}
        </h2>

        <div v-if="!activeEvent.participants || activeEvent.participants.length === 0" class="text-center py-10 bg-zinc-950 border border-zinc-800 text-zinc-600 font-bold uppercase">
          ยังไม่มีใครกด Join (เหงาจัด)
        </div>

        <div v-else class="space-y-4">
          <div v-for="p in activeEvent.participants" :key="p.id" 
               class="bg-zinc-950 border border-zinc-800 p-4 flex flex-col gap-4 hover:border-zinc-600 transition-colors">
            
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
              <div>
                <p class="text-xl font-black text-white uppercase">{{ p.nickname }}</p>
                <p class="text-xs text-zinc-500 font-bold mt-1">Status: 
                  <span :class="{
                    'text-red-500': p.payment_status === 'unpaid',
                    'text-yellow-500': p.payment_status === 'pending',
                    'text-green-500': p.payment_status === 'paid'
                  }" class="uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded-sm">{{ p.payment_status }}</span>
                </p>
              </div>

              <div v-if="isManageMode" class="flex flex-wrap gap-2 mt-4 md:mt-0">
                <button v-if="p.payment_status !== 'paid'" @click="verifyPayment(p.id, 'paid')" 
                        class="bg-green-900/50 text-green-400 border border-green-800 px-4 py-2 text-xs font-bold uppercase hover:bg-green-800 hover:text-white transition-colors">
                  💰 MARK PAID
                </button>
                <button v-if="p.payment_status !== 'unpaid'" @click="verifyPayment(p.id, 'unpaid')"
                        class="bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 text-xs font-bold uppercase hover:bg-red-800 hover:text-white transition-colors">
                  ❌ MARK UNPAID
                </button>
              </div>
            </div>

            <div class="border-t border-zinc-800 pt-4 mt-2 w-full flex flex-col md:flex-row gap-4 items-start md:items-center">
              
              <div v-if="p.slip_image_url" class="shrink-0">
                <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Attached Slip</p>
                <a :href="p.slip_image_url" target="_blank" title="คลิกดูรูปใหญ่">
                  <img :src="p.slip_image_url" class="h-20 w-auto border-2 border-zinc-700 hover:border-red-500 cursor-pointer transition-colors object-cover" alt="Slip">
                </a>
              </div>

              <div v-if="p.payment_status !== 'paid'" class="flex-grow w-full md:w-auto">
                <p class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{{ p.slip_image_url ? 'Upload New Slip (แทนที่รูปเดิม)' : 'Upload Slip (ส่งสลิป)' }}</p>
                <div class="flex items-center gap-2">
                  <input type="file" accept="image/*" @change="e => selectParticipantSlip(e, p.id)" 
                         class="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:border-0 file:font-bold file:uppercase file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer border border-zinc-800 p-1">
                  
                  <button v-if="participantSlips[p.id]" @click="submitParticipantSlip(p.id)" :disabled="isUploadingSlip[p.id]"
                          class="shrink-0 bg-zinc-200 text-black px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50">
                    {{ isUploadingSlip[p.id] ? 'WAIT...' : 'SEND' }}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </main>

    <div v-if="showPinModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80">
      <div class="bg-zinc-900 border-2 border-red-700 shadow-[10px_10px_0px_0px_rgba(220,38,38,1)] max-w-sm w-full p-8 animate-[pop_0.2s_ease-out]">
        <h2 class="text-2xl font-black text-white uppercase mb-2">LEADER ACCESS</h2>
        <p class="text-zinc-400 text-xs mb-6 border-b border-zinc-800 pb-4">ใส่รหัส PIN 6 หลักเพื่อเข้าจัดการ <br><span class="text-red-500">ถ้าจำไม่ได้ก็ตัวใครตัวมัน!</span></p>
        <form @submit.prevent="submitPin" class="space-y-6">
          <input v-model="tempPin" type="password" maxlength="6" required placeholder="******" 
                 class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-center text-2xl tracking-[1em] focus:border-red-600 outline-none transition-colors">
          <div class="flex gap-4">
            <button type="button" @click="showPinModal = false" class="w-1/2 bg-zinc-800 text-zinc-400 font-bold py-3 border border-zinc-700 hover:text-white uppercase">CANCEL</button>
            <button type="submit" class="w-1/2 bg-red-700 text-white font-black py-3 border border-red-500 hover:bg-red-600 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">ENTER</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showJoinModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80">
      <div class="bg-zinc-900 border-2 border-red-700 shadow-[10px_10px_0px_0px_rgba(220,38,38,1)] max-w-sm w-full p-8 animate-[pop_0.2s_ease-out]">
        <h2 class="text-3xl font-black text-white uppercase mb-2" style="font-family: 'Anton', sans-serif;">ARE YOU SURE?</h2>
        <p class="text-zinc-400 text-sm mb-6 border-b border-zinc-800 pb-4">ยืนยันเข้าร่วม <span class="text-red-500 font-bold uppercase">"{{ selectedEvent?.name }}"</span> <br>กดแล้วห้ามเท ห้ามบิด</p>
        <form @submit.prevent="confirmJoin" class="space-y-6">
          <input v-model="joinNickname" type="text" required placeholder="AKA / ชื่อ" class="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 text-center text-lg font-bold focus:border-red-600 outline-none">
          <div class="flex gap-4">
            <button type="button" @click="showJoinModal = false" class="w-1/2 bg-zinc-800 text-zinc-400 font-bold py-3 border border-zinc-700 hover:text-white uppercase">CANCEL</button>
            <button type="submit" :disabled="isJoining" class="w-1/2 bg-red-700 text-white font-black py-3 border border-red-500 hover:bg-red-600 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{{ isJoining ? '...' : 'IM IN' }}</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
@keyframes pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase } from './supabase'

const apiUrl = import.meta.env.VITE_API_URL

const notification = reactive({ show: false, message: '', type: 'success' })
let notifTimeout: any = null
const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
  notification.message = msg; notification.type = type; notification.show = true;
  if (notifTimeout) clearTimeout(notifTimeout)
  notifTimeout = setTimeout(() => { notification.show = false }, 3000)
}

const currentView = ref('list')
const events = ref<any[]>([])
const isLoadingEvents = ref(false)
const activeEvent = ref<any>(null)
const isManageMode = ref(false)
const savedManagePin = ref('')

const goToHome = () => {
  currentView.value = 'list'
  fetchEvents()
}

const fetchEvents = async () => {
  isLoadingEvents.value = true
  try {
    const res = await fetch(`${apiUrl}/api/events`)
    const result = await res.json()
    if(res.ok) events.value = result.data
  } catch (error) {
    showNotification("ดึงข้อมูลไม่สำเร็จ", 'error')
  } finally {
    isLoadingEvents.value = false
  }
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(() => fetchEvents())

const form = reactive({ name: '', event_time: '', location: '', max_people: null as number | null, manage_pin: '' })
const selectedFile = ref<File | null>(null)
const isCreating = ref(false)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] || null
  }
}

const submitEvent = async () => {
  isCreating.value = true
  let uploadedQrUrl = null
  try {
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop()
      const filePath = `qr-codes/${Math.random().toString(36).substring(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('qr_codes').upload(filePath, selectedFile.value)
      if (uploadError) throw new Error('อัปโหลดรูปลง QR Bucket ไม่สำเร็จ: ' + uploadError.message)
      const { data } = supabase.storage.from('qr_codes').getPublicUrl(filePath)
      uploadedQrUrl = data.publicUrl
    }

    const res = await fetch(`${apiUrl}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, event_time: new Date(form.event_time).toISOString(), qr_image_url: uploadedQrUrl })
    })
    if (!res.ok) throw new Error(await res.text())

    showNotification('Drop Event สำเร็จ!', 'success')
    form.name = ''; form.event_time = ''; form.location = ''; form.max_people = null; form.manage_pin = ''; selectedFile.value = null;
    goToHome()
  } catch (error: any) {
    showNotification(`เกิดข้อผิดพลาด: ${error.message}`, 'error')
  } finally {
    isCreating.value = false
  }
}

const viewEventDetail = async (eventId: string, mode: 'public' | 'manage' = 'public') => {
  try {
    const res = await fetch(`${apiUrl}/api/events/${eventId}`)
    const result = await res.json()
    if (!res.ok) throw new Error(result.message)
    
    activeEvent.value = result.data
    isManageMode.value = (mode === 'manage')
    currentView.value = 'detail'
  } catch (error: any) {
    showNotification('ไม่พบข้อมูล Event นี้นะ', 'error')
  }
}

const showPinModal = ref(false)
const tempPin = ref('')
const eventToManage = ref<any>(null)

const openManageModal = (event: any) => {
  eventToManage.value = event
  tempPin.value = ''
  showPinModal.value = true
}

const submitPin = () => {
  savedManagePin.value = tempPin.value
  showPinModal.value = false
  viewEventDetail(eventToManage.value.id, 'manage')
}

const participantSlips = reactive<Record<string, File | null>>({}) 
const isUploadingSlip = reactive<Record<string, boolean>>({})

const selectParticipantSlip = (event: Event, participantId: string) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    participantSlips[participantId] = target.files[0] || null
  } else {
    participantSlips[participantId] = null
  }
}

const submitParticipantSlip = async (participantId: string) => {
  const file = participantSlips[participantId]
  if (!file) return

  isUploadingSlip[participantId] = true
  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `slips/${Math.random().toString(36).substring(2)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('slips').upload(filePath, file)
    if (uploadError) throw new Error('อัปโหลดสลิปไม่สำเร็จ: ' + uploadError.message)
    
    const { data } = supabase.storage.from('slips').getPublicUrl(filePath)
    const slipUrl = data.publicUrl

    const res = await fetch(`${apiUrl}/api/events/${activeEvent.value.id}/participants/${participantId}/slip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slip_image_url: slipUrl })
    })

    if (!res.ok) throw new Error("ส่งสลิปไม่สำเร็จ")

    showNotification('ส่งสลิปเรียบร้อย รอหัวตี้ตรวจ!', 'success')
    participantSlips[participantId] = null
    
    viewEventDetail(activeEvent.value.id, isManageMode.value ? 'manage' : 'public')

  } catch(error: any) {
    showNotification(error.message, 'error')
  } finally {
    isUploadingSlip[participantId] = false
  }
}

const verifyPayment = async (participantId: string, status: 'paid' | 'unpaid') => {
  try {
    const res = await fetch(`${apiUrl}/api/events/${activeEvent.value.id}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manage_pin: savedManagePin.value,
        participant_id: participantId,
        status: status
      })
    })
    const result = await res.json()
    
    if (!res.ok) {
      if (result.message.includes("PIN ไม่ถูกต้อง")) {
        showNotification("PIN ผิด! แกไม่ใช่หัวตี้ตัวจริงนี่หว่า", 'error')
        goToHome()
      } else {
        throw new Error(result.message)
      }
      return
    }

    if (result.event_deleted) {
      showNotification("ทุกคนจ่ายครบแล้ว! ลบ Event ทิ้งเรียบร้อย 🔥", 'success')
      goToHome() 
    } else {
      showNotification(result.message, 'success')
      viewEventDetail(activeEvent.value.id, 'manage') 
    }
  } catch (error: any) {
    showNotification(`Error: ${error.message}`, 'error')
  }
}

const showJoinModal = ref(false)
const selectedEvent = ref<any>(null)
const joinNickname = ref('')
const isJoining = ref(false)

const openJoinModal = (event: any) => {
  selectedEvent.value = event
  joinNickname.value = ''
  showJoinModal.value = true
}

const confirmJoin = async () => {
  if (!selectedEvent.value) return
  isJoining.value = true
  try {
    const res = await fetch(`${apiUrl}/api/events/${selectedEvent.value.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: joinNickname.value })
    })
    if (!res.ok) throw new Error("Join failed")
    
    showNotification(`เข้าร่วมแก๊งในชื่อ ${joinNickname.value} สำเร็จ!`, 'success')
    showJoinModal.value = false
    fetchEvents()
  } catch (error) {
    showNotification("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง", 'error')
  } finally {
    isJoining.value = false
  }
}
</script>