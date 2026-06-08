export const state = {
  videoId: null,
  transcript: null,
  searchQuery: '',
  activeTab: 'transcript',
  autoScroll: false,
  status: 'empty',
  errorMessage: '',
  currentEntryIndex: -1,

  apiKey: null,
  apiKeyExists: false,
  showSettings: false,
  apiKeyInputValue: '',

  summaryState: 'empty',
  summary: '',
  summaryError: '',

  authToken: null,
  isAuthenticated: false,
  showLoginForm: false,
  loginEmail: '',
  loginPassword: '',
  loginError: '',
  loginLoading: false,

  showFileSelector: false,
  folders: [],
  files: [],
  selectedFileId: null,
  fsLoading: false,
  fsError: '',
  newFileName: '',
  newFileFolderId: '',

  showCommentInput: false,
  commentText: '',
  commentSaving: false,

  root: null,
  shadow: null,
  timeListener: null,
  _pendingTick: false,
  _playerObserver: null,
};

export function resetForNewVideo() {
  state.transcript = null;
  state.searchQuery = '';
  state.autoScroll = false;
  state.status = 'empty';
  state.errorMessage = '';
  state.currentEntryIndex = -1;
  state.summaryState = 'empty';
  state.summary = '';
  state.summaryError = '';
  state.showLoginForm = false;
  state.showFileSelector = false;
  state.showCommentInput = false;
  state.isAuthenticated = false;
  state.authToken = null;
  state.selectedFileId = null;
  state.commentText = '';
  if (state.timeListener) {
    const v = document.querySelector('video');
    if (v) v.removeEventListener('timeupdate', state.timeListener);
    state.timeListener = null;
  }
}
