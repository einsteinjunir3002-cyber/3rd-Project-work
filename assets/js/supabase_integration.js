
/* ==========================================================================
   SUPABASE RESEARCHER PORTAL INTEGRATION
   ========================================================================== */

let activeProjectId = 'b189a815-5e03-4f11-9685-6d63428f5223'; // Hardcoded for prototype demo
let researchChatChannel = null;

async function fetchResearchDocuments() {
  if (!supabaseClient) return;
  const tbody = document.getElementById('research-doc-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

  try {
    const { data, error } = await supabaseClient
      .from('Document')
      .select('*')
      .order('createdAt', { ascending: false });

    // Fallback if table doesn't exist or RLS blocks it
    if (error) {
      console.warn('Supabase Document table error (fallback triggered):', error);
      if (tbody) tbody.innerHTML = `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px;">Healthcare_IoT_Dataset.csv (Local Fallback)</td><td style="padding:12px;">Data</td><td style="padding:12px;">200 KB</td><td style="padding:12px;"><button class="btn btn-sm btn-secondary">Download</button></td>
        </tr>
      `;
      return;
    }

    if (!data || data.length === 0) {
      if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No documents found.</td></tr>';
      return;
    }

    if (tbody) tbody.innerHTML = data.map(doc => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:12px;">${doc.title}</td>
        <td style="padding:12px;">${doc.mimeType}</td>
        <td style="padding:12px;">${Math.round(doc.sizeBytes / 1024)} KB</td>
        <td style="padding:12px;">
          <a href="${doc.fileUrl}" target="_blank" class="btn btn-sm btn-secondary">Download</a>
          <button class="btn btn-sm btn-danger" onclick="deleteResearchDocument('${doc.id}', '${doc.filename}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error fetching docs:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">Error: ${err.message}</td></tr>`;
  }
}

async function uploadResearchDocument(event) {
  if (!supabaseClient) return alert('Supabase client not initialized.');
  const file = event.target.files[0];
  if (!file) return;

  try {
    showToastNotification('Uploading document...');
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `project-documents/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('project-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('project-documents')
      .getPublicUrl(filePath);

    // Insert into Document table
    const { error: dbError } = await supabaseClient
      .from('Document')
      .insert([
        {
          id: crypto.randomUUID(),
          title: file.name,
          filename: fileName,
          fileUrl: publicUrl,
          sizeBytes: file.size,
          mimeType: file.type || 'application/octet-stream',
          projectId: activeProjectId,
          uploadedById: appState.user?.id || 'd3b07384-d113-4d6b-b2b9-e1f2b0ff6b8e' // Fallback UUID
        }
      ]);

    if (dbError) throw dbError;

    showToastNotification('Document uploaded successfully!');
    fetchResearchDocuments(); // Refresh list

  } catch (err) {
    console.error('Upload error:', err);
    alert(`Upload failed: ${err.message}`);
  }
}

async function deleteResearchDocument(id, filename) {
  if (!supabaseClient || !confirm('Are you sure you want to delete this document?')) return;
  
  try {
    // Delete from Storage
    await supabaseClient.storage.from('project-documents').remove([`project-documents/${filename}`]);
    
    // Delete from DB
    const { error } = await supabaseClient.from('Document').delete().match({ id: id });
    if (error) throw error;
    
    showToastNotification('Document deleted.');
    fetchResearchDocuments();
  } catch (err) {
    console.error('Delete error:', err);
    alert(`Delete failed: ${err.message}`);
  }
}

function initResearchChat() {
  if (!supabaseClient) return;
  const board = document.getElementById('project-chat-board');
  if (!board) return;
  board.innerHTML = '';
  
  if (researchChatChannel) {
    supabaseClient.removeChannel(researchChatChannel);
  }

  researchChatChannel = supabaseClient.channel('project-chat')
    .on('broadcast', { event: 'new_message' }, payload => {
      const isMe = payload.payload.user === (appState.user?.name || 'Researcher');
      const msgDiv = document.createElement('div');
      msgDiv.style = isMe 
        ? 'background:var(--primary); padding:10px; border-radius:8px; align-self:flex-end;' 
        : 'background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; align-self:flex-start;';
      msgDiv.innerHTML = `<strong>${payload.payload.user}:</strong> ${payload.payload.text}`;
      board.appendChild(msgDiv);
      board.scrollTop = board.scrollHeight;
    })
    .subscribe((status) => {
      if(status === 'SUBSCRIBED') {
        board.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:0.8rem;">Connected to Live Chat</div>';
      }
    });
}

function sendResearchChatMessage(event) {
  event.preventDefault();
  if (!supabaseClient || !researchChatChannel) return alert('Chat not connected.');
  
  const input = document.getElementById('research-chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  const userName = appState.user?.name || 'Researcher';

  researchChatChannel.send({
    type: 'broadcast',
    event: 'new_message',
    payload: { user: userName, text: text }
  });

  // Optimistically add to UI
  const board = document.getElementById('project-chat-board');
  const msgDiv = document.createElement('div');
  msgDiv.style = 'background:var(--primary); padding:10px; border-radius:8px; align-self:flex-end;';
  msgDiv.innerHTML = `<strong>${userName}:</strong> ${text}`;
  board.appendChild(msgDiv);
  board.scrollTop = board.scrollHeight;

  input.value = '';
}

// Hook into the tab switcher to initialize safely
setTimeout(() => {
  if (typeof switchTab !== 'undefined') {
    const originalSwitchTab = switchTab;
    window.switchTab = function(role, tabId) {
      try {
        originalSwitchTab(role, tabId);
        if (tabId === 'researcher-repository') {
          fetchResearchDocuments();
        } else if (tabId === 'researcher-collaboration') {
          initResearchChat();
        }
      } catch (err) {
        console.error("Error in switchTab wrapper:", err);
      }
    }
  }
}, 500);
