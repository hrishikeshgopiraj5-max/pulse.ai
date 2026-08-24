/**
 * Pulse AI — Health Profile Script
 * Loads and saves user health profile data.
 */

(function () {
  'use strict';

  const API = window.__PULSE_API_URL__ || 'http://localhost:8000/api/v1';

  // ─── Auth gate ─────────────────────────────────────────────
  Auth.onAuthChange(async (user) => {
    if (!user) {
      window.location.href = '/';
      return;
    }
    await loadProfile();
  });

  // ─── Tag input helper ──────────────────────────────────────
  function setupTagInput(containerId, inputId) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    const tags = [];

    function renderTags() {
      container.innerHTML = '';
      tags.forEach((tag, i) => {
        const el = document.createElement('span');
        el.className = 'tag';
        el.innerHTML = `${escapeHtml(tag)} <button type="button" class="tag-remove" data-index="${i}">&times;</button>`;
        container.appendChild(el);
      });

      container.querySelectorAll('.tag-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          tags.splice(parseInt(btn.dataset.index), 1);
          renderTags();
        });
      });
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = input.value.trim().replace(/,/g, '');
        if (val && !tags.includes(val)) {
          tags.push(val);
          renderTags();
        }
        input.value = '';
      }
      if (e.key === 'Backspace' && !input.value && tags.length) {
        tags.pop();
        renderTags();
      }
    });

    // Click on wrap focuses input
    container.parentElement.addEventListener('click', () => input.focus());

    return {
      getTags: () => [...tags],
      setTags: (arr) => {
        tags.length = 0;
        if (Array.isArray(arr)) arr.forEach(t => tags.push(t));
        renderTags();
      },
    };
  }

  // ─── Setup tag inputs ──────────────────────────────────────
  const conditionsTags = setupTagInput('conditionsTags', 'profileConditions');
  const surgeriesTags = setupTagInput('surgeriesTags', 'profileSurgeries');
  const familyHistoryTags = setupTagInput('familyHistoryTags', 'profileFamilyHistory');
  const allergiesTags = setupTagInput('allergiesTags', 'profileAllergies');
  const dietTags = setupTagInput('dietTags', 'profileDiet');

  // ─── Medications ───────────────────────────────────────────
  const medicationsList = document.getElementById('medicationsList');
  const addMedBtn = document.getElementById('addMedBtn');
  let medications = [];

  function renderMedications() {
    medicationsList.innerHTML = '';
    medications.forEach((med, i) => {
      const card = document.createElement('div');
      card.className = 'med-card';
      card.innerHTML = `
        <div>
          <label>Medicine Name</label>
          <input type="text" value="${escapeAttr(med.name)}" data-index="${i}" data-field="name" placeholder="e.g. Metformin">
        </div>
        <div>
          <label>Dosage</label>
          <input type="text" value="${escapeAttr(med.dosage)}" data-index="${i}" data-field="dosage" placeholder="e.g. 500mg">
        </div>
        <div>
          <label>Frequency</label>
          <input type="text" value="${escapeAttr(med.frequency)}" data-index="${i}" data-field="frequency" placeholder="e.g. Twice daily">
        </div>
        <button type="button" class="med-remove" data-index="${i}">&times;</button>
      `;
      medicationsList.appendChild(card);
    });

    // Bind input changes
    medicationsList.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        const idx = parseInt(input.dataset.index);
        const field = input.dataset.field;
        medications[idx][field] = input.value;
      });
    });

    // Bind remove buttons
    medicationsList.querySelectorAll('.med-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        medications.splice(parseInt(btn.dataset.index), 1);
        renderMedications();
      });
    });
  }

  if (addMedBtn) {
    addMedBtn.addEventListener('click', () => {
      medications.push({ name: '', dosage: '', frequency: '' });
      renderMedications();
      // Focus the new name input
      const inputs = medicationsList.querySelectorAll('input[data-field="name"]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    });
  }

  // ─── Load profile ──────────────────────────────────────────
  async function loadProfile() {
    try {
      const res = await Auth.authedFetch(`${API}/health-profile`);
      const data = await res.json().catch(() => ({}));
      const profile = data.data?.profile;

      if (!profile) return; // No profile yet — show empty form

      // Fill form fields
      if (profile.gender) document.getElementById('profileGender').value = profile.gender;
      if (profile.date_of_birth) document.getElementById('profileDOB').value = profile.date_of_birth.split('T')[0];
      if (profile.height_cm) document.getElementById('profileHeight').value = profile.height_cm;
      if (profile.weight_kg) document.getElementById('profileWeight').value = profile.weight_kg;
      if (profile.blood_type) document.getElementById('profileBloodType').value = profile.blood_type;

      // Tags
      conditionsTags.setTags(profile.known_conditions || []);
      surgeriesTags.setTags(profile.past_surgeries || []);
      familyHistoryTags.setTags(profile.family_medical_history || []);
      allergiesTags.setTags(profile.allergies || []);
      dietTags.setTags(profile.dietary_restrictions || []);

      // Medications
      if (profile.current_medications?.length) {
        medications = profile.current_medications.map(m => {
          if (typeof m === 'string') return { name: m, dosage: '', frequency: '' };
          return { name: m.name || '', dosage: m.dosage || '', frequency: m.frequency || '' };
        });
        renderMedications();
      }

      // Lifestyle
      if (profile.smoking_status) document.getElementById('profileSmoking').value = profile.smoking_status;
      if (profile.alcohol_use) document.getElementById('profileAlcohol').value = profile.alcohol_use;
      if (profile.exercise_frequency) document.getElementById('profileExercise').value = profile.exercise_frequency;

      // Emergency
      if (profile.emergency_contact_name) document.getElementById('profileEmergName').value = profile.emergency_contact_name;
      if (profile.emergency_contact_phone) document.getElementById('profileEmergPhone').value = profile.emergency_contact_phone;

    } catch (err) {
      console.error('Failed to load health profile:', err);
    }
  }

  // ─── Save profile ──────────────────────────────────────────
  const form = document.getElementById('profileForm');
  const status = document.getElementById('profileStatus');
  const saveBtn = document.getElementById('saveProfileBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = Auth.getUser();
      if (!user) {
        status.textContent = 'Please log in first.';
        status.className = 'form-status error';
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      status.textContent = '';
      status.className = 'form-status';

      const payload = {
        gender: document.getElementById('profileGender').value || null,
        date_of_birth: document.getElementById('profileDOB').value || null,
        height_cm: parseFloat(document.getElementById('profileHeight').value) || null,
        weight_kg: parseFloat(document.getElementById('profileWeight').value) || null,
        blood_type: document.getElementById('profileBloodType').value || null,
        known_conditions: conditionsTags.getTags(),
        past_surgeries: surgeriesTags.getTags(),
        family_medical_history: familyHistoryTags.getTags(),
        allergies: allergiesTags.getTags(),
        current_medications: medications.filter(m => m.name.trim()),
        smoking_status: document.getElementById('profileSmoking').value || null,
        alcohol_use: document.getElementById('profileAlcohol').value || null,
        exercise_frequency: document.getElementById('profileExercise').value || null,
        dietary_restrictions: dietTags.getTags(),
        emergency_contact_name: document.getElementById('profileEmergName').value.trim() || null,
        emergency_contact_phone: document.getElementById('profileEmergPhone').value.trim() || null,
      };

      try {
        const res = await Auth.authedFetch(`${API}/health-profile`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          status.textContent = '✓ Health profile saved successfully!';
          status.className = 'form-status success';
          setTimeout(() => {
            status.textContent = '';
            status.className = 'form-status';
          }, 3000);
        } else {
          status.textContent = data.detail || 'Failed to save profile. Please try again.';
          status.className = 'form-status error';
        }
      } catch (err) {
        status.textContent = 'Network error. Please check your connection.';
        status.className = 'form-status error';
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Health Profile';
      }
    });
  }

  // ─── Helpers ───────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
