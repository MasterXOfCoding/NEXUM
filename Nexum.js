const byId = (id) => document.getElementById(id);
const postsElement = byId('posts');
const searchInput = byId('searchInput');
const feedFilter = byId('feedFilter');
const emptyState = byId('emptyState');
const dialog = byId('appDialog');
const dialogTitle = byId('dialogTitle');
const dialogBody = byId('dialogBody');

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function clearMediaPreview(type) {
  const preview = byId(`${type}Preview`);
  const media = byId(type === 'image' ? 'previewImage' : 'previewVideo');
  if (media?.src.startsWith('blob:')) URL.revokeObjectURL(media.src);
  if (type === 'video') media?.pause();
  media?.removeAttribute('src');
  if (type === 'video') media?.load();
  if (preview) preview.hidden = true;
}

let nextPostId = 10;
let posts = [
  {
    id: 1, author: 'Maya Chen', handle: '@mayamakes', initial: 'M', avatar: 'avatar-coral',
    time: '12 min ago', text: 'A reminder that making something imperfect is still making something. Today I finally started the little project I’ve been thinking about for months. #MakeSomething',
    likes: 24, liked: false, comments: [], bookmarked: false
  },
  {
    id: 2, author: 'Jules Rivera', handle: '@julesdesigns', initial: 'J', avatar: 'avatar-blue',
    time: '38 min ago', text: 'Spent the afternoon exploring Glassmorphism and soft, layered interfaces. It’s amazing how a little light can change the feel of a whole screen. #Glassmorphism',
    likes: 18, liked: false, comments: [], bookmarked: false
  },
  {
    id: 3, author: 'Sam Okafor', handle: '@samsgarden', initial: 'S', avatar: 'avatar-gold',
    time: '1 hr ago', text: 'The first tomatoes are finally showing up in the garden. Small wins, big joy. What are you growing this season?',
    likes: 31, liked: false, comments: [], bookmarked: false,
    poll: { options: ['Herbs', 'Vegetables'], votes: [8, 12], voted: false }
  },
  {
    id: 4, author: 'Maya Chen', handle: '@mayamakes', initial: 'M', avatar: 'avatar-coral',
    time: '2 hr ago', text: 'A long-term portfolio is built around conviction, liquidity, and a clear view of risk—not headlines. Here is a sample framework for discussion.',
    likes: 86, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'ILLUSTRATIVE PORTFOLIO · NOT INVESTMENT ADVICE', title: 'A diversified long-horizon framework',
      metrics: [['Public equities', '40%'], ['Private markets', '25%'], ['Fixed income', '20%'], ['Real assets & cash', '15%']],
      note: 'Sample allocation only. Actual allocations depend on individual objectives, liquidity needs, and risk tolerance.'
    }
  },
  {
    id: 5, author: 'Jules Rivera', handle: '@julesdesigns', initial: 'J', avatar: 'avatar-blue',
    time: '4 hr ago', text: 'A thoughtful round is about more than the headline number: durable customer demand, disciplined use of capital, and alignment with long-term partners matter most.',
    likes: 64, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'PRIVATE MARKETS · SAMPLE BRIEFING', title: 'Northstar Climate · Series B',
      metrics: [['Round', '$48M'], ['Lead', 'Evergreen Capital'], ['Focus', 'Grid storage'], ['Stage', 'Series B']],
      note: 'Fictional company and round for demonstration purposes. Not an offer to invest.'
    }
  },
  {
    id: 6, author: 'Sam Okafor', handle: '@samsgarden', initial: 'S', avatar: 'avatar-gold',
    time: 'Yesterday', text: 'A small gathering for founders, stewards, and curious minds: thoughtful conversation, a sunset sail, and time away from the usual noise.',
    likes: 42, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'COMMUNITY · INVITATION', title: 'Island Salon · The September Edition',
      metrics: [['When', 'Sep 18–20'], ['Where', 'Mediterranean'], ['Format', 'Hosted retreat'], ['Seats', 'Limited · RSVP']],
      note: 'A fictional private gathering concept. Details are illustrative; no booking or invitation is available.'
    }
  },
  {
    id: 7, author: 'Maya Chen', handle: '@mayamakes', initial: 'M', avatar: 'avatar-coral',
    time: 'Yesterday', text: 'A useful diligence question: what would need to be true for this investment to work, and what evidence would change your mind? Sharing a fictional case study for discussion.',
    likes: 53, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'INVESTMENT PROCESS · FICTIONAL CASE STUDY', title: 'The discipline behind a long-horizon thesis',
      metrics: [['Horizon', '7–10 years'], ['Liquidity', 'Limited'], ['Review', 'Quarterly'], ['Risk lens', 'Downside first']],
      note: 'Educational mock scenario only. Private investments can be illiquid and involve a risk of loss. Not investment advice.'
    }
  },
  {
    id: 8, author: 'Jules Rivera', handle: '@julesdesigns', initial: 'J', avatar: 'avatar-blue',
    time: '2 days ago', text: 'A fictional founder briefing on patient capital, resilient infrastructure, and measuring impact beyond a single quarter.',
    likes: 37, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'VENTURE BRIEFING · FICTIONAL', title: 'Asteria Energy · Series A',
      metrics: [['Round', '$22M'], ['Focus', 'Long-duration storage'], ['Stage', 'Series A'], ['Use', 'Pilot expansion']],
      note: 'Asteria Energy and this financing are fictional examples. Not an offer, solicitation, or recommendation.'
    }
  },
  {
    id: 9, author: 'Sam Okafor', handle: '@samsgarden', initial: 'S', avatar: 'avatar-gold',
    time: '3 days ago', text: 'What if the best gathering leaves room for both ambitious ideas and unhurried conversation? Here is a fictional retreat concept from our community desk.',
    likes: 29, liked: false, comments: [], bookmarked: false,
    feature: {
      label: 'CULTURE · FICTIONAL EVENT CONCEPT', title: 'The Meridian Forum · A weekend in the hills',
      metrics: [['Format', 'Small-group salon'], ['Theme', 'Building for decades'], ['Setting', 'Countryside estate'], ['Access', 'Concept only']],
      note: 'Fictional event concept for demonstration. No event is scheduled and no booking is available.'
    }
  }
];

function renderPosts() {
  if (!postsElement) return;
  const query = searchInput?.value.trim().toLowerCase() || '';
  const visiblePosts = posts.filter((post) =>
    `${post.author} ${post.handle} ${post.text} ${(post.comments || []).join(' ')}`.toLowerCase().includes(query)
  );
  if (feedFilter?.value === 'popular') visiblePosts.sort((a, b) => b.likes - a.likes);
  else visiblePosts.sort((a, b) => b.id - a.id);

  postsElement.innerHTML = visiblePosts.map((post) => {
    const media = post.media
      ? post.media.type === 'image'
        ? `<img class="post-media" src="${escapeHTML(post.media.url)}" alt="Image shared by ${escapeHTML(post.author)}">`
        : post.short
          ? `<div class="short-media-wrap"><span class="short-media-label"><span>✦</span> SHORTS</span><video class="post-media short-video" src="${escapeHTML(post.media.url)}" controls playsinline loop preload="metadata" aria-label="Short video shared by ${escapeHTML(post.author)}"></video><div class="short-overlay"><div class="short-creator"><span class="avatar ${escapeHTML(post.avatar || 'avatar-you')}">${escapeHTML(post.initial || 'A')}</span><div><strong>${escapeHTML(post.author)}</strong><small>${escapeHTML(post.handle)}</small></div><button class="short-follow" type="button" data-action="follow" aria-pressed="${Boolean(post.following)}">${post.following ? 'Following' : 'Follow'}</button></div><p>${post.text ? escapeHTML(post.text) : 'A moment worth sharing.'}</p></div><div class="short-action-rail"><button class="short-action" type="button" data-action="like" aria-pressed="${post.liked}" aria-label="${post.liked ? 'Unlike' : 'Like'} · ${post.likes} likes"><span class="short-action-icon">♥</span><span>${post.likes}</span></button><button class="short-action" type="button" data-action="comment" aria-label="${post.comments.length} comments"><span class="short-action-icon">●</span><span>${post.comments.length}</span></button><button class="short-action" type="button" data-action="share" aria-label="Share short"><span class="short-action-icon">↗</span><span>Share</span></button><button class="short-action" type="button" data-action="bookmark" aria-pressed="${post.bookmarked}" aria-label="${post.bookmarked ? 'Remove saved short' : 'Save short'}"><span class="short-action-icon">${post.bookmarked ? '◆' : '◇'}</span><span>Save</span></button></div></div>`
          : `<video class="post-media" src="${escapeHTML(post.media.url)}" controls playsinline></video>`
      : '';
    const poll = post.poll ? (() => {
      const total = post.poll.votes.reduce((sum, count) => sum + count, 0);
      return `<div class="post-poll">${post.poll.question ? `<strong>${escapeHTML(post.poll.question)}</strong>` : ''}${post.poll.options.map((option, index) => {
        const percentage = total ? Math.round((post.poll.votes[index] / total) * 100) : 0;
        return `<button class="poll-choice" type="button" data-action="vote" data-index="${index}" data-post="${post.id}" ${post.poll.voted ? 'disabled' : ''}><span>${escapeHTML(option)}</span><span>${post.poll.voted ? `${percentage}% · ${post.poll.votes[index]} votes` : 'Vote'}</span></button>`;
      }).join('')}</div>`;
    })() : '';
    const comments = (post.comments || []).map((comment) => `<p class="post-comment"><strong>You</strong> ${escapeHTML(comment)}</p>`).join('');
    const copy = post.short && post.media?.type === 'video' ? '' : `<p class="post-copy">${escapeHTML(post.text).replace(/\n/g, '<br>')}</p>`;
    const feature = post.feature ? `<section class="post-feature" aria-label="${escapeHTML(post.feature.title)}"><div class="feature-kicker">${escapeHTML(post.feature.label)}</div><h3>${escapeHTML(post.feature.title)}</h3><div class="feature-metrics">${post.feature.metrics.map(([label, value]) => `<div class="feature-metric"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`).join('')}</div><p>${escapeHTML(post.feature.note)}</p></section>` : '';
    const isShort = post.short && post.media?.type === 'video';
    return `<article class="post-card glass-panel${isShort ? ' is-short' : ''}" data-post="${post.id}">
      <header class="post-header"><span class="avatar ${escapeHTML(post.avatar || 'avatar-you')}">${escapeHTML(post.initial || 'A')}</span><div class="post-author"><strong>${escapeHTML(post.author)}</strong><span>${escapeHTML(post.handle)} · ${escapeHTML(post.time)}</span></div><button class="icon-button" type="button" data-action="more" aria-label="Post options">···</button></header>
      ${copy}${feature}${media}${poll}
      <div class="post-actions"><button type="button" data-action="like" aria-pressed="${post.liked}">♥ <span>${post.likes}</span></button><button type="button" data-action="comment">♧ <span>${post.comments.length}</span></button><button type="button" data-action="share">↗ <span>Share</span></button><button type="button" data-action="bookmark" aria-pressed="${post.bookmarked}">${post.bookmarked ? '◆' : '◇'} <span>Save</span></button></div>
      ${comments}<form class="comment-form" data-post="${post.id}"><label class="visually-hidden" for="comment-${post.id}">Write a comment</label><input id="comment-${post.id}" name="comment" maxlength="240" placeholder="Write a thoughtful reply…" required><button type="submit">Reply</button></form>
    </article>`;
  }).join('');
  if (emptyState) emptyState.hidden = visiblePosts.length > 0;
}

function showDialog(title, content) {
  if (!dialog || !dialogTitle || !dialogBody) return;
  dialogTitle.textContent = title;
  dialogBody.textContent = content;
  if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
  else dialog.setAttribute('open', '');
}

function closeDialog() {
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
}

searchInput?.addEventListener('input', renderPosts);
feedFilter?.addEventListener('change', renderPosts);

byId('postForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const textInput = byId('postText');
  const text = textInput?.value.trim() || '';
  const question = byId('pollQuestion')?.value.trim() || '';
  const optionOne = byId('pollOptionOne')?.value.trim() || '';
  const optionTwo = byId('pollOptionTwo')?.value.trim() || '';
  const pollEnabled = byId('pollTrigger')?.getAttribute('aria-pressed') === 'true';
  const file = byId('imageInput')?.files?.[0] || byId('videoInput')?.files?.[0];

  if (!text && !file && !(pollEnabled && question && optionOne && optionTwo)) {
    textInput?.focus();
    return;
  }
  if (pollEnabled && (!question || !optionOne || !optionTwo)) {
    showDialog('Complete your poll', 'Add a question and two choices before posting.');
    return;
  }

  const newPost = {
    id: nextPostId++, author: 'Alex Dev', handle: '@alex_nxt', initial: 'A', avatar: 'avatar-you',
    time: 'just now', text, likes: 0, liked: false, comments: [], bookmarked: false
  };
  if (pollEnabled) newPost.poll = { question, options: [optionOne, optionTwo], votes: [0, 0], voted: false };
  if (file) {
    const isVideo = file.type.startsWith('video/');
    newPost.media = { type: isVideo ? 'video' : 'image', url: URL.createObjectURL(file) };
    newPost.short = isVideo && byId('shortTrigger')?.getAttribute('aria-pressed') === 'true';
  }
  posts.push(newPost);
  event.currentTarget.reset();
  if (byId('postText')) { byId('postText').maxLength = 500; byId('postText').placeholder = 'What’s on your mind, Alex?'; }
  byId('characterCount') && (byId('characterCount').textContent = '0 / 500');
  byId('pollBuilder') && (byId('pollBuilder').hidden = true);
  byId('pollTrigger')?.setAttribute('aria-pressed', 'false');
  byId('shortTrigger')?.setAttribute('aria-pressed', 'false');
  if (byId('shortHint')) byId('shortHint').hidden = true;
  clearMediaPreview('image');
  clearMediaPreview('video');
  renderPosts();
  byId('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

byId('postText')?.addEventListener('input', (event) => {
  const count = byId('characterCount');
  if (count) count.textContent = `${event.target.value.length} / 500`;
});

byId('pollTrigger')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  if (byId('pollBuilder')) byId('pollBuilder').hidden = !enabled;
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
      post.likes += post.liked ? 1 : -1;
      renderPosts();
      break;
    case 'bookmark':
      post.bookmarked = !post.bookmarked;
      renderPosts();
      break;
    case 'follow':
      post.following = !post.following;
      renderPosts();
      break;
    case 'vote': {
      if (post.poll && !post.poll.voted) {
        const index = Number(button.dataset.index);
        if (Number.isInteger(index) && index >= 0 && index < post.poll.votes.length) {
          post.poll.votes[index]++;
          post.poll.voted = true;
          renderPosts();
        }
      }
      break;
    }
    case 'comment':
      postsElement.querySelector(`#comment-${post.id}`)?.focus();
      break;
    case 'share':
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(`${location.href}#post-${post.id}`).then(() => showDialog('Link copied', 'A link to this post has been copied.')).catch(() => showDialog('Share post', location.href));
      else showDialog('Share post', location.href);
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
  renderPosts();
});

byId('closeDialog')?.addEventListener('click', closeDialog);
dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });

byId('imageInput')?.addEventListener('click', (event) => { if (event.target.files?.length) event.target.value = ''; });

byId('premiumTrigger')?.addEventListener('click', () => {
  const status = byId('premiumStatus');
  if (status) status.hidden = false;
  showDialog('Nexus+', 'Demo access is active. Enjoy exploring the community.');
});

byId('profileShortcut')?.addEventListener('click', () => showDialog('Alex Dev', '@alex_nxt · Your Nexus profile'));
byId('profileMenu')?.addEventListener('click', () => showDialog('Profile options', 'You are signed in as Alex Dev.'));
byId('seePeople')?.addEventListener('click', () => showDialog('People to know', 'Maya Chen · Jules Rivera · Sam Okafor'));
byId('marketBriefing')?.addEventListener('click', () => showDialog('Market note', 'These market figures are fictional interface examples, not live data or investment advice. Always review risk, liquidity, and your own objectives before making financial decisions.'));

for (const button of document.querySelectorAll('.follow-button')) {
  button.addEventListener('click', () => {
    const following = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!following));
    button.textContent = following ? '＋' : '✓';
    button.setAttribute('aria-label', `${following ? 'Follow' : 'Unfollow'} ${button.closest('.person')?.querySelector('.person-info strong')?.textContent || 'person'}`);
  });
}

document.querySelectorAll('.trend-link').forEach((button) => button.addEventListener('click', () => {
  if (searchInput) { searchInput.value = button.dataset.query || ''; renderPosts(); searchInput.focus(); }
}));

document.querySelectorAll('.story-card').forEach((button) => button.addEventListener('click', () => showDialog('Stories', button.dataset.story === 'Your story' ? 'Your story is ready for a new moment.' : `Viewing ${button.dataset.story}’s story.`)));
document.querySelectorAll('.chat-link').forEach((button) => button.addEventListener('click', () => showDialog(`Chat with ${button.dataset.chat}`, 'Messaging is available in this demo.')));

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
  const view = button.dataset.view;
  document.querySelectorAll('[data-view]').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  if (view === 'home') { byId('feed')?.scrollIntoView({ behavior: 'smooth' }); return; }
  const labels = { discover: 'Discover', notifications: 'Notifications', messages: 'Messages', profile: 'Profile' };
  showDialog(labels[view] || 'Nexus', `${labels[view] || 'This section'} is ready to explore.`);
}));

renderPosts();
