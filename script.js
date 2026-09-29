const byId = (id) => document.getElementById(id);
const postsElement = byId('posts');
const searchInput = byId('searchInput');
const feedFilter = byId('feedFilter');
const emptyState = byId('emptyState');
const dialog = byId('appDialog');
const dialogTitle = byId('dialogTitle');
const dialogBody = byId('dialogBody');
const themeToggle = byId('themeToggle');

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Could not read ${key}:`, error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not save ${key}:`, error);
    }
  }
};

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function applyTheme(theme) {
  const resolved = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = resolved;
  if (themeToggle) {
    const icon = themeToggle.querySelector('span');
    if (icon) icon.textContent = resolved === 'light' ? '☾' : '☼';
  }
  storage.set('nexus-theme', resolved);
}

const starterPosts = [
  {
    id: 1,
    author: 'Maya Chen',
    handle: '@mayamakes',
    initial: 'M',
    avatar: 'avatar-coral',
    time: '12 min ago',
    text: 'A reminder that making something imperfect is still making something. Today I finally started the little project I’ve been thinking about for months.',
    likes: 124,
    liked: false,
    comments: ['Love this mindset.'],
    commentCount: 3,
    shares: 18,
    saves: 64,
    views: 12480,
    bookmarked: false,
    following: true
  },
  {
    id: 2,
    author: 'Jules Rivera',
    handle: '@julesdesigns',
    initial: 'J',
    avatar: 'avatar-blue',
    time: '38 min ago',
    text: 'Spent the afternoon exploring glassmorphism and soft layered interfaces. Light can change the whole emotional tone of a product.',
    likes: 91,
    liked: false,
    comments: [],
    commentCount: 2,
    shares: 14,
    saves: 49,
    views: 9800,
    bookmarked: true,
    following: false
  },
  {
    id: 3,
    author: 'Sam Okafor',
    handle: '@samsgarden',
    initial: 'S',
    avatar: 'avatar-gold',
    time: '1 hr ago',
    text: 'The first tomatoes are finally showing up. Small wins, big joy. What are you growing this season?',
    likes: 146,
    liked: true,
    comments: ['This is the kind of energy I need.'],
    commentCount: 7,
    shares: 23,
    saves: 71,
    views: 16720,
    bookmarked: false,
    following: true,
    poll: {
      question: 'What are you planting this season?',
      options: ['Herbs', 'Vegetables', 'Flowers'],
      votes: [8, 15, 4],
      voted: false
    }
  }
];

let posts = storage.get('nexus-posts', starterPosts);
if (!Array.isArray(posts) || posts.length === 0) posts = starterPosts;
let nextPostId = Math.max(1, ...posts.map((post) => Number(post.id) || 0)) + 1;

function savePosts() {
  const safe = posts.map(({ media, ...post }) => ({ ...post }));
  storage.set('nexus-posts', safe);
}

function renderPosts() {
  if (!postsElement) return;

  const query = (searchInput?.value || '').trim().toLowerCase();
  let visiblePosts = posts.filter((post) => {
    const haystack = `${post.author} ${post.handle} ${post.text} ${(post.comments || []).join(' ')}`.toLowerCase();
    return haystack.includes(query);
  });

  if (feedFilter?.value === 'popular') {
    visiblePosts = [...visiblePosts].sort((a, b) => b.likes - a.likes);
  } else {
    visiblePosts = [...visiblePosts].sort((a, b) => b.id - a.id);
  }

  postsElement.innerHTML = visiblePosts.map((post) => {
    const commentCount = (post.commentCount || 0) + (post.comments?.length || 0);
    const media = post.media
      ? post.media.type === 'image'
        ? `<img class="post-media" src="${escapeHTML(post.media.url)}" alt="Image shared by ${escapeHTML(post.author)}">`
        : `<video class="post-media" src="${escapeHTML(post.media.url)}" controls playsinline></video>`
      : '';

    const poll = post.poll ? (() => {
      const total = post.poll.votes.reduce((sum, count) => sum + count, 0);
      return `<div class="post-poll"><strong>${escapeHTML(post.poll.question)}</strong>${post.poll.options.map((option, index) => {
        const percent = total ? Math.round((post.poll.votes[index] / total) * 100) : 0;
        return `<button class="poll-choice" type="button" data-action="vote" data-index="${index}" data-post="${post.id}" ${post.poll.voted ? 'disabled' : ''}><span>${escapeHTML(option)}</span><span>${post.poll.voted ? `${percent}%` : 'Vote'}</span></button>`;
      }).join('')}</div>`;
    })() : '';

    const comments = (post.comments || []).map((comment) => `<p class="post-comment"><strong>You</strong> ${escapeHTML(comment)}</p>`).join('');
    const copy = `<p class="post-copy">${escapeHTML(post.text).replace(/\n/g, '<br>')}</p>`;
    const displayViews = (post.views || 0).toLocaleString();
    const displayLikes = (post.likes || 0).toLocaleString();
    const displayShares = (post.shares || 0).toLocaleString();
    const displaySaves = (post.saves || 0).toLocaleString();
    const displayComments = commentCount.toLocaleString();

    return `<article id="post-${post.id}" class="post-card glass-panel" data-post="${post.id}">
      <header class="post-header">
        <span class="avatar ${escapeHTML(post.avatar || 'avatar-you')}">${escapeHTML(post.initial || 'A')}</span>
        <div class="post-author"><strong>${escapeHTML(post.author)}</strong><span>${escapeHTML(post.handle)} · ${escapeHTML(post.time)}</span></div>
        <button class="icon-button" type="button" data-action="more" aria-label="More post options">···</button>
      </header>
      ${copy}
      ${media}
      ${poll}
      <p class="post-views" aria-label="${displayViews} views">◉ ${displayViews} views</p>
      <div class="post-actions">
        <button type="button" data-action="like" aria-pressed="${post.liked}">♥ <span>${displayLikes}</span></button>
        <button type="button" data-action="comment" aria-label="${displayComments} comments">♧ <span>${displayComments}</span></button>
        <button type="button" data-action="share" aria-label="${displayShares} shares">↗ <span>${displayShares}</span></button>
        <button type="button" data-action="bookmark" aria-pressed="${post.bookmarked}">${post.bookmarked ? '◆' : '◇'} <span>${displaySaves}</span></button>
      </div>
      ${comments}
      <form class="comment-form" data-post="${post.id}">
        <label class="visually-hidden" for="comment-${post.id}">Write a comment</label>
        <input id="comment-${post.id}" name="comment" maxlength="240" placeholder="Write a thoughtful reply…" required>
        <button type="submit">Reply</button>
      </form>
    </article>`;
  }).join('');

  if (emptyState) {
    emptyState.hidden = visiblePosts.length > 0;
  }
}

function showDialog(title, content) {
  if (!dialog || !dialogTitle || !dialogBody) return;
  dialogTitle.textContent = title;
  dialogBody.textContent = content;
  if (typeof dialog.showModal === 'function' && !dialog.open) {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', 'open');
  }
}

function closeDialog() {
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function clearMediaPreview(type) {
  const preview = byId(`${type}Preview`);
  const media = byId(type === 'image' ? 'previewImage' : 'previewVideo');
  if (media?.src.startsWith('blob:')) URL.revokeObjectURL(media.src);
  if (type === 'video') media?.pause();
  media?.removeAttribute('src');
  if (type === 'video') media?.load();
  if (preview) preview.hidden = true;
}

searchInput?.addEventListener('input', renderPosts);
feedFilter?.addEventListener('change', renderPosts);

byId('themeToggle')?.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
});

byId('createTrigger')?.addEventListener('click', () => {
  const composer = byId('postForm');
  if (composer) {
    composer.hidden = false;
    composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    byId('postText')?.focus();
  }
});

byId('postForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = byId('postText')?.value.trim() || '';
  const question = byId('pollQuestion')?.value.trim() || '';
  const optionOne = byId('pollOptionOne')?.value.trim() || '';
  const optionTwo = byId('pollOptionTwo')?.value.trim() || '';
  const pollEnabled = byId('pollTrigger')?.getAttribute('aria-pressed') === 'true';
  const file = byId('imageInput')?.files?.[0] || byId('videoInput')?.files?.[0];

  if (pollEnabled && (!question || !optionOne || !optionTwo)) {
    showDialog('Complete your poll', 'Add a question and two choices before posting.');
    return;
  }
  if (!text && !file && !pollEnabled) {
    byId('postText')?.focus();
    return;
  }

  const newPost = {
    id: nextPostId++,
    author: 'Alex Dev',
    handle: '@alex_nxt',
    initial: 'A',
    avatar: 'avatar-you',
    time: 'just now',
    text,
    likes: 0,
    liked: false,
    comments: [],
    commentCount: 0,
    shares: 0,
    saves: 0,
    views: 0,
    bookmarked: false,
    following: true
  };

  if (pollEnabled) {
    newPost.poll = { question, options: [optionOne, optionTwo], votes: [0, 0], voted: false };
  }

  if (file) {
    const isVideo = file.type.startsWith('video/');
    newPost.media = { type: isVideo ? 'video' : 'image', url: URL.createObjectURL(file) };
    newPost.short = isVideo && byId('shortTrigger')?.getAttribute('aria-pressed') === 'true';
  }

  posts.unshift(newPost);
  savePosts();
  event.currentTarget.reset();
  restoreComposerDefaults();
  clearMediaPreview('image');
  clearMediaPreview('video');
  renderPosts();
  byId('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function restoreComposerDefaults() {
  byId('characterCount') && (byId('characterCount').textContent = '0 / 500');
  byId('pollBuilder') && (byId('pollBuilder').hidden = true);
  byId('pollTrigger')?.setAttribute('aria-pressed', 'false');
  byId('shortTrigger')?.setAttribute('aria-pressed', 'false');
  byId('shortHint') && (byId('shortHint').hidden = true);
  if (byId('postText')) {
    byId('postText').maxLength = 500;
    byId('postText').placeholder = 'What’s on your mind, Alex?';
  }
}

byId('postText')?.addEventListener('input', (event) => {
  const count = byId('characterCount');
  if (count) count.textContent = `${event.target.value.length} / 500`;
});

byId('pollTrigger')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  const builder = byId('pollBuilder');
  if (builder) builder.hidden = !enabled;
  if (enabled) byId('pollQuestion')?.focus();
});

byId('shortTrigger')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  if (byId('shortHint')) byId('shortHint').hidden = !enabled;
  const text = byId('postText');
  if (text) {
    text.maxLength = enabled ? 150 : 500;
    text.placeholder = enabled ? 'Share a quick thought…' : 'What’s on your mind, Alex?';
    if (enabled && text.value.length > 150) text.value = text.value.slice(0, 150);
  }
  const count = byId('characterCount');
  if (count) count.textContent = `${text?.value.length || 0} / ${enabled ? 150 : 500}`;
});

for (const type of ['image', 'video']) {
  byId(`${type}Trigger`)?.addEventListener('click', () => byId(`${type}Input`)?.click());
  byId(`${type}Input`)?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearMediaPreview(type);
    clearMediaPreview(type === 'image' ? 'video' : 'image');
    const preview = byId(`${type}Preview`);
    const media = byId(type === 'image' ? 'previewImage' : 'previewVideo');
    if (preview && media) {
      media.src = URL.createObjectURL(file);
      preview.hidden = false;
    }
    const otherInput = byId(type === 'image' ? 'videoInput' : 'imageInput');
    if (otherInput) otherInput.value = '';
  });
}

for (const type of ['image', 'video']) {
  byId(`remove${type === 'image' ? 'Image' : 'Video'}`)?.addEventListener('click', () => {
    const input = byId(`${type}Input`);
    if (input) input.value = '';
    clearMediaPreview(type);
  });
}

postsElement?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const post = posts.find((item) => item.id === Number(button.dataset.post || button.closest('[data-post]')?.dataset.post));
  if (!post) return;

  switch (button.dataset.action) {
    case 'like':
      post.liked = !post.liked;
      post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1));
      savePosts();
      renderPosts();
      break;
    case 'bookmark':
      post.bookmarked = !post.bookmarked;
      post.saves = Math.max(0, (post.saves || 0) + (post.bookmarked ? 1 : -1));
      savePosts();
      renderPosts();
      break;
    case 'follow':
      post.following = !post.following;
      savePosts();
      renderPosts();
      break;
    case 'vote': {
      if (post.poll && !post.poll.voted) {
        const index = Number(button.dataset.index);
        if (Number.isInteger(index) && index >= 0 && index < post.poll.votes.length) {
          post.poll.votes[index] += 1;
          post.poll.voted = true;
          savePosts();
          renderPosts();
        }
      }
      break;
    }
    case 'comment':
      postsElement.querySelector(`#comment-${post.id}`)?.focus();
      break;
    case 'share':
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(`${location.href}#post-${post.id}`)
          .then(() => showDialog('Link copied', 'A link to this post has been copied.'))
          .catch(() => showDialog('Share post', location.href));
      } else {
        showDialog('Share post', location.href);
      }
      break;
    case 'more':
      showDialog('Post options', post.author === 'Alex Dev' ? 'Your post is visible in your feed.' : `This post was shared by ${post.author}.`);
      break;
  }
});

postsElement?.addEventListener('submit', (event) => {
  if (!event.target.matches('.comment-form')) return;
  event.preventDefault();
  const post = posts.find((item) => item.id === Number(event.target.dataset.post));
  const input = event.target.elements.comment;
  const comment = input.value.trim();
  if (!post || !comment) return;
  post.comments.push(comment);
  savePosts();
  renderPosts();
});

byId('closeDialog')?.addEventListener('click', closeDialog);
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});

byId('premiumTrigger')?.addEventListener('click', () => {
  const status = byId('premiumStatus');
  if (status) status.hidden = false;
  showDialog('Nexus+', 'Demo access is active. Enjoy exploring the community.');
});

byId('profileShortcut')?.addEventListener('click', () => showDialog('Alex Dev', '@alex_nxt · Your Nexus profile'));
byId('profileMenu')?.addEventListener('click', () => showDialog('Profile options', 'You are signed in as Alex Dev.'));
byId('seePeople')?.addEventListener('click', () => showDialog('People to know', 'Maya Chen · Jules Rivera · Sam Okafor'));
byId('marketBriefing')?.addEventListener('click', () => showDialog('Market note', 'These figures are illustrative and not investment advice.'));

for (const button of document.querySelectorAll('.follow-button')) {
  button.addEventListener('click', () => {
    const following = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!following));
    button.textContent = following ? '＋' : '✓';
    button.setAttribute('aria-label', `${following ? 'Follow' : 'Unfollow'} ${button.closest('.person')?.querySelector('.person-info strong')?.textContent || 'person'}`);
  });
}

document.querySelectorAll('.trend-link').forEach((button) => {
  button.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = button.dataset.query || '';
      renderPosts();
      searchInput.focus();
    }
  });
});

document.querySelectorAll('.story-card').forEach((button) => {
  button.addEventListener('click', () => showDialog('Stories', button.dataset.story === 'Your story' ? 'Your story is ready for a new moment.' : `Viewing ${button.dataset.story}’s story.`));
});

document.querySelectorAll('.chat-link').forEach((button) => {
  button.addEventListener('click', () => showDialog(`Chat with ${button.dataset.chat}`, 'Messaging is available in this demo.'));
});

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
    if (view === 'home') {
      byId('feed')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const labels = { discover: 'Shorts', notifications: 'Subscriptions', messages: 'History', profile: 'Your channel' };
    showDialog(labels[view] || 'Nexus', `${labels[view] || 'This section'} is ready to explore.`);
  });
});

const savedTheme = storage.get('nexus-theme', 'dark');
applyTheme(savedTheme);
renderPosts();
