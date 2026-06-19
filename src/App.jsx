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
const normalizeBackendQuiz = (quiz, currentQuizzes = []) => {
  const localQuiz = currentQuizzes.find((item) => String(item.id) === String(quiz.id));

  return {
    id: String(quiz.id),
    title: quiz.title,
    category: quiz.category || 'Layanan Web',
    pin: quiz.pin,
    questions: localQuiz?.questions || [],
  };
};

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request gagal: ${response.status}`);
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
const yearOptions = Array.from({ length: 7 }, (_, index) => 2026 + index);
const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1);
const hourOptions = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);

const formatDate = ({ day, month, year }) => `${day} ${monthNames[month - 1]} ${year}`;
const slugifyTitle = (title) => title.replace(/\s+/g, '').replace(/[^\w]/g, '') || 'soalQuiz';

function FieldError({ message }) {
  return message ? <p className="field-error">{message}</p> : null;
}

function HomePage({ onNavigate, onJoin }) {
  const [pin, setPin] = useState('109276');
  const [submitted, setSubmitted] = useState(false);

  const pinError = submitted
    ? !pin.trim()
      ? 'PIN soal wajib diisi.'
      : pin.length < 4
        ? 'PIN minimal 4 digit.'
        : ''
    : '';

  const handlePin = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!pin.trim() || pin.length < 4) {
      return;
    }
    onJoin(pin);
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
            className={pinError ? 'input-error' : ''}
            value={pin}
            onChange={(event) => {
              setPin(event.target.value.replace(/\D/g, '').slice(0, 6));
              if (submitted) {
                setSubmitted(false);
              }
            }}
            placeholder="Pin Soal"
            inputMode="numeric"
          />
          <FieldError message={pinError} />
          <button className={pin.length < 4 ? 'is-disabled' : ''} type="submit">Masuk</button>
        </form>
      </div>
    </section>
  );
}

function ParticipantNamePage({ onStart }) {
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted
    ? !nickname.trim()
      ? 'Nama panggilan wajib diisi.'
      : ''
    : '';

  const handleJoin = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!nickname.trim()) {
      return;
    }
    onStart(nickname.trim());
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
              setNickname(event.target.value);
              if (submitted) {
                setSubmitted(false);
              }
            }}
            placeholder="Nama panggilan"
          />
          <FieldError message={nameError} />
          <button className={!nickname.trim() ? 'is-disabled' : ''} type="submit">Oke, Mulai!</button>
        </form>
      </div>
    </section>
  );
}

function ParticipantWaitingPage({ pin, participantName, onReady }) {
  useEffect(() => {
    const timer = window.setTimeout(onReady, 2400);
    return () => window.clearTimeout(timer);
  }, [onReady]);

  return (
    <section className="page live-page live-wait-page">
      <div className="live-wait-card">
        <p>Anda sudah masuk, tunggu penyelenggara kuis memulai kuis!</p>
        <strong>{participantName || 'Peserta'}</strong>
        <span>PIN {pin || '109276'}</span>
      </div>
    </section>
  );
}

function AuthPage({ mode, onNavigate }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});

  const errors = {
    email: !form.email.trim()
      ? 'Email wajib diisi.'
      : !isEmailValid(form.email)
        ? 'Format email belum benar.'
        : '',
    password: !form.password
      ? 'Kata sandi wajib diisi.'
      : isRegister && form.password.length < 8
        ? 'Kata sandi minimal 8 karakter.'
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isFormValid) {
      return;
    }
    onNavigate('dashboard');
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
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Konfirmasi Kata Sandi Anda"
            />
            <FieldError message={showError('confirmPassword')} />
          </>
        )}

        <button className={`primary-button ${!isFormValid ? 'is-disabled' : ''}`} type="submit">{isRegister ? 'Daftar' : 'Masuk'}</button>

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

function DashboardPage({ quizzes, assignments, activePanel, setActivePanel, onCreate, onEdit, onStartLive, onAssign, onDelete }) {
  const [keyword, setKeyword] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');
  const [copiedValue, setCopiedValue] = useState('');

  const totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
  const finishedReports = quizzes.filter((quiz) => quiz.questions.length > 0).length;
  const filteredQuizzes = quizzes.filter((quiz) => quiz.title.toLowerCase().includes(keyword.toLowerCase()));

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
          <FaUserCircle className="profile-icon" aria-label="Profil pengajar" />
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
                  <strong>{totalQuestions || 5} Soal</strong>
                </button>
                <button className="stat-card" type="button" onClick={() => setActivePanel('pustaka')}>
                  <h2>Dibuat Hari Ini</h2>
                  <FaPencilAlt className="stat-icon" />
                  <strong>{finishedReports || 1} Soal</strong>
                </button>
                <button className="stat-card" type="button" onClick={() => setActivePanel('laporan')}>
                  <h2>Laporan Selesai</h2>
                  <FaChartBar className="stat-icon" />
                  <strong>{finishedReports || 1} Laporan</strong>
                </button>
              </div>
              <article className="activity-card">
                <h2>Aktivitas Terbaru</h2>
                <p>Buat soal: {quizzes[0]?.title || 'Soal Quiz 1'}</p>
              </article>
            </>
          )}

          {activePanel === 'pustaka' && (
            <>
              <input className="search-input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cari" />
              <div className="quiz-table">
                <div className="quiz-row head"><strong>Judul</strong><strong>Aksi</strong></div>
                {filteredQuizzes.map((quiz) => (
                  <div className="quiz-row" key={quiz.id}>
                    <span>{quiz.title}</span>
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
              {!assignments.length && Object.entries(groupedReports).map(([category, count]) => (
                <article className="report-card" key={category}>
                  <h3>{category}</h3>
                  <strong>{count ? `${count} Soal Tersedia` : 'Belum Tersedia Soal'}</strong>
                  <button type="button" onClick={() => setActivePanel('pustaka')}>Lihat Selengkapnya</button>
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
  const hasCategory = Boolean(category || newCategory.trim());
  const canSubmit = hasCategory;
  const categoryError = submitted && !hasCategory ? 'Kategori kuis wajib dipilih atau ditambahkan.' : '';

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) {
      return;
    }
    onSubmit({
      category: newCategory.trim() || category,
    });
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
          <input className={categoryError ? 'input-error' : ''} value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Tambah Kategori" />
          <button className="add-category-button" type="button" onClick={() => setCategory('')} aria-label="Tambah kategori"><FaPlus /></button>
        </div>
        <FieldError message={categoryError} />
        <button className={!canSubmit ? 'is-disabled' : ''} type="submit">Lanjutkan membuat soal <FaArrowRight /></button>
        <button className="modal-close" type="button" onClick={onClose}>Batalkan</button>
      </form>
    </div>
  );
}

function AssignQuizModal({ quiz, onClose, onSubmit }) {
  const [deadline, setDeadline] = useState({
    day: 26,
    month: 4,
    year: 2026,
    hour: '23:00',
  });

  const updateDeadline = (field, value) => {
    setDeadline((current) => ({
      ...current,
      [field]: field === 'day' || field === 'month' || field === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      quizId: quiz.id,
      title: quiz.title,
      endDate: formatDate(deadline),
      endTime: deadline.hour,
    });
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
  const activeQuestion = questions[activeQuestionIndex] || questions[0];

  const titleError = (submitted || touched.title) && !title.trim() ? 'Judul kuis wajib diisi.' : '';
  const questionError = (submitted || touched[`question-${activeQuestionIndex}`]) && !activeQuestion.text.trim() ? 'Pertanyaan wajib diisi.' : '';
  const answerErrors = activeQuestion.answers.map((answer, index) => (
    (submitted || touched[`answer-${activeQuestionIndex}-${index}`]) && !answer.trim()
      ? `Jawaban ${['A', 'B', 'C', 'D'][index]} wajib diisi.`
      : ''
  ));
  const areQuestionsValid = questions.every((item) => item.text.trim() && item.answers.every((answer) => answer.trim()));
  const canSave = title.trim() && areQuestionsValid;

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave) {
      return;
    }
    onSaveQuiz(quiz.id, {
      title: title.trim(),
      questions: questions.map((item) => ({
        text: item.text.trim(),
        image: item.image || '',
        answers: item.answers.map((answer) => answer.trim()),
        correct: item.correct,
        timeLimit: Number(item.timeLimit) || 10,
      })),
    });
    onNavigate('dashboard');
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masukan Judul disini"
            />
            <button className="editor-gear" type="button" onClick={() => setShowProperties(true)} aria-label="Properti soal"><FaCog /></button>
            <FieldError message={titleError} />
          </div>
          <button className="secondary-button" type="button" onClick={() => onNavigate('dashboard')}>Batal</button>
          <button className={`save-button ${!canSave ? 'is-disabled' : ''}`} type="submit">Simpan</button>
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
                  <button className="remove-image-button" type="button" onClick={() => updateActiveQuestion({ image: '' })} aria-label="Hapus gambar"><FaTimes /></button>
                </>
              ) : (
                <label className="image-button">
                  <input type="file" accept="image/*" onChange={handleQuestionImage} />
                  <FaPlus />
                  Tambah Gambar
                </label>
              )}
            </div>

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

function LiveWaitingPage({ pin, quiz, onStart }) {
  const participants = ['Wisnu', 'Kejora', 'Bintang'];

  return (
    <section className="page live-page live-host-page">
      <div className="live-pin-card">Bergabung kuis dengan Pin {pin}</div>
      <div className="live-waiting-label">Menunggu Peserta</div>
      <div className="participant-list">
        {participants.map((name) => (
          <div className="participant-item" key={name}>
            <FaUserCircle />
            <strong>{name}</strong>
          </div>
        ))}
      </div>
      <p className="live-question-count">{quiz.questions.length || 1} pertanyaan siap</p>
      <button className="live-start-button" type="button" onClick={onStart}>Mulai</button>
    </section>
  );
}

function PlayPage({ quiz, onNavigate, participantName }) {
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

    onNavigate('result');
  };

  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);
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
      <button className="result-shortcut" type="button" onClick={() => onNavigate('result')}>Lihat Hasil</button>
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

function ResultPage({ onNavigate }) {
  return (
    <section className="page result-page classroom-page">
      <button className="back-home" type="button" onClick={() => onNavigate('home')}>Kembali ke beranda</button>
      <div className="score-board">
        <div className="score-bar red"><span>Kejora</span></div>
        <div className="score-bar blue"><span>Wisnu</span></div>
        <div className="score-bar green"><span>Bintang</span></div>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [quizzes, setQuizzes] = useState(starterQuizzes);
  const [activePanel, setActivePanel] = useState('beranda');
  const [activeQuizId, setActiveQuizId] = useState(starterQuizzes[0].id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningQuizId, setAssigningQuizId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [participantPin, setParticipantPin] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [livePin, setLivePin] = useState('109276');

  const activeQuiz = quizzes.find((quiz) => quiz.id === activeQuizId) || quizzes[0];
  const assigningQuiz = quizzes.find((quiz) => quiz.id === assigningQuizId);

  useEffect(() => {
    let isMounted = true;

    const loadQuizzes = async () => {
      try {
        const payload = await requestJson('/api/quizzes');
        const backendQuizzes = Array.isArray(payload?.data) ? payload.data : [];

        if (!isMounted || !backendQuizzes.length) {
          return;
        }

        setQuizzes((current) => backendQuizzes.map((quiz) => normalizeBackendQuiz(quiz, current)));
        setActiveQuizId((current) => (
          backendQuizzes.some((quiz) => String(quiz.id) === String(current))
            ? String(current)
            : String(backendQuizzes[0].id)
        ));
      } catch (error) {
        console.info('Backend kuis belum tersedia, memakai data lokal.', error);
      }
    };

    loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateQuiz = async ({ title, category }) => {
    const quizTitle = title || `Soal Quiz ${quizzes.length + 1}`;
    const localQuiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      category,
      questions: [],
    };

    let quiz = localQuiz;

    try {
      const payload = await requestJson('/api/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title: quizTitle,
          category,
        }),
      });

      if (payload?.data) {
        quiz = normalizeBackendQuiz(payload.data);
      }
    } catch (error) {
      console.info('Kuis disimpan lokal karena backend belum tersedia.', error);
    }

    setQuizzes((current) => [quiz, ...current]);
    setActiveQuizId(quiz.id);
    setShowCreateModal(false);
    setPage('editor');
  };

  const handleEditQuiz = (id) => {
    setActiveQuizId(id);
    setPage('editor');
  };

  const handleStartLive = (id) => {
    setActiveQuizId(id);
    setLivePin(String(Math.floor(100000 + Math.random() * 900000)));
    setPage('live-creating');
  };

  const handleAssignQuiz = (id) => {
    setAssigningQuizId(id);
  };

  const handleCreateAssignment = (assignment) => {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const startDate = formatDate({ day: 22, month: 4, year: 2026 });

    setAssignments((current) => [
      {
        id: `assignment-${Date.now()}`,
        ...assignment,
        host: 'Wisnu',
        startDate,
        pin,
        url: `https://smartq/${slugifyTitle(assignment.title)}`,
      },
      ...current,
    ]);
    setAssigningQuizId('');
    setActivePanel('laporan');
  };

  const handleDeleteQuiz = async (id) => {
    if (isBackendId(id)) {
      try {
        await requestJson(`/api/quizzes/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.info('Kuis dihapus lokal karena backend belum tersedia.', error);
      }
    }

    setQuizzes((current) => {
      const nextQuizzes = current.filter((quiz) => quiz.id !== id);

      if (activeQuizId === id) {
        setActiveQuizId(nextQuizzes[0]?.id || starterQuizzes[0].id);
      }

      return nextQuizzes;
    });
  };

  const handleJoinQuiz = (pin) => {
    setParticipantPin(pin);
    setPage('participant-name');
  };

  const handleStartQuiz = (name) => {
    setParticipantName(name);
    setPage('participant-waiting');
  };

  const handleSaveQuiz = async (quizId, payload) => {
    const currentQuiz = quizzes.find((quiz) => quiz.id === quizId);

    if (isBackendId(quizId)) {
      try {
        await requestJson(`/api/quizzes/${quizId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: payload.title || currentQuiz?.title || 'Soal Quiz',
            category: currentQuiz?.category || 'Layanan Web',
          }),
        });
      } catch (error) {
        console.info('Perubahan metadata kuis disimpan lokal karena backend belum tersedia.', error);
      }
    }

    setQuizzes((current) => current.map((quiz) => {
      if (quiz.id !== quizId) {
        return quiz;
      }

      return {
        ...quiz,
        title: payload.title || quiz.title,
        questions: payload.questions,
      };
    }));
  };

  return (
    <>
      {page === 'home' && <HomePage onNavigate={setPage} onJoin={handleJoinQuiz} />}
      {page === 'participant-name' && <ParticipantNamePage pin={participantPin} onStart={handleStartQuiz} />}
      {page === 'login' && <AuthPage mode="login" onNavigate={setPage} />}
      {page === 'register' && <AuthPage mode="register" onNavigate={setPage} />}
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
        />
      )}
      {page === 'participant-waiting' && <ParticipantWaitingPage pin={participantPin} participantName={participantName} onReady={() => setPage('play')} />}
      {page === 'live-creating' && <LiveCreatingPage onDone={() => setPage('live-waiting')} />}
      {page === 'live-waiting' && <LiveWaitingPage pin={livePin} quiz={activeQuiz} onStart={() => setPage('play')} />}
      {page === 'editor' && <EditorPage quiz={activeQuiz} onNavigate={setPage} onSaveQuiz={handleSaveQuiz} />}
      {page === 'play' && <PlayPage quiz={activeQuiz} onNavigate={setPage} participantName={participantName} />}
      {page === 'result' && <ResultPage onNavigate={setPage} />}
      {showCreateModal && <CreateQuizModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateQuiz} />}
      {assigningQuiz && <AssignQuizModal quiz={assigningQuiz} onClose={() => setAssigningQuizId('')} onSubmit={handleCreateAssignment} />}
    </>
  );
}
