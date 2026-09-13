const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
if (localStorage.theme === 'dark') document.body.classList.add('dark');
let store = TDStore.load();

const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[c]));

function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function save(message = 'Saved locally') {
  TDStore.save(store);
  toast(message);
}

function card(title, body, extra = '') {
  return `<section class="admin-card reveal ${extra}"><h2>${title}</h2>${body}</section>`;
}

function init() {
  if (sessionStorage.getItem('td_admin') === '1') showAdmin();
  else $('#loginView').classList.remove('hidden');
}

function showAdmin() {
  $('#loginView').classList.add('hidden');
  $('#adminView').classList.remove('hidden');
  $('#logoutBtn').classList.remove('hidden');
  loadPage('dashboard');
}

$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = $('#username').value.trim();
  const password = $('#password').value;
  // Credentials stay out of the login UI; this is still a client-side demo for GitHub Pages.
  if (username === 'admin' && password === '290414htdsun5a4*****') {
    sessionStorage.setItem('td_admin', '1');
    showAdmin();
  } else {
    $('#loginError').textContent = 'Invalid username or password.';
  }
});

$('#logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('td_admin');
  location.reload();
});

$$('.side-btn').forEach((button) => {
  button.addEventListener('click', () => {
    $$('.side-btn').forEach((x) => x.classList.remove('active'));
    button.classList.add('active');
    loadPage(button.dataset.page);
  });
});

function activateReveal() {
  const els = $$('#adminContent .reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((x) => x.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach((x) => io.observe(x));
}

const pageTitles = {
  dashboard: 'Dashboard', profile: 'Profile', posts: 'Posts',
  projects: 'Projects', media: 'Media', backup: 'Backup & Restore'
};

function loadPage(page) {
  if (!pageTitles[page]) return;
  $('#adminTitle').textContent = pageTitles[page];
  ({ dashboard, profile, posts, projects, media, backup }[page])();
  activateReveal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function dashboard() {
  const published = store.posts.filter((x) => x.status === 'published').length;
  const drafts = store.posts.length - published;
  const featured = store.projects.filter((x) => x.featured && !x.hidden).length;
  const recent = store.posts.slice().sort((a, b) =>
    String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at))
  ).slice(0, 4);
  const stats = [['Posts', store.posts.length], ['Published', published], ['Drafts', drafts], ['Projects', store.projects.length], ['Media', store.media.length]];
  const statHtml = '<div class="stats">' + stats.map((x, i) =>
    `<div class="stat reveal reveal-delay-${Math.min(i, 3)}"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`
  ).join('') + '</div>';
  const quick = `<div class="quick-grid">
    <button type="button" class="quick-action" data-action="profile"><span class="qa-icon">◉</span><span><strong>Edit profile</strong><span>Update identity & links</span></span></button>
    <button type="button" class="quick-action" data-action="post"><span class="qa-icon">✎</span><span><strong>Create post</strong><span>Publish a new update</span></span></button>
    <button type="button" class="quick-action" data-action="project"><span class="qa-icon">▣</span><span><strong>Add project</strong><span>Showcase your work</span></span></button>
    <button type="button" class="quick-action" data-action="media"><span class="qa-icon">▧</span><span><strong>Manage media</strong><span>Organize uploaded images</span></span></button>
  </div>`;
  const recentBody = recent.length ? `<div class="mini-list">${recent.map((p) =>
    `<div class="mini-row"><span class="mini-dot"></span><div><strong>${esc(p.title)}</strong><span>${esc(p.status)} · ${esc(p.updated_at || p.created_at || '')}</span></div></div>`
  ).join('')}</div>` : '<div class="admin-empty">No posts yet. Create your first one from Quick actions.</div>';
  const snapshot = `<div class="mini-list">
    <div class="mini-row"><span class="mini-dot"></span><div><strong>${featured} featured project${featured === 1 ? '' : 's'}</strong><span>Visible in your portfolio</span></div></div>
    <div class="mini-row"><span class="mini-dot"></span><div><strong>${store.media.length} media item${store.media.length === 1 ? '' : 's'}</strong><span>Stored in this browser</span></div></div>
    <div class="mini-row"><span class="mini-dot"></span><div><strong>Backup recommended</strong><span>Export JSON before clearing site data</span></div></div>
  </div>`;
  $('#adminContent').innerHTML = `<section class="admin-card admin-card--hero reveal"><div class="dashboard-intro"><div><h2>Welcome back, Hoàng Thái Dương</h2><p>Your profile workspace is ready. Keep your content current and your public profile polished.</p></div><span class="status-pill"><i></i>Local CMS active</span></div></section>${statHtml}${card('Quick actions', quick)}<div class="activity-grid">${card('Recent posts', recentBody)}${card('Workspace snapshot', snapshot)}</div>`;
}

function profile() {
  const p = store.profile;
  const body = `<form id="profileForm" class="form-grid">
    <div class="form-section field full"><div class="form-section-title">Identity</div><div class="form-grid">
      <div class="field"><label>Name</label><input class="input" name="name" value="${esc(p.name)}"></div>
      <div class="field"><label>Bio</label><input class="input" name="bio" value="${esc(p.bio)}"></div>
    </div></div>
    <div class="form-section field full"><div class="form-section-title">Skills & links</div><div class="form-grid">
      <div class="field full"><label>Skills (comma separated)</label><input class="input" name="skills" value="${esc((p.skills || []).join(', '))}"></div>
      <div class="field"><label>Website</label><input class="input" name="website" placeholder="https://..." value="${esc(p.website || '')}"></div>
      <div class="field"><label>YouTube</label><input class="input" name="youtube" placeholder="https://youtube.com/..." value="${esc(p.youtube || '')}"></div>
      <div class="field full"><label>Social links JSON</label><input class="input" name="social_links" value='${esc(JSON.stringify(p.social_links || {}))}'><div class="helper">Legacy field. You can also use the easier custom link manager below.</div></div>
      <div class="field full">
        <div class="field-header"><div><label>Custom links</label><div class="helper">Add a public link with your own display name.</div></div><button type="button" class="ghost" id="addProfileLink">+ Add link</button></div>
        <div id="profileLinksEditor" class="link-editor"></div>
      </div>
    </div></div>
    <div class="form-section field full"><div class="form-section-title">About</div><div class="form-grid">
      <div class="field full"><label>Introduction</label><textarea class="textarea" name="about">${esc(p.about || '')}</textarea></div>
      <div class="field"><label>Interests</label><textarea class="textarea" name="interests">${esc(p.interests || '')}</textarea></div>
      <div class="field"><label>Goals</label><textarea class="textarea" name="goals">${esc(p.goals || '')}</textarea></div>
    </div></div>
    <div class="form-section field full"><div class="form-section-title">Images</div>
      <div class="form-preview-row"><img class="preview-img-lg" src="${esc(p.avatar_url || '')}" alt="Avatar preview"><div><label class="upload-btn">Upload avatar <input id="avatarFile" type="file" accept="image/*" hidden></label><div class="helper">Recommended: square image.</div></div></div>
      <div class="form-preview-row" style="margin-top:14px"><img class="preview-img-lg" style="width:160px" src="${esc(p.cover_url || '')}" alt="Cover preview"><div><label class="upload-btn">Upload cover <input id="coverFile" type="file" accept="image/*" hidden></label><div class="helper">Wide image works best.</div></div></div>
    </div>
    <div class="field full toolbar"><button type="submit" class="primary">Save changes</button></div>
  </form>`;
  $('#adminContent').innerHTML = card('Profile settings', body);
  const linkEditor = $('#profileLinksEditor');
  const existingLinks = Array.isArray(p.custom_links) ? p.custom_links : Object.entries(p.social_links || {}).map(([name, url]) => ({ name, url }));
  const renderLinkRows = () => {
    linkEditor.innerHTML = existingLinks.map((link, index) => `
      <div class="custom-link-row">
        <input class="input" data-link-name placeholder="Link name" value="${esc(link.name || '')}">
        <input class="input" data-link-url placeholder="https://..." value="${esc(link.url || '')}">
        <button type="button" class="small-btn red" data-remove-link="${index}" aria-label="Remove link">Remove</button>
      </div>`).join('');
    linkEditor.querySelectorAll('[data-remove-link]').forEach((btn) => btn.addEventListener('click', () => {
      existingLinks.splice(Number(btn.dataset.removeLink), 1);
      renderLinkRows();
    }));
  };
  renderLinkRows();
  $('#addProfileLink').addEventListener('click', () => { existingLinks.push({ name: '', url: '' }); renderLinkRows(); linkEditor.lastElementChild?.querySelector('[data-link-name]')?.focus(); });

  $('#profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    let socials = {};
    try { socials = JSON.parse(f.get('social_links') || '{}'); }
    catch { toast('Social links JSON is invalid'); return; }
    const customLinks = [...document.querySelectorAll('#profileLinksEditor .custom-link-row')].map((row) => ({
      name: row.querySelector('[data-link-name]')?.value.trim() || '',
      url: row.querySelector('[data-link-url]')?.value.trim() || ''
    })).filter((x) => x.name && x.url);
    store.profile = {
      ...store.profile,
      name: f.get('name'), bio: f.get('bio'),
      skills: f.get('skills').split(',').map((s) => s.trim()).filter(Boolean),
      website: f.get('website'), youtube: f.get('youtube'), social_links: socials, custom_links: customLinks,
      about: f.get('about'), interests: f.get('interests'), goals: f.get('goals')
    };
    for (const [id, key] of [['avatarFile', 'avatar_url'], ['coverFile', 'cover_url']]) {
      const file = $('#' + id).files[0];
      if (file) store.profile[key] = await fileToDataUrl(file);
    }
    save();
    profile();
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function posts() {
  const rows = store.posts.length ? store.posts.map((x) => `<tr>
    <td><div class="row-title">${esc(x.title)}</div><div class="row-sub">/${esc(x.slug)}</div></td>
    <td><span class="badge ${x.status === 'published' ? 'badge-published' : 'badge-draft'}">${esc(x.status)}</span></td>
    <td>${esc(x.updated_at || x.created_at || '')}</td>
    <td><div class="row-actions"><button type="button" class="small-btn" data-edit-post="${x.id}">Edit</button><button type="button" class="small-btn red" data-delete-post="${x.id}">Delete</button></div></td>
  </tr>`).join('') : '<tr><td colspan="4"><div class="admin-empty">No posts yet.</div></td></tr>';
  const body = `<div class="toolbar toolbar-spread"><span class="meta">Create, edit and publish updates from this browser.</span><button type="button" class="primary" id="newPost">+ New post</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Post</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  $('#adminContent').innerHTML = card('Post management', body);
  $('#newPost').addEventListener('click', () => postEditor());
  $$('[data-edit-post]').forEach((b) => b.addEventListener('click', () => editPost(Number(b.dataset.editPost))));
  $$('[data-delete-post]').forEach((b) => b.addEventListener('click', () => deletePost(Number(b.dataset.deletePost))));
}

function makeSlug(value) {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function postEditor(item) {
  const isEdit = Boolean(item);
  const p = item || { id: Date.now(), title: '', slug: '', content: '', category: 'Personal', tags: [], status: 'draft', created_at: new Date().toISOString().slice(0, 10), cover_url: '' };
  const body = `<form id="postForm" class="form-grid">
    <div class="form-section field full"><div class="form-section-title">Content</div><div class="form-grid">
      <div class="field full"><label>Title</label><input class="input" name="title" required value="${esc(p.title)}"></div>
      <div class="field"><label>Slug</label><input class="input" name="slug" required value="${esc(p.slug)}"></div>
      <div class="field"><label>Category</label><input class="input" name="category" value="${esc(p.category)}"></div>
      <div class="field"><label>Tags</label><input class="input" name="tags" value="${esc((p.tags || []).join(', '))}"></div>
      <div class="field"><label>Status</label><select class="select" name="status"><option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft</option><option value="published" ${p.status === 'published' ? 'selected' : ''}>Published</option></select></div>
      <div class="field full"><label>Cover image URL</label><input class="input" name="cover_url" placeholder="https://..." value="${esc(p.cover_url || '')}"></div>
      <div class="field full"><label>Content</label><textarea class="textarea" style="min-height:300px" name="content" required>${esc(p.content)}</textarea></div>
    </div></div>
    <div class="field full toolbar"><button type="button" class="ghost" id="cancelPost">Cancel</button><button type="submit" class="primary">${isEdit ? 'Update post' : 'Create post'}</button></div>
  </form>`;
  $('#adminContent').innerHTML = card(isEdit ? 'Edit post' : 'Create post', body);
  activateReveal();
  const titleInput = $('#postForm [name="title"]');
  const slugInput = $('#postForm [name="slug"]');
  titleInput.addEventListener('input', () => { if (!isEdit && !slugInput.dataset.touched) slugInput.value = makeSlug(titleInput.value); });
  slugInput.addEventListener('input', () => { slugInput.dataset.touched = slugInput.value ? '1' : ''; });
  $('#cancelPost').addEventListener('click', () => posts());
  $('#postForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = String(f.get('title') || '').trim();
    let slug = String(f.get('slug') || '').trim() || makeSlug(title);
    slug = makeSlug(slug);
    if (!title || !slug || !String(f.get('content') || '').trim()) return toast('Please complete title, slug and content.');
    const duplicate = store.posts.find((x) => x.slug === slug && x.id !== p.id);
    if (duplicate) return toast('This slug already exists.');
    const out = {
      ...p, title, slug, category: String(f.get('category') || '').trim() || 'Personal',
      tags: String(f.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: f.get('status') === 'published' ? 'published' : 'draft',
      cover_url: String(f.get('cover_url') || '').trim(),
      content: String(f.get('content') || '').trim(),
      updated_at: new Date().toISOString()
    };
    if (!out.created_at) out.created_at = new Date().toISOString().slice(0, 10);
    const index = store.posts.findIndex((x) => x.id === p.id);
    if (index >= 0) store.posts[index] = out; else store.posts.unshift(out);
    save(isEdit ? 'Post updated' : 'Post created');
    posts();
  });
}

function editPost(id) { postEditor(store.posts.find((x) => x.id === id)); }
function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  store.posts = store.posts.filter((x) => x.id !== id);
  save('Post deleted');
  posts();
}

function projects() {
  const rows = store.projects.length ? store.projects.map((x) => `<tr>
    <td><div class="row-title">${esc(x.name)}</div><div class="row-sub">${esc(x.status || '')}</div></td>
    <td>${x.featured ? '<span class="badge badge-featured">Featured</span>' : '—'}</td>
    <td>${x.hidden ? '<span class="badge badge-hidden">Hidden</span>' : 'Shown'}</td>
    <td><div class="row-actions"><button type="button" class="small-btn" data-edit-project="${x.id}">Edit</button><button type="button" class="small-btn red" data-delete-project="${x.id}">Delete</button></div></td>
  </tr>`).join('') : '<tr><td colspan="4"><div class="admin-empty">No projects yet.</div></td></tr>';
  const body = `<div class="toolbar toolbar-spread"><span class="meta">Keep your portfolio details organized and current.</span><button type="button" class="primary" id="newProject">+ Add project</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Project</th><th>Featured</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  $('#adminContent').innerHTML = card('Project management', body);
  $('#newProject').addEventListener('click', () => projectEditor());
  $$('[data-edit-project]').forEach((b) => b.addEventListener('click', () => editProject(Number(b.dataset.editProject))));
  $$('[data-delete-project]').forEach((b) => b.addEventListener('click', () => deleteProject(Number(b.dataset.deleteProject))));
}

function validUrl(value) {
  if (!value) return true;
  try { const u = new URL(value); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

function projectEditor(item) {
  const isEdit = Boolean(item);
  const p = item || { id: Date.now(), name: '', description: '', thumbnail_url: '', project_url: '', github_url: '', technologies: [], status: 'Active', featured: false, hidden: false, sort_order: 0 };
  const body = `<form id="projectForm" class="form-grid">
    <div class="form-section field full"><div class="form-section-title">Project details</div><div class="form-grid">
      <div class="field"><label>Name</label><input class="input" name="name" required value="${esc(p.name)}"></div>
      <div class="field"><label>Status</label><input class="input" name="status" value="${esc(p.status)}"></div>
      <div class="field full"><label>Description</label><textarea class="textarea" name="description" required>${esc(p.description)}</textarea></div>
      <div class="field"><label>Project URL</label><input class="input" name="project_url" placeholder="https://..." value="${esc(p.project_url)}"></div>
      <div class="field"><label>GitHub URL</label><input class="input" name="github_url" placeholder="https://github.com/..." value="${esc(p.github_url)}"></div>
      <div class="field"><label>Thumbnail URL</label><input class="input" name="thumbnail_url" placeholder="https://..." value="${esc(p.thumbnail_url)}"></div>
      <div class="field"><label>Technologies</label><input class="input" name="technologies" value="${esc((p.technologies || []).join(', '))}"></div>
      <div class="field"><label>Sort order</label><input class="input" type="number" name="sort_order" value="${p.sort_order || 0}"></div>
      <div class="field"><label>Featured</label><select class="select" name="featured"><option value="0" ${!p.featured ? 'selected' : ''}>No</option><option value="1" ${p.featured ? 'selected' : ''}>Yes</option></select></div>
      <div class="field"><label>Visibility</label><select class="select" name="hidden"><option value="0" ${!p.hidden ? 'selected' : ''}>Shown</option><option value="1" ${p.hidden ? 'selected' : ''}>Hidden</option></select></div>
    </div></div>
    <div class="field full toolbar"><button type="button" class="ghost" id="cancelProject">Cancel</button><button type="submit" class="primary">${isEdit ? 'Update project' : 'Create project'}</button></div>
  </form>`;
  $('#adminContent').innerHTML = card(isEdit ? 'Edit project' : 'Add project', body);
  activateReveal();
  $('#cancelProject').addEventListener('click', () => projects());
  $('#projectForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get('name') || '').trim();
    const description = String(f.get('description') || '').trim();
    const projectUrl = String(f.get('project_url') || '').trim();
    const githubUrl = String(f.get('github_url') || '').trim();
    const thumbnail = String(f.get('thumbnail_url') || '').trim();
    if (!name || !description) return toast('Please complete project name and description.');
    if (![projectUrl, githubUrl, thumbnail].every(validUrl)) return toast('Use valid http/https URLs.');
    const out = {
      ...p, name, description, project_url: projectUrl, github_url: githubUrl,
      thumbnail_url: thumbnail,
      technologies: String(f.get('technologies') || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: String(f.get('status') || '').trim() || 'Active',
      featured: f.get('featured') === '1', hidden: f.get('hidden') === '1',
      sort_order: Number(f.get('sort_order') || 0), updated_at: new Date().toISOString()
    };
    const index = store.projects.findIndex((x) => x.id === p.id);
    if (index >= 0) store.projects[index] = out; else store.projects.push(out);
    save(isEdit ? 'Project updated' : 'Project created');
    projects();
  });
}

function editProject(id) { projectEditor(store.projects.find((x) => x.id === id)); }
function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  store.projects = store.projects.filter((x) => x.id !== id);
  save('Project deleted');
  projects();
}

function media() {
  store.media = store.media || [];
  const body = `<div class="toolbar toolbar-spread"><span class="meta">Images are stored locally in your browser.</span><label class="upload-btn">+ Upload image <input id="mediaInput" type="file" accept="image/*" hidden></label></div>
    <div class="media-grid" style="margin-top:18px">${store.media.map((m, i) => `<div class="media-item reveal"><img src="${esc(m.url)}" alt="${esc(m.filename)}"><div style="padding:10px"><div style="font-size:13px;font-weight:650">${esc(m.filename)}</div><div class="helper">Image asset</div><button type="button" class="small-btn red" style="margin-top:8px" data-delete-media="${i}">Delete</button></div></div>`).join('') || '<div class="empty">No images yet.</div>'}</div>`;
  $('#adminContent').innerHTML = card('Media library', body);
  $('#mediaInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('Image must be under 5MB');
    const url = await fileToDataUrl(file);
    store.media.unshift({ filename: file.name, url });
    save('Image uploaded');
    media();
  });
  $$('[data-delete-media]').forEach((b) => b.addEventListener('click', () => deleteMedia(Number(b.dataset.deleteMedia))));
}

function deleteMedia(index) {
  store.media.splice(index, 1);
  save('Image deleted');
  media();
}

function backup() {
  const body = `<p class="meta">Export your current browser data to a JSON file before clearing browser data or moving to another device.</p>
    <div class="toolbar toolbar-spread"><div><strong>Recommended workflow</strong><div class="helper">Export → keep the JSON safe → import when needed.</div></div>
    <div class="toolbar" style="margin-top:0"><button type="button" class="primary" id="exportBtn">Export JSON</button><label class="upload-btn">Import JSON <input id="importInput" type="file" accept="application/json" hidden></label><button type="button" class="ghost" id="resetBtn">Reset to defaults</button></div></div>`;
  $('#adminContent').innerHTML = card('Backup & restore', body);
  $('#exportBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }));
    a.download = 'thai-duong-profile-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported.profile || !Array.isArray(imported.posts) || !Array.isArray(imported.projects)) throw new Error('Invalid structure');
      store = imported;
      TDStore.save(store);
      toast('Imported');
      dashboard();
      activateReveal();
    } catch {
      toast('Invalid JSON');
    }
  });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all local data?')) return;
    store = TDStore.clone(TDStore.defaults);
    TDStore.save(store);
    dashboard();
    activateReveal();
    toast('Reset complete');
  });
}

// Dashboard action buttons are delegated because dashboard content is rebuilt dynamically.
document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'profile') loadPage('profile');
  if (action === 'post') postEditor();
  if (action === 'project') projectEditor();
  if (action === 'media') loadPage('media');
});

window.editPost = editPost;
window.deletePost = deletePost;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.postEditor = postEditor;
window.projectEditor = projectEditor;

init();
