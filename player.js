'use strict';

// ===== Playlist — Кристина Дзейтова =====
const PLAYLIST = [
  { title: 'Воспоминания',                              file: encodeTrack('музыка/Кристина Дзейтова - Воспоминания.mp3'),                               duration: '0:00' },
  { title: 'Голоса звёзд',                              file: encodeTrack('музыка/Кристина Дзейтова - Голоса звёзд.mp3'),                               duration: '0:00' },
  { title: 'Письмо',                                    file: encodeTrack('музыка/Кристина Дзейтова - Письмо.mp3'),                                     duration: '0:00' },
  { title: 'Сновидения',                                file: encodeTrack('музыка/Кристина Дзейтова - Сновидения.mp3'),                                 duration: '0:00' },
  { title: 'Вечерний ручей (feat. Ксения Саврасова)',   file: encodeTrack('музыка/Кристина_Дзейтова_feat_Ксения_Саврасова_Вечерний_ручей.mp3'),         duration: '0:00' },
  { title: 'Вальс тающей снежинки',                     file: encodeTrack('музыка/Кристина_Дзейтова_Вальс_тающей_снежинки.mp3'),                        duration: '0:00' },
  { title: 'Вечерний ручей',                            file: encodeTrack('музыка/Кристина_Дзейтова_Вечерний_ручей.mp3'),                               duration: '0:00' },
  { title: 'Горные светлячки',                          file: encodeTrack('музыка/Кристина_Дзейтова_Горные_светлячки.mp3'),                             duration: '0:00' },
  { title: 'Земля одиноких',                            file: encodeTrack('музыка/Кристина_Дзейтова_Земля_одиноких.mp3'),                               duration: '0:00' },
  { title: 'Корабль в океане',                          file: encodeTrack('музыка/Кристина_Дзейтова_Корабль_в_океане.mp3'),                             duration: '0:00' },
  { title: 'Мерцающие звезды',                          file: encodeTrack('музыка/Кристина_Дзейтова_Мерцающие_звезды.mp3'),                             duration: '0:00' },
  { title: 'Сны вселенной',                             file: encodeTrack('музыка/Кристина_Дзейтова_Сны_вселенной.mp3'),                                duration: '0:00' },
  { title: 'Там, где поют деревья',                     file: encodeTrack('музыка/Кристина_Дзейтова_Там,_где_поют_деревья.mp3'),                        duration: '0:00' },
  { title: 'Туман на рассвете',                         file: encodeTrack('музыка/Кристина_Дзейтова_Туман_на_рассвете.mp3'),                            duration: '0:00' },
  { title: 'Улетают птицы',                             file: encodeTrack('музыка/Кристина_Дзейтова_Улетают_птицы.mp3'),                                duration: '0:00' },
];

// Кодирует путь к файлу (кириллица и спецсимволы)
function encodeTrack(path) {
  return path.split('/').map(s => encodeURIComponent(s)).join('/');
}

// ===== Config =====
const CONFIG = {
  RESTART_THRESHOLD_SEC: 3,
  SEEK_STEP_SEC: 10,
  DEFAULT_VOLUME: 0.75,
  BG_UPDATE_INTERVAL_MS: 5 * 60 * 1000,
};

// ===== State =====
const State = {
  currentTrack: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 'none',
  volume: CONFIG.DEFAULT_VOLUME,
  isSeeking: false,
  isVolumeChanging: false,
};

// ===== DOM =====
const DOM = {};

function bindDOM() {
  DOM.audioPlayer = document.getElementById('audioPlayer');
  DOM.bgVideo = document.getElementById('bgVideo');

  DOM.timeMinutes = document.getElementById('timeMinutes');
  DOM.timeSeconds = document.getElementById('timeSeconds');
  DOM.trackTitle = document.getElementById('trackTitle');
  DOM.trackMarquee = document.getElementById('trackMarquee');
  DOM.metaKbps = document.getElementById('metaKbps');
  DOM.metaKhz = document.getElementById('metaKhz');
  DOM.metaStereo = document.getElementById('metaStereo');

  DOM.seekBar = document.getElementById('seekBar');
  DOM.seekFill = document.getElementById('seekFill');
  DOM.seekThumb = document.getElementById('seekThumb');

  DOM.volumeBar = document.getElementById('volumeBar');
  DOM.volumeFill = document.getElementById('volumeFill');
  DOM.volumeThumb = document.getElementById('volumeThumb');

  DOM.prevBtn = document.getElementById('prevBtn');
  DOM.rewindBtn = document.getElementById('rewindBtn');
  DOM.playBtn = document.getElementById('playBtn');
  DOM.pauseBtn = document.getElementById('pauseBtn');
  DOM.stopBtn = document.getElementById('stopBtn');
  DOM.forwardBtn = document.getElementById('forwardBtn');
  DOM.nextBtn = document.getElementById('nextBtn');
  DOM.shuffleBtn = document.getElementById('shuffleBtn');
  DOM.repeatBtn = document.getElementById('repeatBtn');

  DOM.playlistBody = document.getElementById('playlistBody');
  DOM.playlistCount = document.getElementById('playlistCount');
  DOM.playlistTotalTime = document.getElementById('playlistTotalTime');
  DOM.playlistTotalTracks = document.getElementById('playlistTotalTracks');
}

// ===== Init =====
function init() {
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  bindDOM();
  bindEvents();
  renderPlaylist();
  loadTrack(0);
  setVolume(State.volume);
  updateTimeOfDayBackground();

  setInterval(updateTimeOfDayBackground, CONFIG.BG_UPDATE_INTERVAL_MS);
}

// ===== Events =====
function bindEvents() {
  DOM.playBtn.addEventListener('click', play);
  DOM.pauseBtn.addEventListener('click', pause);
  DOM.stopBtn.addEventListener('click', stop);
  DOM.prevBtn.addEventListener('click', prevTrack);
  DOM.nextBtn.addEventListener('click', nextTrack);
  DOM.rewindBtn.addEventListener('click', () => seekRelative(-CONFIG.SEEK_STEP_SEC));
  DOM.forwardBtn.addEventListener('click', () => seekRelative(CONFIG.SEEK_STEP_SEC));

  DOM.shuffleBtn.addEventListener('click', toggleShuffle);
  DOM.repeatBtn.addEventListener('click', toggleRepeat);

  DOM.audioPlayer.addEventListener('timeupdate', onTimeUpdate);
  DOM.audioPlayer.addEventListener('ended', onTrackEnded);
  DOM.audioPlayer.addEventListener('loadedmetadata', onMetadataLoaded);
  DOM.audioPlayer.addEventListener('error', onAudioError);

  DOM.seekBar.addEventListener('pointerdown', onSeekStart);
  document.addEventListener('pointermove', onSeekMove);
  document.addEventListener('pointerup', onSeekEnd);

  DOM.volumeBar.addEventListener('pointerdown', onVolumeStart);
  document.addEventListener('pointermove', onVolumeMove);
  document.addEventListener('pointerup', onVolumeEnd);
}

// ===== Transport Controls =====
function play() {
  if (PLAYLIST.length === 0) return;

  DOM.audioPlayer.play().then(() => {
    State.isPlaying = true;
    DOM.playBtn.classList.add('active');
  }).catch(err => {
    console.warn('Play failed:', err.message);
  });
}

function pause() {
  DOM.audioPlayer.pause();
  State.isPlaying = false;
  DOM.playBtn.classList.remove('active');
}

function stop() {
  DOM.audioPlayer.pause();
  DOM.audioPlayer.currentTime = 0;
  State.isPlaying = false;
  DOM.playBtn.classList.remove('active');
  updateTimeDisplay(0);
  updateSeekBar(0);
}

function prevTrack() {
  if (DOM.audioPlayer.currentTime > CONFIG.RESTART_THRESHOLD_SEC) {
    DOM.audioPlayer.currentTime = 0;
    return;
  }

  let idx = State.currentTrack - 1;
  if (idx < 0) idx = PLAYLIST.length - 1;
  loadTrack(idx);
  if (State.isPlaying) play();
}

function nextTrack() {
  let idx;
  if (State.isShuffle) {
    idx = Math.floor(Math.random() * PLAYLIST.length);
    if (idx === State.currentTrack && PLAYLIST.length > 1) {
      idx = (idx + 1) % PLAYLIST.length;
    }
  } else {
    idx = (State.currentTrack + 1) % PLAYLIST.length;
  }
  loadTrack(idx);
  if (State.isPlaying) play();
}

function seekRelative(seconds) {
  const audio = DOM.audioPlayer;
  if (!audio.duration) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
}

// ===== Shuffle / Repeat =====
function toggleShuffle() {
  State.isShuffle = !State.isShuffle;
  DOM.shuffleBtn.classList.toggle('active', State.isShuffle);
}

function toggleRepeat() {
  const modes = ['none', 'all', 'one'];
  const idx = (modes.indexOf(State.repeatMode) + 1) % modes.length;
  State.repeatMode = modes[idx];

  DOM.repeatBtn.classList.toggle('active', State.repeatMode !== 'none');
  DOM.repeatBtn.textContent = State.repeatMode === 'one' ? '🔂' : '🔁';
}

// ===== Track Loading =====
function loadTrack(index) {
  if (index < 0 || index >= PLAYLIST.length) return;

  State.currentTrack = index;
  const track = PLAYLIST[index];

  DOM.audioPlayer.src = track.file;
  DOM.trackTitle.textContent = `${index + 1}. ${track.title}`;

  updateTimeDisplay(0);
  updateSeekBar(0);
  highlightPlaylistTrack(index);
}

// ===== Audio Event Handlers =====
function onTimeUpdate() {
  if (State.isSeeking) return;

  const audio = DOM.audioPlayer;
  const currentTime = audio.currentTime;
  const duration = audio.duration || 0;

  updateTimeDisplay(currentTime);

  if (duration > 0) {
    updateSeekBar(currentTime / duration);
  }
}

function onTrackEnded() {
  if (State.repeatMode === 'one') {
    DOM.audioPlayer.currentTime = 0;
    play();
  } else if (State.repeatMode === 'all' || State.currentTrack < PLAYLIST.length - 1) {
    nextTrack();
  } else {
    stop();
  }
}

function onMetadataLoaded() {
  DOM.metaKbps.textContent = '320';
  DOM.metaKhz.textContent = '44';
  DOM.metaStereo.textContent = 'STEREO';

  // Обновляем длительность трека в плейлисте
  const dur = DOM.audioPlayer.duration;
  if (dur && isFinite(dur)) {
    const m = Math.floor(dur / 60);
    const s = Math.floor(dur % 60);
    PLAYLIST[State.currentTrack].duration = `${m}:${s.toString().padStart(2, '0')}`;
    renderPlaylist();
  }
}

function onAudioError() {
  DOM.trackTitle.textContent = 'Error loading track';
  DOM.metaKbps.textContent = '---';
  DOM.metaKhz.textContent = '--';
}

// ===== UI Updates =====
function updateTimeDisplay(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  DOM.timeMinutes.textContent = m.toString().padStart(2, '0');
  DOM.timeSeconds.textContent = s.toString().padStart(2, '0');
}

function updateSeekBar(ratio) {
  const pct = (ratio * 100).toFixed(2) + '%';
  DOM.seekFill.style.width = pct;
  DOM.seekThumb.style.left = pct;
}

// ===== Seek Bar Interaction =====
function onSeekStart(e) {
  State.isSeeking = true;
  updateSeekFromPointer(e);
}

function onSeekMove(e) {
  if (!State.isSeeking) return;
  updateSeekFromPointer(e);
}

function onSeekEnd(e) {
  if (!State.isSeeking) return;
  State.isSeeking = false;

  const rect = DOM.seekBar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  updateSeekBar(ratio);

  const audio = DOM.audioPlayer;
  if (audio.duration) {
    audio.currentTime = ratio * audio.duration;
  }
  updateTimeDisplay(audio.currentTime);
}

function updateSeekFromPointer(e) {
  const rect = DOM.seekBar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  updateSeekBar(ratio);
  updateTimeDisplay(ratio * (DOM.audioPlayer.duration || 0));
}

// ===== Volume Interaction =====
function setVolume(vol) {
  State.volume = vol;
  DOM.audioPlayer.volume = vol;
  const pct = (vol * 100).toFixed(0) + '%';
  DOM.volumeFill.style.width = pct;
  DOM.volumeThumb.style.left = pct;
}

function onVolumeStart(e) {
  State.isVolumeChanging = true;
  updateVolumeFromPointer(e);
}

function onVolumeMove(e) {
  if (!State.isVolumeChanging) return;
  updateVolumeFromPointer(e);
}

function onVolumeEnd() {
  if (!State.isVolumeChanging) return;
  State.isVolumeChanging = false;
}

function updateVolumeFromPointer(e) {
  const rect = DOM.volumeBar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  setVolume(ratio);
}

// ===== Playlist =====
function renderPlaylist() {
  DOM.playlistBody.innerHTML = '';

  PLAYLIST.forEach((track, i) => {
    const div = document.createElement('div');
    div.className = 'playlist-track';
    div.dataset.index = i;

    const num = document.createElement('span');
    num.className = 'track-num';
    num.textContent = `${i + 1}.`;

    const title = document.createElement('span');
    title.className = 'track-title';
    title.textContent = track.title;

    const dur = document.createElement('span');
    dur.className = 'track-duration';
    dur.textContent = track.duration;

    div.appendChild(num);
    div.appendChild(title);
    div.appendChild(dur);

    div.addEventListener('click', () => {
      loadTrack(i);
      play();
    });

    DOM.playlistBody.appendChild(div);
  });

  DOM.playlistCount.textContent = `${PLAYLIST.length} tracks`;
  DOM.playlistTotalTracks.textContent = PLAYLIST.length;

  let totalSeconds = 0;
  PLAYLIST.forEach(t => {
    const parts = t.duration.split(':');
    totalSeconds += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  });
  const totalMin = Math.floor(totalSeconds / 60);
  const totalSec = totalSeconds % 60;
  DOM.playlistTotalTime.textContent = `${totalMin}:${totalSec.toString().padStart(2, '0')}`;
}

function highlightPlaylistTrack(index) {
  const tracks = DOM.playlistBody.querySelectorAll('.playlist-track');
  tracks.forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });
}

// ===== Time of Day Background =====
function updateTimeOfDayBackground() {
  const hour = new Date().getHours();
  let timeOfDay;

  if (hour >= 6 && hour < 10) {
    timeOfDay = 'sunrise';
  } else if (hour >= 10 && hour < 17) {
    timeOfDay = 'day';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'sunset';
  } else {
    timeOfDay = 'night';
  }

  // const videoSources = {
  //   sunrise: 'videos/city-sunrise.mp4',
  //   day: 'videos/city-day.mp4',
  //   sunset: 'videos/city-sunset.mp4',
  //   night: 'videos/city-night.mp4'
  // };
  // DOM.bgVideo.src = videoSources[timeOfDay];

  const bgColors = {
    sunrise: 'linear-gradient(180deg, #1a0a2e, #2e1a0a, #1a1a2e)',
    day:     'linear-gradient(180deg, #0a1a2e, #1a2a3e, #0a1a2e)',
    sunset:  'linear-gradient(180deg, #2e1a0a, #1a0a1a, #0a0a1a)',
    night:   'linear-gradient(180deg, #0a0a14, #0a0a1e, #0a0a14)',
  };

  document.body.style.background = bgColors[timeOfDay];
  document.body.dataset.timeOfDay = timeOfDay;
}

// ===== Start =====
document.addEventListener('DOMContentLoaded', init);
