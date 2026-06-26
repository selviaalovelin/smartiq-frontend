import { useEffect, useMemo, useState } from 'react';
import {
  FaBrain,
  FaChartBar,
  FaChartLine,
  FaArrowRight,
  FaBroadcastTower,
  FaFileAlt,
  FaCog,
  FaEdit,
  FaHome,
  FaImage,
  FaList,
  FaPencilAlt,
  FaPlus,
  FaTasks,
  FaTimes,
  FaTrash,
  FaUserCircle,
  FaUserPlus,
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

const starterQuizzes = [
  {
    id: 'quiz-1',
    title: 'Soal Quiz 1',
    category: 'Layanan Web',
    questions: [
      {
        text: 'Apa fungsi utama dari sistem operasi dalam sebuah komputer?',
        answers: [
          'Melakukan perhitungan matematika yang kompleks.',
          'Mengelola sumber daya perangkat keras dan menyediakan layanan untuk aplikasi.',
          'Menyimpan data secara permanen di dalam hard disk.',
          'Menghubungkan komputer langsung ke jaringan internet tanpa kabel.',
        ],
        correct: 'B',
      },
    ],
  },
  { id: 'quiz-2', title: 'Soal Quiz 2', category: 'Layanan Web', questions: [] },
  { id: 'quiz-3', title: 'Soal Quiz 3', category: 'Pemrograman Internet', questions: [] },
  { id: 'quiz-4', title: 'Soal Quiz 4', category: 'Pemrograman Internet', questions: [] },
];

const isBackendId = (id) => /^\d+$/.test(String(id));
const normalizeBackendQuiz = (quiz) => ({
    id: String(quiz.id),
    title: quiz.title,
    category: quiz.category || 'Layanan Web',
    pin: quiz.pin,
    status: quiz.status || 'draft',
    createdAt: quiz.created_at || quiz.createdAt || '',
    questions: (quiz.questions || []).map((question) => ({
      id: String(question.id),
      text: question.text,
      image: question.image || '',
      answers: Array.isArray(question.answers) ? question.answers : [],
      correct: question.correct,
      timeLimit: Number(question.time_limit ?? question.timeLimit ?? 10),
    })),
  });

const normalizeBackendAssignment = (assignment) => {
  const deadline = new Date(assignment.deadline);
  const createdAt = new Date(assignment.created_at);
  const quiz = assignment.quiz || {};

  return {
    id: String(assignment.id),
    quizId: String(assignment.quiz_id),
    title: quiz.title || 'Kuis',
    startDate: Number.isNaN(createdAt.valueOf()) ? '-' : createdAt.toLocaleDateString('id-ID'),
    endDate: Number.isNaN(deadline.valueOf()) ? assignment.deadline : deadline.toLocaleDateString('id-ID'),
    endTime: Number.isNaN(deadline.valueOf()) ? '' : deadline.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    host: assignment.host || 'Pengajar',
    pin: quiz.pin || '-',
    url: `${window.location.origin}?pin=${quiz.pin || ''}`,
  };
};

async function requestJson(path, options = {}) {
  const session = JSON.parse(window.localStorage.getItem('smartq-session') || 'null');
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = new Error(payload?.message || `Request gagal: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function Brand() {
  return (
    <strong className="brand">
      SMARTQ <FaBrain className="brand-icon" aria-hidden="true" />
    </strong>
  );
}

const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const PIN_LENGTH = 6;
const MAX_EMAIL_LENGTH = 150;
const MAX_PASSWORD_LENGTH = 100;
const MAX_NAME_LENGTH = 100;
const MAX_TITLE_LENGTH = 150;
const MAX_CATEGORY_LENGTH = 100;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const isPinValid = (value) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value);
const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const yearOptions = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() + index);
const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1);
const hourOptions = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);

const formatDate = ({ day, month, year }) => `${day} ${monthNames[month - 1]} ${year}`;
const slugifyTitle = (title) => title.replace(/\s+/g, '').replace(/[^\w]/g, '') || 'soalQuiz';
const formatCreatedDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return '-';
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function FieldError({ message }) {
  return message ? <p className="field-error">{message}</p> : null;
}

function HomePage({ onNavigate, onJoin }) {
  const [pin, setPin] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const pinError = submitted
    ? !pin.trim()
      ? 'PIN soal wajib diisi.'
      : !isPinValid(pin)
        ? `PIN harus ${PIN_LENGTH} digit angka.`
        : ''
    : '';

  const handlePin = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isPinValid(pin)) {
      return;
    }

    const result = await onJoin(pin);
    if (!result?.ok) {
      setServerError(result?.message || 'PIN kuis tidak ditemukan.');
    }
  };

  return (
    <section className="page blue-page home-page">
      <nav className="top-nav">
        <button className="nav-button active" type="button" onClick={() => onNavigate('home')}><FaHome /> Beranda</button>
        <button className="nav-button" type="button" onClick={() => onNavigate('login')}><FaPencilAlt /> Buat Kuis</button>
      </nav>

      <div className="home-content">
        <Brand />
        <form className="pin-card" onSubmit={handlePin} noValidate>
          <input
            className={pinError || serverError ? 'input-error' : ''}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.slice(0, PIN_LENGTH));
              setServerError('');
              if (submitted) {
                setSubmitted(false);
              }
            }}
            placeholder="Pin Soal"
            inputMode="numeric"
            maxLength={PIN_LENGTH}
          />
          <FieldError message={pinError} />
          <FieldError message={serverError} />
          <button className={!isPinValid(pin) ? 'is-disabled' : ''} disabled={!isPinValid(pin)} type="submit">Masuk</button>
        </form>
      </div>
    </section>
  );
}

function ParticipantNamePage({ onStart }) {
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const nameError = submitted
    ? !nickname.trim()
      ? 'Nama panggilan wajib diisi.'
      : nickname.trim().length > MAX_NAME_LENGTH
        ? `Nama panggilan maksimal ${MAX_NAME_LENGTH} karakter.`
        : ''
    : '';

  const handleJoin = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!nickname.trim() || nickname.trim().length > MAX_NAME_LENGTH) {
      return;
    }
    const result = await onStart(nickname.trim());
    if (!result?.ok) {
      setServerError(result?.message || 'Peserta belum bisa bergabung.');
    }
  };

  return (
    <section className="page participant-login classroom-scene">
      <div className="participant-content">
        <Brand />
        <form className="participant-card" onSubmit={handleJoin} noValidate>
          <input
            className={nameError ? 'input-error' : ''}
            value={nickname}
            onChange={(event) => {
              setNickname(event.target.value.slice(0, MAX_NAME_LENGTH));
              setServerError('');
              if (submitted) {
                setSubmitted(false);
              }
            }}
            placeholder="Nama panggilan"
          />
          <FieldError message={nameError} />
          <FieldError message={serverError} />
          <button className={!nickname.trim() ? 'is-disabled' : ''} disabled={!nickname.trim()} type="submit">Oke, Mulai!</button>
        </form>
      </div>
    </section>
  );
}

function ParticipantWaitingPage({ pin, participantName, onReady }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const payload = await requestJson(`/api/quizzes/pin/${pin}`);
        setMessage('');
        if (payload?.data?.status === 'started') {
          onReady();
        }
      } catch {
        setMessage('Koneksi terputus. Sistem akan mencoba kembali.');
      }
    };

    checkQuizStatus();
    const timer = window.setInterval(checkQuizStatus, 2000);
    return () => window.clearInterval(timer);
  }, [pin, onReady]);

  return (
    <section className="page live-page live-wait-page">
      <div className="live-wait-card">
        <p>Anda sudah masuk, tunggu penyelenggara kuis memulai kuis!</p>
        <strong>{participantName || 'Peserta'}</strong>
        <span>PIN {pin || '109276'}</span>
        {message && <FieldError message={message} />}
      </div>
    </section>
  );
}

function AuthPage({ mode, onNavigate, onAuthenticate }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  const errors = {
    email: !form.email.trim()
      ? 'Email wajib diisi.'
      : !isEmailValid(form.email)
        ? 'Format email belum benar.'
        : form.email.length > MAX_EMAIL_LENGTH
          ? `Email maksimal ${MAX_EMAIL_LENGTH} karakter.`
          : '',
    password: !form.password
      ? 'Kata sandi wajib diisi.'
      : form.password.length < 8
        ? 'Kata sandi minimal 8 karakter.'
        : form.password.length > MAX_PASSWORD_LENGTH
          ? `Kata sandi maksimal ${MAX_PASSWORD_LENGTH} karakter.`
          : '',
    confirmPassword: isRegister
      ? !form.confirmPassword
        ? 'Konfirmasi kata sandi wajib diisi.'
        : form.confirmPassword !== form.password
          ? 'Konfirmasi kata sandi harus sama.'
          : ''
      : '',
  };

  const showError = (field) => (submitted || touched[field]) ? errors[field] : '';
  const isFormValid = !errors.email && !errors.password && !errors.confirmPassword;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isFormValid) {
      return;
    }
    try {
      const payload = await requestJson(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      onAuthenticate(payload.data);
      onNavigate('dashboard');
    } catch (error) {
      setServerError(isRegister ? 'Email sudah terdaftar atau pendaftaran gagal.' : 'Email atau kata sandi salah.');
    }
  };

  return (
    <section className="page blue-page auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <label>Email:</label>
        <input
          className={showError('email') ? 'input-error' : ''}
          type="email"
          value={form.email}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          maxLength={MAX_EMAIL_LENGTH}
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="Masukkan Email Anda"
        />
        <FieldError message={showError('email')} />

        <label>Kata Sandi:</label>
        <input
          className={showError('password') ? 'input-error' : ''}
          type="password"
          value={form.password}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          maxLength={MAX_PASSWORD_LENGTH}
          onChange={(event) => updateField('password', event.target.value)}
          placeholder="Masukkan Kata Sandi Anda"
        />
        <FieldError message={showError('password')} />

        {isRegister && (
          <>
            <label>Konfirmasi Kata Sandi:</label>
            <input
              className={showError('confirmPassword') ? 'input-error' : ''}
              type="password"
              value={form.confirmPassword}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              maxLength={MAX_PASSWORD_LENGTH}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Konfirmasi Kata Sandi Anda"
            />
            <FieldError message={showError('confirmPassword')} />
          </>
        )}

        <button className={`primary-button ${!isFormValid ? 'is-disabled' : ''}`} disabled={!isFormValid} type="submit">{isRegister ? 'Daftar' : 'Masuk'}</button>
        <FieldError message={serverError} />

        <p>
          {isRegister ? 'Sudah punya akun?' : 'Belum memiliki akun?'}
          <button className="inline-button" type="button" onClick={() => onNavigate(isRegister ? 'login' : 'register')}>
            {isRegister ? ' Masuk' : ' Daftar'}
          </button>
        </p>
      </form>
    </section>
  );
}

function DashboardPage({ quizzes, assignments, activePanel, setActivePanel, onCreate, onEdit, onStartLive, onAssign, onDelete, onLogout }) {
  const [keyword, setKeyword] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');
  const [copiedValue, setCopiedValue] = useState('');

  const totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
  const today = new Date().toDateString();
  const createdToday = quizzes.filter((quiz) => quiz.createdAt && new Date(quiz.createdAt).toDateString() === today).length;
  const finishedReports = assignments.length;
  const filteredQuizzes = quizzes.filter((quiz) => (
    `${quiz.title} ${quiz.category} ${formatCreatedDate(quiz.createdAt)}`
      .toLowerCase()
      .includes(keyword.toLowerCase())
  ));

  const groupedReports = useMemo(() => {
    return quizzes.reduce((result, quiz) => {
      result[quiz.category] = (result[quiz.category] || 0) + quiz.questions.length;
      return result;
    }, {});
  }, [quizzes]);

  const copyText = async (value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedValue(value);
      window.setTimeout(() => setCopiedValue(''), 1500);
    } catch {
      window.prompt('Salin manual:', value);
    }
  };

  return (
    <section className="page dashboard-page">
      <header className="dashboard-header">
        <Brand />
        <div className="dashboard-actions">
          <button className="create-button" type="button" onClick={onCreate}>Buat Kuis</button>
          <button className="profile-button" type="button" onClick={onLogout} title="Keluar dari akun" aria-label="Keluar dari akun">
            <FaUserCircle className="profile-icon" />
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <button className={activePanel === 'beranda' ? 'active' : ''} type="button" onClick={() => setActivePanel('beranda')}><FaHome /> Beranda</button>
          <button className={activePanel === 'pustaka' ? 'active' : ''} type="button" onClick={() => setActivePanel('pustaka')}><FaList /> Pustaka</button>
          <button className={activePanel === 'laporan' ? 'active' : ''} type="button" onClick={() => setActivePanel('laporan')}><FaChartLine /> Laporan</button>
        </aside>

        <main className="dashboard-content">
          {activePanel === 'beranda' && (
            <>
              <div className="stat-grid">
                <button className="stat-card" type="button" onClick={() => setActivePanel('pustaka')}>
                  <h2>Total soal</h2>
                  <FaFileAlt className="stat-icon" />
                  <strong>{totalQuestions} Soal</strong>
                </button>
                <button className="stat-card" type="button" onClick={() => setActivePanel('pustaka')}>
                  <h2>Dibuat Hari Ini</h2>
                  <FaPencilAlt className="stat-icon" />
                  <strong>{createdToday} Soal</strong>
                </button>
                <button className="stat-card" type="button" onClick={() => setActivePanel('laporan')}>
                  <h2>Laporan Selesai</h2>
                  <FaChartBar className="stat-icon" />
                  <strong>{finishedReports} Laporan</strong>
                </button>
              </div>
              <article className="activity-card">
                <h2>Aktivitas Terbaru</h2>
                {quizzes[0] ? (
                  <p>
                    Buat soal: {quizzes[0].title}
                    <span>{quizzes[0].category} - {formatCreatedDate(quizzes[0].createdAt)}</span>
                  </p>
                ) : (
                  <p>Belum ada kuis</p>
                )}
              </article>
            </>
          )}

          {activePanel === 'pustaka' && (
            <>
              <input className="search-input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari" />
              <div className="quiz-table">
                <div className="quiz-row head">
                  <strong aria-label="Nama kuis"></strong>
                  <strong>Kategori</strong>
                  <strong>Tanggal dibuat</strong>
                  <strong>Aksi</strong>
                </div>
                {filteredQuizzes.map((quiz) => (
                  <div className="quiz-row" key={quiz.id}>
                    <span>{quiz.title}</span>
                    <span>{quiz.category || '-'}</span>
                    <span>{formatCreatedDate(quiz.createdAt)}</span>
                    <div className="quiz-actions-menu">
                      <button className="dots-button" type="button" onClick={() => setOpenMenuId((current) => (current === quiz.id ? '' : quiz.id))}><BsThreeDotsVertical /></button>
                      {openMenuId === quiz.id && (
                        <div className="quiz-menu">
                          <button type="button" onClick={() => { setOpenMenuId(''); onStartLive(quiz.id); }}><FaBroadcastTower /> Selenggarakan live</button>
                          <button type="button" onClick={() => { setOpenMenuId(''); onAssign(quiz.id); }}><FaUserPlus /> Tugaskan</button>
                          <button type="button" onClick={() => { setOpenMenuId(''); onEdit(quiz.id); }}><FaEdit /> Edit</button>
                          <button type="button" onClick={() => { setOpenMenuId(''); onDelete(quiz.id); }}><FaTrash /> Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'laporan' && (
            <div className="report-grid">
              {Object.entries(groupedReports).map(([category, count]) => (
                <article className="report-card" key={category}>
                  <h3>{category}</h3>
                  <strong>{count ? `${count} Soal Tersedia` : 'Belum Tersedia Soal'}</strong>
                  <button type="button" onClick={() => setActivePanel('pustaka')}>Lihat Selengkapnya</button>
                </article>
              ))}
              {assignments.map((assignment) => (
                <article className="assignment-report-card" key={assignment.id}>
                  <div>
                    <span>Laporan</span>
                    <strong>{assignment.title}</strong>
                  </div>
                  <dl>
                    <div><dt>Tanggal mulai:</dt><dd>{assignment.startDate}</dd></div>
                    <div><dt>Tanggal selesai:</dt><dd>{assignment.endDate}</dd></div>
                    <div><dt>Diselenggarakan oleh:</dt><dd>{assignment.host}</dd></div>
                    <div><dt>Pin game:</dt><dd>{assignment.pin}</dd><button type="button" onClick={() => copyText(assignment.pin)}>{copiedValue === assignment.pin ? 'Tersalin' : 'Salin'}</button></div>
                    <div><dt>URL:</dt><dd>{assignment.url}</dd><button type="button" onClick={() => copyText(assignment.url)}>{copiedValue === assignment.url ? 'Tersalin' : 'Salin'}</button></div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

const createEmptyQuestion = () => ({
  text: '',
  image: '',
  answers: ['', '', '', ''],
  correct: 'A',
  timeLimit: 10,
});

function CreateQuizModal({ onClose, onSubmit }) {
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const hasCategory = Boolean(category || newCategory.trim());
  const categoryTooLong = newCategory.trim().length > MAX_CATEGORY_LENGTH;
  const canSubmit = hasCategory && !categoryTooLong;
  const categoryError = submitted
    ? !hasCategory
      ? 'Kategori kuis wajib dipilih atau ditambahkan.'
      : categoryTooLong
        ? `Kategori maksimal ${MAX_CATEGORY_LENGTH} karakter.`
        : ''
    : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) {
      return;
    }
    const created = await onSubmit({
      category: newCategory.trim() || category,
    });
    if (!created?.ok) {
      setServerError(created?.message || 'Kuis belum berhasil dibuat. Periksa koneksi backend.');
    }
  };

  return (
    <div className="modal">
      <form className="modal-card" onSubmit={handleSubmit} noValidate>
        <select className={categoryError ? 'input-error' : ''} value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Pilih Kategori Kuis</option>
          <option>Layanan Web</option>
          <option>Pemrograman Internet</option>
          <option>Sistem Operasi</option>
        </select>
        <div className="category-field">
          <input className={categoryError ? 'input-error' : ''} value={newCategory} maxLength={MAX_CATEGORY_LENGTH} onChange={(event) => setNewCategory(event.target.value)} placeholder="Tambah Kategori" />
          <button className="add-category-button" type="button" onClick={() => setCategory('')} aria-label="Tambah kategori"><FaPlus /></button>
        </div>
        <FieldError message={categoryError} />
        <FieldError message={serverError} />
        <button className={!canSubmit ? 'is-disabled' : ''} disabled={!canSubmit} type="submit">Lanjutkan membuat soal <FaArrowRight /></button>
        <button className="modal-close" type="button" onClick={onClose}>Batalkan</button>
      </form>
    </div>
  );
}

function AssignQuizModal({ quiz, onClose, onSubmit }) {
  const initialDeadline = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    value.setMinutes(0, 0, 0);
    return {
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear(),
      hour: `${String(value.getHours()).padStart(2, '0')}:00`,
    };
  }, []);
  const [deadline, setDeadline] = useState(initialDeadline);
  const [error, setError] = useState('');

  const updateDeadline = (field, value) => {
    setDeadline((current) => ({
      ...current,
      [field]: field === 'day' || field === 'month' || field === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const deadlineDate = new Date(deadline.year, deadline.month - 1, deadline.day, Number(deadline.hour.slice(0, 2)));
    if (
      deadlineDate.getFullYear() !== deadline.year
      || deadlineDate.getMonth() !== deadline.month - 1
      || deadlineDate.getDate() !== deadline.day
    ) {
      setError('Tanggal yang dipilih tidak valid.');
      return;
    }
    if (deadlineDate <= new Date()) {
      setError('Batas waktu harus lebih besar dari waktu sekarang.');
      return;
    }
    setError('');
    const created = await onSubmit({
      quizId: quiz.id,
      deadline: deadlineDate.toISOString(),
    });
    if (!created) {
      setError('Tugas belum berhasil dibuat. Periksa batas waktu atau koneksi backend.');
    }
  };

  return (
    <div className="assignment-modal-layer">
      <form className="assignment-modal" onSubmit={handleSubmit}>
        <p>Peserta harus menyelesaikannya sebelum:</p>
        <div className="assignment-fields">
          <label>
            Tanggal
            <div className="date-select-grid">
              <select value={deadline.day} onChange={(event) => updateDeadline('day', event.target.value)}>
                {dayOptions.map((day) => <option value={day} key={day}>{day}</option>)}
              </select>
              <select value={deadline.month} onChange={(event) => updateDeadline('month', event.target.value)}>
                {monthNames.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}
              </select>
              <select value={deadline.year} onChange={(event) => updateDeadline('year', event.target.value)}>
                {yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}
              </select>
            </div>
          </label>
          <label>
            Jam
            <select value={deadline.hour} onChange={(event) => updateDeadline('hour', event.target.value)}>
              {hourOptions.map((hour) => <option value={hour} key={hour}>{hour}</option>)}
            </select>
          </label>
        </div>
        <FieldError message={error} />
        <div className="assignment-actions">
          <button className="assignment-cancel" type="button" onClick={onClose}>Batal</button>
          <button className="assignment-submit" type="submit">Buat</button>
        </div>
      </form>
    </div>
  );
}

function EditorPage({ quiz, onNavigate, onSaveQuiz }) {
  const [title, setTitle] = useState(quiz.title);
  const [questions, setQuestions] = useState(() => (
    quiz.questions.length ? quiz.questions.map((question) => ({ timeLimit: 10, ...question })) : [createEmptyQuestion()]
  ));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showProperties, setShowProperties] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [saveError, setSaveError] = useState('');
  const [imageError, setImageError] = useState('');
  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  const titleError = (submitted || touched.title)
    ? !title.trim()
      ? 'Judul kuis wajib diisi.'
      : title.trim().length > MAX_TITLE_LENGTH
        ? `Judul kuis maksimal ${MAX_TITLE_LENGTH} karakter.`
        : ''
    : '';
  const questionError = (submitted || touched[`question-${activeQuestionIndex}`]) && !activeQuestion.text.trim() ? 'Pertanyaan wajib diisi.' : '';
  const timeLimitError = Number(activeQuestion.timeLimit) < 5 || Number(activeQuestion.timeLimit) > 300
    ? 'Batas waktu harus 5 sampai 300 detik.'
    : '';
  const answerErrors = activeQuestion.answers.map((answer, index) => (
    (submitted || touched[`answer-${activeQuestionIndex}-${index}`]) && !answer.trim()
      ? `Jawaban ${['A', 'B', 'C', 'D'][index]} wajib diisi.`
      : ''
  ));
  const areQuestionsValid = questions.every((item) => (
    item.text.trim()
    && item.answers.every((answer) => answer.trim())
    && Number(item.timeLimit) >= 5
    && Number(item.timeLimit) <= 300
  ));
  const canSave = title.trim() && title.trim().length <= MAX_TITLE_LENGTH && areQuestionsValid && !imageError;

  const updateActiveQuestion = (changes) => {
    setQuestions((current) => current.map((item, index) => (
      index === activeQuestionIndex ? { ...item, ...changes } : item
    )));
  };

  const handleAnswer = (answerIndex, value) => {
    updateActiveQuestion({
      answers: activeQuestion.answers.map((answer, index) => (index === answerIndex ? value : answer)),
    });
  };

  const handleQuestionImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Gambar harus JPG, PNG, WEBP, atau GIF.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Ukuran gambar maksimal 2 MB.');
      return;
    }

    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      updateActiveQuestion({ image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddQuestion = () => {
    setQuestions((current) => [...current, createEmptyQuestion()]);
    setActiveQuestionIndex(questions.length);
    setTouched({});
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave) {
      return;
    }
    const saved = await onSaveQuiz(quiz.id, {
      title: title.trim(),
      questions: questions.map((item) => ({
        text: item.text.trim(),
        image: item.image || '',
        answers: item.answers.map((answer) => answer.trim()),
        correct: item.correct,
        timeLimit: Number(item.timeLimit) || 10,
      })),
    });
    if (saved) {
      onNavigate('dashboard');
    } else {
      setSaveError('Kuis belum berhasil disimpan. Periksa koneksi backend.');
    }
  };

  return (
    <section className="page editor-page classroom-page">
      <form className="editor-form" onSubmit={handleSubmit} noValidate>
        <header className="editor-header">
          <Brand />
          <div className="editor-title-field">
            <input
              className={titleError ? 'input-error' : ''}
              value={title}
              onBlur={() => setTouched((current) => ({ ...current, title: true }))}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masukan Judul disini"
            />
            <button className="editor-gear" type="button" onClick={() => setShowProperties(true)} aria-label="Properti soal"><FaCog /></button>
            <FieldError message={titleError} />
          </div>
          <button className="secondary-button" type="button" onClick={() => onNavigate('dashboard')}>Batal</button>
          <button className={`save-button ${!canSave ? 'is-disabled' : ''}`} disabled={!canSave} type="submit">Simpan</button>
          <FieldError message={saveError} />
        </header>

        <div className="editor-body">
          <aside className="question-sidebar">
            {questions.map((item, index) => (
              <button
                className={`question-tab ${activeQuestionIndex === index ? 'active' : ''}`}
                key={`question-${index + 1}`}
                type="button"
                onClick={() => {
                  setActiveQuestionIndex(index);
                  setTouched({});
                  setSubmitted(false);
                  setImageError('');
                }}
              >
                Soal {index + 1}
              </button>
            ))}
            <button className="add-question-button" type="button" onClick={handleAddQuestion}>Tambahkan</button>
          </aside>

          <section className="question-canvas">
            <textarea
              className={questionError ? 'input-error' : ''}
              value={activeQuestion.text}
              onBlur={() => setTouched((current) => ({ ...current, [`question-${activeQuestionIndex}`]: true }))}
              onChange={(event) => updateActiveQuestion({ text: event.target.value })}
              placeholder="Mulai tulis soal"
            />
            <FieldError message={questionError} />
            <div className={`image-upload ${activeQuestion.image ? 'has-image' : ''}`}>
              {activeQuestion.image ? (
                <>
                  <img src={activeQuestion.image} alt="Gambar soal" />
                  <button className="remove-image-button" type="button" onClick={() => { updateActiveQuestion({ image: '' }); setImageError(''); }} aria-label="Hapus gambar"><FaTimes /></button>
                </>
              ) : (
                <label className="image-button">
                  <input type="file" accept="image/*" onChange={handleQuestionImage} />
                  <FaPlus />
                  Tambah Gambar
                </label>
              )}
            </div>
            <FieldError message={imageError} />

            <div className="answer-grid">
              {['A', 'B', 'C', 'D'].map((option, index) => (
                <label key={option}>
                  <span><input checked={activeQuestion.correct === option} onChange={() => updateActiveQuestion({ correct: option })} type="radio" name={`correct-${activeQuestionIndex}`} /> {option}</span>
                  <input
                    className={answerErrors[index] ? 'input-error' : ''}
                    value={activeQuestion.answers[index]}
                    onBlur={() => setTouched((current) => ({ ...current, [`answer-${activeQuestionIndex}-${index}`]: true }))}
                    onChange={(event) => handleAnswer(index, event.target.value)}
                    placeholder="Tambahkan jawaban"
                  />
                  <FieldError message={answerErrors[index]} />
                </label>
              ))}
            </div>
          </section>

          {showProperties && (
            <aside className="properties-panel">
              <button className="properties-close" type="button" onClick={() => setShowProperties(false)} aria-label="Tutup properti"><FaTimes /></button>
              <h2>Properti soal</h2>
              <label>Batas waktu</label>
              <select value={activeQuestion.timeLimit} onChange={(event) => updateActiveQuestion({ timeLimit: Number(event.target.value) })}>
                <option value="10">10 detik</option>
                <option value="15">15 detik</option>
                <option value="20">20 detik</option>
                <option value="30">30 detik</option>
              </select>
              <FieldError message={timeLimitError} />
            </aside>
          )}
        </div>
      </form>
    </section>
  );
}

function LiveCreatingPage({ onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1300);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <section className="page live-page live-creating-page">
      <div className="live-status-card">Membuat Pin Kuis.</div>
    </section>
  );
}

function LiveWaitingPage({ pin, quiz, participants, onStart }) {
  return (
    <section className="page live-page live-host-page">
      <div className="live-pin-card">Bergabung kuis dengan Pin {pin}</div>
      <div className="live-waiting-label">Menunggu Peserta</div>
      <div className="participant-list">
        {participants.map((participant) => (
          <div className="participant-item" key={participant.id}>
            <FaUserCircle />
            <strong>{participant.name}</strong>
          </div>
        ))}
        {!participants.length && <p className="live-question-count">Belum ada peserta yang masuk.</p>}
      </div>
      <p className="live-question-count">{quiz.questions.length || 1} pertanyaan siap</p>
      <button className={`live-start-button ${!participants.length ? 'is-disabled' : ''}`} disabled={!participants.length} type="button" onClick={onStart}>Mulai</button>
    </section>
  );
}

function HostMonitorPage({ quiz, participants, onFinish }) {
  const totalQuestions = quiz?.questions.length || participants[0]?.total_questions || 0;
  const completedCount = participants.filter((participant) => (
    (participant.answered_count || 0) >= totalQuestions && totalQuestions > 0
  )).length;

  return (
    <section className="page live-page host-monitor-page">
      <div className="host-monitor-card">
        <header className="host-monitor-header">
          <div>
            <span>Live kuis sedang berjalan</span>
            <h1>{quiz?.title || 'Kuis'}</h1>
            <p>{participants.length} peserta bergabung - {completedCount} selesai</p>
          </div>
          <button type="button" onClick={onFinish}>Selesai & lihat hasil</button>
        </header>

        <div className="monitor-table">
          <div className="monitor-row head">
            <strong>Peserta</strong>
            <strong>Dikerjakan</strong>
            <strong>Benar</strong>
            <strong>Salah</strong>
            <strong>Progres</strong>
          </div>
          {participants.map((participant) => {
            const answered = participant.answered_count || 0;
            const correct = participant.correct_count ?? participant.score ?? 0;
            const wrong = participant.wrong_count ?? Math.max(0, answered - correct);
            const percent = participant.progress_percent ?? (totalQuestions ? Math.round((answered / totalQuestions) * 100) : 0);

            return (
              <div className="monitor-row" key={participant.id}>
                <strong>{participant.name}</strong>
                <span>{answered}/{totalQuestions || '-'}</span>
                <span className="correct-count">{correct}</span>
                <span className="wrong-count">{wrong}</span>
                <div className="progress-cell">
                  <div className="progress-track"><span style={{ width: `${Math.min(100, percent)}%` }} /></div>
                  <small>{percent}%</small>
                </div>
              </div>
            );
          })}
          {!participants.length && (
            <p className="monitor-empty">Belum ada peserta yang mengerjakan.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function PlayPage({ quiz, onComplete, participantName, onSubmitAnswer }) {
  const fallback = starterQuizzes[0].questions[0];
  const quizQuestions = quiz?.questions.length ? quiz.questions : [fallback];
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const question = quizQuestions[activeQuestionIndex] || fallback;
  const [showIntro, setShowIntro] = useState(true);
  const [seconds, setSeconds] = useState(question.timeLimit || 10);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setShowIntro(true);
    setSeconds(question.timeLimit || 10);
    setSelectedAnswer('');
    setTimeUp(false);
    const introTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, 1400);

    return () => window.clearTimeout(introTimer);
  }, [activeQuestionIndex, question.text, question.timeLimit]);

  useEffect(() => {
    if (showIntro || selectedAnswer || timeUp) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setTimeUp(true);
          return 1;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showIntro, selectedAnswer, timeUp]);

  const isCorrect = selectedAnswer === question.correct;
  const goToNextQuestion = () => {
    if (activeQuestionIndex < quizQuestions.length - 1) {
      setActiveQuestionIndex((current) => current + 1);
      return;
    }

    onComplete();
  };

  const handleSelectAnswer = async (option) => {
    setSelectedAnswer(option);
    if (question.id) {
      await onSubmitAnswer(question.id, option);
    }
    window.setTimeout(goToNextQuestion, 1200);
  };

  useEffect(() => {
    if (!timeUp || selectedAnswer) {
      return undefined;
    }

    const nextTimer = window.setTimeout(goToNextQuestion, 1000);
    return () => window.clearTimeout(nextTimer);
  }, [timeUp, selectedAnswer]);

  return (
    <section className="page play-page classroom-scene">
      <button className="result-shortcut" type="button" onClick={onComplete}>Lihat Hasil</button>
      {showIntro ? (
        <div className="question-intro">Pertanyaan {activeQuestionIndex + 1}...</div>
      ) : (
        <>
          <div className="countdown">{seconds}</div>
          <article className="play-question">{question.text}</article>
          {question.image && (
            <figure className="play-question-image">
              <img src={question.image} alt="Gambar soal" />
            </figure>
          )}
          <div className="play-options">
            {question.answers.map((answer, index) => (
              <button
                className={[
                  selectedAnswer === ['A', 'B', 'C', 'D'][index] ? 'is-selected' : '',
                  selectedAnswer === ['A', 'B', 'C', 'D'][index] && isCorrect ? 'is-correct' : '',
                  selectedAnswer === ['A', 'B', 'C', 'D'][index] && !isCorrect ? 'is-wrong' : '',
                ].filter(Boolean).join(' ')}
                disabled={Boolean(selectedAnswer) || timeUp}
                type="button"
                key={`${['A', 'B', 'C', 'D'][index]}-${answer}`}
                onClick={() => handleSelectAnswer(['A', 'B', 'C', 'D'][index])}
              >
                <span>{['A', 'B', 'C', 'D'][index]}</span>
                {answer}
              </button>
            ))}
          </div>
          <p className="answer-feedback">
            {selectedAnswer && `${participantName || 'Peserta'} memilih jawaban ${selectedAnswer}. ${isCorrect ? 'Benar!' : 'Belum tepat.'}`}
            {!selectedAnswer && timeUp && 'Waktu habis. Jawaban tidak terkirim.'}
          </p>
        </>
      )}
    </section>
  );
}

function ResultPage({ onNavigate, leaderboard }) {
  const topScores = leaderboard.length ? leaderboard.slice(0, 3) : [
    { id: 'empty-1', name: 'Belum ada hasil', score: 0 },
  ];

  return (
    <section className="page result-page classroom-page">
      <button className="back-home" type="button" onClick={() => onNavigate('home')}>Kembali ke beranda</button>
      <div className="score-board">
        {topScores.map((participant, index) => (
          <div className={`score-bar ${['red', 'blue', 'green'][index] || 'blue'}`} key={participant.id} style={{ height: `${Math.max(100, 90 + participant.score * 45)}px` }}>
            <span>{participant.name} ({participant.score})</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const initialPage = window.history.state?.smartqPage || 'home';
  const [page, setPageState] = useState(initialPage);
  const [quizzes, setQuizzes] = useState([]);
  const [activePanel, setActivePanel] = useState('beranda');
  const [activeQuizId, setActiveQuizId] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningQuizId, setAssigningQuizId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [participantPin, setParticipantPin] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [livePin, setLivePin] = useState('');
  const [liveParticipants, setLiveParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(window.localStorage.getItem('smartq-session') || 'null'));
  const [quizRole, setQuizRole] = useState('');

  const activeQuiz = quizzes.find((quiz) => quiz.id === activeQuizId) || quizzes[0];
  const assigningQuiz = quizzes.find((quiz) => quiz.id === assigningQuizId);

  const navigateTo = (target, options = {}) => {
    setPageState(target);
    const nextState = { ...(window.history.state || {}), smartqPage: target };
    if (options.replace) {
      window.history.replaceState(nextState, '', window.location.href);
      return;
    }
    window.history.pushState(nextState, '', window.location.href);
  };

  useEffect(() => {
    if (!window.history.state?.smartqPage) {
      window.history.replaceState({ ...(window.history.state || {}), smartqPage: page }, '', window.location.href);
    }

    const handlePopState = (event) => {
      setPageState(event.state?.smartqPage || 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setQuizzes([]);
      setAssignments([]);
      return undefined;
    }

    let isMounted = true;

    const loadQuizzes = async () => {
      try {
        const payload = await requestJson('/api/quizzes');
        const backendQuizzes = Array.isArray(payload?.data) ? payload.data : [];

        if (!isMounted) {
          return;
        }

        setQuizzes(backendQuizzes.map(normalizeBackendQuiz));
        if (!backendQuizzes.length) {
          setActiveQuizId('');
          return;
        }

        setActiveQuizId((current) => (
          backendQuizzes.some((quiz) => String(quiz.id) === String(current))
            ? String(current)
            : String(backendQuizzes[0].id)
        ));
      } catch (error) {
        console.info('Data kuis belum dapat dimuat.', error);
        if (error.status === 401) {
          window.localStorage.removeItem('smartq-session');
          setCurrentUser(null);
          navigateTo('login', { replace: true });
        }
      }
    };

    loadQuizzes();

    const loadAssignments = async () => {
      try {
        const payload = await requestJson('/api/assignments');
        if (isMounted) {
          setAssignments((payload.data || []).map(normalizeBackendAssignment));
        }
      } catch (error) {
        console.info('Data tugas belum dapat dimuat.', error);
      }
    };

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleAuthenticate = (user) => {
    window.localStorage.setItem('smartq-session', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await requestJson('/api/auth/logout', { method: 'POST' });
    } catch {
      // Sesi lokal tetap dibersihkan saat server tidak dapat dijangkau.
    }
    window.localStorage.removeItem('smartq-session');
    setCurrentUser(null);
    setActiveQuizId('');
    navigateTo('home');
  };

  const clearExpiredSession = () => {
    window.localStorage.removeItem('smartq-session');
    setCurrentUser(null);
    setActiveQuizId('');
    setShowCreateModal(false);
    navigateTo('login', { replace: true });
  };

  const handleCreateQuiz = async ({ title, category }) => {
    const quizTitle = title || `Soal Quiz ${quizzes.length + 1}`;
    try {
      const payload = await requestJson('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: quizTitle,
          category,
        }),
      });

      const quiz = normalizeBackendQuiz(payload.data);
      setQuizzes((current) => [quiz, ...current]);
      setActiveQuizId(quiz.id);
      setShowCreateModal(false);
      navigateTo('editor');
      return { ok: true };
    } catch (error) {
      console.info('Kuis belum berhasil dibuat.', error);
      if (error.status === 401) {
        clearExpiredSession();
        return { ok: false, message: 'Sesi sudah berakhir. Silakan masuk kembali.' };
      }
      return { ok: false, message: error.message || 'Kuis belum berhasil dibuat.' };
    }
  };

  const handleEditQuiz = (id) => {
    setActiveQuizId(id);
    navigateTo('editor');
  };

  const handleStartLive = async (id) => {
    setActiveQuizId(id);
    setParticipantId('');
    setParticipantName('');
    setQuizRole('host');
    try {
      const opened = await requestJson(`/api/quizzes/${id}/open`, { method: 'PUT' });
      const openedQuiz = normalizeBackendQuiz(opened.data);
      setQuizzes((current) => current.map((item) => item.id === id ? openedQuiz : item));
      setLivePin(openedQuiz.pin || '');
      setLiveParticipants([]);
      navigateTo('live-creating');
    } catch (error) {
      console.info('Ruang live belum dapat dibuka.', error);
      setLiveParticipants([]);
    }
  };

  const handleAssignQuiz = (id) => {
    setAssigningQuizId(id);
  };

  const handleCreateAssignment = async (assignment) => {
    try {
      const payload = await requestJson('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          quiz_id: assignment.quizId,
          deadline: assignment.deadline,
          host: currentUser?.name || 'Pengajar',
        }),
      });
      setAssignments((current) => [normalizeBackendAssignment(payload.data), ...current]);
      setAssigningQuizId('');
      setActivePanel('laporan');
      return true;
    } catch (error) {
      console.info('Tugas belum dapat disimpan ke backend.', error);
      return false;
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Hapus kuis ini beserta seluruh soal dan hasilnya?')) {
      return;
    }

    if (isBackendId(id)) {
      try {
        await requestJson(`/api/quizzes/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.info('Kuis belum berhasil dihapus.', error);
        return;
      }
    }

    setQuizzes((current) => {
      const nextQuizzes = current.filter((quiz) => quiz.id !== id);

      if (activeQuizId === id) {
        setActiveQuizId(nextQuizzes[0]?.id || '');
      }

      return nextQuizzes;
    });
  };

  const handleJoinQuiz = async (pin) => {
    try {
      const payload = await requestJson(`/api/quizzes/pin/${pin}`);
      const quiz = normalizeBackendQuiz(payload.data);
      setQuizzes((current) => [quiz, ...current.filter((item) => item.id !== quiz.id)]);
      setActiveQuizId(quiz.id);
      setParticipantPin(pin);
      setQuizRole('participant');
      navigateTo('participant-name');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: 'PIN kuis tidak ditemukan.' };
    }
  };

  const handleStartQuiz = async (name) => {
    if (!isBackendId(activeQuizId)) {
      return { ok: false, message: 'Kuis belum tersimpan di backend.' };
    }

    try {
      const payload = await requestJson(`/api/quizzes/${activeQuizId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const quiz = normalizeBackendQuiz(payload.data.quiz);
      setQuizzes((current) => [quiz, ...current.filter((item) => item.id !== quiz.id)]);
      setParticipantName(name);
      setParticipantId(String(payload.data.participant.id));
      navigateTo('participant-waiting');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: 'Peserta belum bisa bergabung ke kuis.' };
    }
  };

  const handleSaveQuiz = async (quizId, payload) => {
    const currentQuiz = quizzes.find((quiz) => quiz.id === quizId);

    if (isBackendId(quizId)) {
      try {
        const response = await requestJson(`/api/quizzes/${quizId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: payload.title || currentQuiz?.title || 'Soal Quiz',
            category: currentQuiz?.category || 'Layanan Web',
            questions: payload.questions,
          }),
        });
        const savedQuiz = normalizeBackendQuiz(response.data);
        setQuizzes((current) => current.map((quiz) => (quiz.id === quizId ? savedQuiz : quiz)));
        return true;
      } catch (error) {
        console.info('Perubahan kuis belum berhasil disimpan.', error);
        return false;
      }
    }
    return false;
  };

  const handleHostStart = async () => {
    if (!liveParticipants.length) {
      return;
    }
    try {
      const payload = await requestJson(`/api/quizzes/${activeQuizId}/start`, { method: 'PUT' });
      const startedQuiz = normalizeBackendQuiz(payload.data);
      setQuizzes((current) => current.map((quiz) => quiz.id === activeQuizId ? startedQuiz : quiz));
      navigateTo('host-monitor');
    } catch (error) {
      console.info('Kuis belum berhasil dimulai.', error);
    }
  };

  const handleCompleteQuiz = async () => {
    if (quizRole === 'host' && isBackendId(activeQuizId)) {
      try {
        await requestJson(`/api/quizzes/${activeQuizId}/finish`, { method: 'PUT' });
      } catch (error) {
        console.info('Status selesai belum dapat disimpan.', error);
      }
    }
    navigateTo('result');
  };

  const handleSubmitAnswer = async (questionId, selectedOption) => {
    if (!isBackendId(activeQuizId) || !participantId) {
      return;
    }

    try {
      await requestJson(`/api/quizzes/${activeQuizId}/participants/${participantId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
      });
    } catch (error) {
      console.info('Jawaban belum dapat disimpan.', error);
    }
  };

  useEffect(() => {
    if (!['live-waiting', 'host-monitor'].includes(page) || !isBackendId(activeQuizId)) {
      return undefined;
    }

    const loadParticipants = async () => {
      try {
        const payload = await requestJson(`/api/quizzes/${activeQuizId}/participants`);
        setLiveParticipants(payload.data || []);
      } catch (error) {
        console.info('Peserta live belum dapat dimuat.', error);
      }
    };

    loadParticipants();
    const timer = window.setInterval(loadParticipants, 3000);
    return () => window.clearInterval(timer);
  }, [page, activeQuizId]);

  useEffect(() => {
    if (page !== 'result' || !isBackendId(activeQuizId)) {
      return;
    }

    requestJson(`/api/quizzes/${activeQuizId}/leaderboard`)
      .then((payload) => setLeaderboard(payload.data || []))
      .catch((error) => console.info('Leaderboard belum dapat dimuat.', error));
  }, [page, activeQuizId]);

  return (
    <>
      {page === 'home' && (
        <HomePage
          onNavigate={(target) => navigateTo(target === 'login' && currentUser ? 'dashboard' : target)}
          onJoin={handleJoinQuiz}
        />
      )}
      {page === 'participant-name' && <ParticipantNamePage pin={participantPin} onStart={handleStartQuiz} />}
      {page === 'login' && <AuthPage mode="login" onNavigate={navigateTo} onAuthenticate={handleAuthenticate} />}
      {page === 'register' && <AuthPage mode="register" onNavigate={navigateTo} onAuthenticate={handleAuthenticate} />}
      {page === 'dashboard' && (
        <DashboardPage
          quizzes={quizzes}
          assignments={assignments}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onCreate={() => setShowCreateModal(true)}
          onEdit={handleEditQuiz}
          onStartLive={handleStartLive}
          onAssign={handleAssignQuiz}
          onDelete={handleDeleteQuiz}
          onLogout={handleLogout}
        />
      )}
      {page === 'participant-waiting' && <ParticipantWaitingPage pin={participantPin} participantName={participantName} onReady={() => navigateTo('play', { replace: true })} />}
      {page === 'live-creating' && <LiveCreatingPage onDone={() => navigateTo('live-waiting', { replace: true })} />}
      {page === 'live-waiting' && <LiveWaitingPage pin={livePin} quiz={activeQuiz} participants={liveParticipants} onStart={handleHostStart} />}
      {page === 'host-monitor' && <HostMonitorPage quiz={activeQuiz} participants={liveParticipants} onFinish={handleCompleteQuiz} />}
      {page === 'editor' && activeQuiz && <EditorPage quiz={activeQuiz} onNavigate={navigateTo} onSaveQuiz={handleSaveQuiz} />}
      {page === 'editor' && !activeQuiz && (
        <section className="page blue-page editor-loading-page">
          <div className="editor-loading-card">
            <p>Data kuis belum tersedia.</p>
            <button type="button" onClick={() => navigateTo(currentUser ? 'dashboard' : 'login')}>Kembali</button>
          </div>
        </section>
      )}
      {page === 'play' && <PlayPage quiz={activeQuiz} onComplete={handleCompleteQuiz} participantName={participantName} onSubmitAnswer={handleSubmitAnswer} />}
      {page === 'result' && <ResultPage onNavigate={navigateTo} leaderboard={leaderboard} />}
      {showCreateModal && <CreateQuizModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateQuiz} />}
      {assigningQuiz && <AssignQuizModal quiz={assigningQuiz} onClose={() => setAssigningQuizId('')} onSubmit={handleCreateAssignment} />}
    </>
  );
}
