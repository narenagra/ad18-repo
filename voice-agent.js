/* =============================================
   AD18PICTURES — Voice Agent
   Uses Web Speech API (SpeechRecognition + SpeechSynthesis)
   ============================================= */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  document.getElementById('vaToggle').style.display = 'none';
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  const synth = window.speechSynthesis;
  let isListening = false;
  let conversationState = 'idle';
  let collected = { name: '', email: '', company: '', budget: '', message: '' };
  let canSpeak = true;

  const toggle = document.getElementById('vaToggle');
  const panel = document.getElementById('vaPanel');
  const closeBtn = document.getElementById('vaClose');
  const micBtn = document.getElementById('vaMicBtn');
  const messages = document.getElementById('vaMessages');
  const hint = document.getElementById('vaHint');

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && conversationState === 'idle') {
      setTimeout(() => speak('Hi! I am the AD18 voice assistant. I will help you send an enquiry. Say start when you are ready.'), 400);
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    stopListening();
  });

  function speak(text, callback) {
    if (!canSpeak) { if (callback) callback(); return; }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.voice = synth.getVoices().find(v => v.name.includes('Google UK') || v.name.includes('Microsoft Zira')) || null;
    addMessage(text, 'agent');
    utter.onend = () => { if (callback) callback(); };
    synth.speak(utter);
  }

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `va-msg va-${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function startListening() {
    if (isListening) return;
    isListening = true;
    micBtn.classList.add('listening');
    toggle.classList.add('listening');
    hint.textContent = 'Listening...';
    recognition.start();
  }

  function stopListening() {
    isListening = false;
    micBtn.classList.remove('listening');
    toggle.classList.remove('listening');
    hint.textContent = 'Tap mic & speak';
    try { recognition.abort(); } catch {}
  }

  micBtn.addEventListener('click', () => {
    if (isListening) { stopListening(); return; }
    startListening();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    addMessage(event.results[0][0].transcript.trim(), 'user');
    processInput(transcript);
  };

  recognition.onerror = () => {
    stopListening();
    hint.textContent = 'Mic error — tap to retry';
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    toggle.classList.remove('listening');
    if (conversationState !== 'done' && conversationState !== 'idle') {
      hint.textContent = 'Tap mic & speak';
    }
  };

  function processInput(text) {
    if (conversationState === 'idle') {
      if (text.includes('start') || text.includes('yes') || text.includes('ready') || text.includes('hello') || text.includes('hi')) {
        conversationState = 'ask_name';
        setTimeout(() => speak('Great! What is your name?', () => { hint.textContent = 'Say your name'; startListening(); }), 200);
      } else {
        setTimeout(() => speak('Just say "start" whenever you are ready.', () => { hint.textContent = 'Say "start"'; startListening(); }), 200);
      }
      return;
    }

    if (conversationState === 'ask_name') {
      collected.name = text.replace(/my name is /, '').replace(/i am /, '').trim();
      const first = collected.name.split(' ')[0] || '';
      conversationState = 'ask_email';
      setTimeout(() => speak(`Nice to meet you, ${first}! What email address should I use?`, () => { hint.textContent = 'Say your email'; startListening(); }), 200);
      return;
    }

    if (conversationState === 'ask_email') {
      collected.email = text.replace(/ /g, '').replace(/at sign/g, '@').replace(/dot /g, '.').replace(/ dot/g, '.').replace(/ at /g, '@').trim();
      if (!collected.email.includes('@')) collected.email = text.replace(/ /g, '') + '@gmail.com';
      conversationState = 'ask_company';
      setTimeout(() => speak('Which company do you represent?', () => { hint.textContent = 'Say your company name'; startListening(); }), 200);
      return;
    }

    if (conversationState === 'ask_company') {
      collected.company = text.replace(/my company is /, '').replace(/i work for /, '').replace(/i am from /, '').trim();
      conversationState = 'ask_budget';
      setTimeout(() => speak('What is your estimated budget range? You can say something like ten thousand or fifty thousand plus.', () => { hint.textContent = 'Say your budget'; startListening(); }), 200);
      return;
    }

    if (conversationState === 'ask_budget') {
      if (text.includes('5') || text.includes('five') || text.includes('10') || text.includes('ten')) collected.budget = '$5k – $10k';
      else if (text.includes('25') || text.includes('twenty')) collected.budget = '$10k – $25k';
      else if (text.includes('50') || text.includes('fifty')) collected.budget = '$25k – $50k';
      else if (text.includes('plus') || text.includes('more')) collected.budget = '$50k+';
      else collected.budget = '$10k – $25k';
      conversationState = 'ask_message';
      setTimeout(() => speak('Perfect. Now tell me briefly about your project or what you need help with.', () => { hint.textContent = 'Describe your project'; startListening(); }), 200);
      return;
    }

    if (conversationState === 'ask_message') {
      collected.message = text.trim();
      conversationState = 'confirm';
      const summary = `Let me confirm. Name: ${collected.name}. Email: ${collected.email}. Company: ${collected.company}. Budget around ${collected.budget}. Message: ${collected.message}. Is this correct? Say yes to submit or no to start over.`;
      setTimeout(() => speak(summary, () => { hint.textContent = 'Say yes or no'; startListening(); }), 200);
      return;
    }

    if (conversationState === 'confirm') {
      if (text.includes('yes') || text.includes('correct') || text.includes('right') || text.includes('submit')) {
        conversationState = 'done';
        submitEnquiry();
      } else {
        collected = { name: '', email: '', company: '', budget: '', message: '' };
        conversationState = 'ask_name';
        setTimeout(() => speak('No problem! Let us start again. What is your name?', () => { hint.textContent = 'Say your name'; startListening(); }), 200);
      }
      return;
    }

    if (conversationState === 'done') {
      hint.textContent = 'Enquiry submitted!';
    }
  }

  async function submitEnquiry() {
    stopListening();
    hint.textContent = 'Submitting...';

    const formData = new FormData();
    formData.append('name', collected.name);
    formData.append('email', collected.email);
    formData.append('company', collected.company);
    formData.append('budget', collected.budget);
    formData.append('message', collected.message);

    try {
      const res = await fetch('send.php', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.ok) {
        addMessage('✓ Enquiry sent to dublin@ad18pictures.com. We will get back to you soon!', 'agent');
        setTimeout(() => speak('Your enquiry has been sent. We will get back to you soon. Thank you!'), 200);
      } else {
        addMessage('Submission failed. Please try the contact form instead.', 'agent');
        speak('Sorry, there was an error submitting your enquiry. Please use the contact form.');
      }
    } catch {
      addMessage('Network error. Please use the contact form above.', 'agent');
      speak('Sorry, there was a network error. Please use the contact form.');
    }

    hint.textContent = 'Done!';
    conversationState = 'idle';
    collected = { name: '', email: '', company: '', budget: '', message: '' };
  }
}
